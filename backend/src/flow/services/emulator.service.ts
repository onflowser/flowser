import { Injectable } from "@nestjs/common";
import { hashAlgorithmToJSON, signatureAlgorithmToJSON } from "@flowser/shared";
import { ProjectContextLifecycle } from "../utils/project-context";
import { ProjectEntity } from "../../projects/entities/project.entity";
import { LogsService } from "../../logs/logs.service";
import { ProcessManagerService } from "../../processes/process-manager.service";
import { ManagedProcess } from "../../processes/managed-process";

type FlowEmulatorLog = {
  level: "debug" | "info" | "error";
  time: string;
  [key: string]: string;
};

@Injectable()
export class FlowEmulatorService implements ProjectContextLifecycle {
  private readonly processId = "emulator";
  private projectContext: ProjectEntity | undefined;

  constructor(
    private logsService: LogsService,
    private processManagerService: ProcessManagerService
  ) {}

  async onEnterProjectContext(project: ProjectEntity) {
    this.projectContext = project;
    if (this.projectContext.shouldRunEmulator()) {
      await this.start();
    }
  }

  async onExitProjectContext() {
    this.projectContext = undefined;
    await this.stop();
  }

  async start() {
    const managedProcess = new ManagedProcess({
      id: this.processId,
      command: {
        name: "flow",
        args: ["emulator", ...this.getFlags()],
        options: {
          cwd: this.projectContext.filesystemPath,
        },
      },
    });
    await this.processManagerService.start(managedProcess);
  }

  async stop() {
    await this.processManagerService.stop(this.processId);
  }

  private getFlags() {
    const { flag } = FlowEmulatorService;
    const { emulator } = this.projectContext ?? {};

    const formatTokenSupply = (tokenSupply: number) => tokenSupply.toFixed(1);

    // keep those parameters up to date with the currently used flow-cli version
    // https://github.com/onflow/flow-emulator#configuration
    return [
      flag("port", emulator.grpcServerPort),
      flag("rest-port", emulator.restServerPort),
      flag("admin-port", emulator.adminServerPort),
      flag("verbose", emulator.verboseLogging),
      flag("log-format", emulator.logFormat),
      flag("block-time", emulator.blockTime),
      flag("contracts", emulator.withContracts),
      flag("service-priv-key", emulator.servicePrivateKey),
      flag("service-pub-key", emulator.servicePublicKey),
      flag(
        "service-sig-algo",
        signatureAlgorithmToJSON(emulator.serviceSignatureAlgorithm)
      ),
      flag(
        "service-hash-algo",
        hashAlgorithmToJSON(emulator.serviceHashAlgorithm)
      ),
      flag("init", emulator.performInit),
      flag("rest-debug", emulator.enableRestDebug),
      flag("grpc-debug", emulator.enableGrpcDebug),
      flag("persist", emulator.persist),
      flag("dbpath", emulator.databasePath),
      flag("simple-addresses", emulator.useSimpleAddresses),
      flag("token-supply", formatTokenSupply(emulator.tokenSupply)),
      flag("transaction-expiry", emulator.transactionExpiry),
      flag("storage-limit", emulator.storageLimit),
      flag("storage-per-flow", emulator.storagePerFlow),
      flag("min-account-balance", emulator.minAccountBalance),
      flag("transaction-fees", emulator.transactionFees),
      flag("transaction-max-gas-limit", emulator.transactionMaxGasLimit),
      flag("script-gas-limit", emulator.scriptGasLimit),
    ].filter(Boolean);
  }

  static formatLogLines(lines: string[]) {
    return (
      lines
        .map((line) => {
          let parsedLog;
          try {
            parsedLog = FlowEmulatorService.parseLogLine(line);
          } catch (e) {
            // if parse error is thrown, just ignore the error
            // and return non-formatted log line
            return line;
          }
          const { level, time, msg, ...rest } = parsedLog;
          // format example: Thu Oct 28 2021 21:20:51
          const formattedTime = new Date(time)
            .toString()
            .split(" ")
            .slice(0, 5)
            .join(" ");
          // appends the rest of the values in key="value" format
          return (
            level.toUpperCase().slice(0, 4) +
            `[${formattedTime}] ` +
            msg +
            Object.keys(rest)
              .map((key) => `${key}="${rest[key]}"`)
              .reduce((p, c) => `${p} ${c}`, "")
          );
        })
        // only include lines that do not contain API call information
        // those lines are annoying, because they show up every second (due to our backend polling)
        // TODO(milestone-x): improve API calls log filtering logic
        .filter((line) => !line.includes("called"))
    );
  }

  static parseLogLine(line: string): FlowEmulatorLog {
    const keyValuePairs = [];
    // https://regex101.com/r/gVlMZ0/1
    // tokenizes log lines into key=value pair array
    const matches = line.matchAll(/[a-z]+=("([^"]+"))|([^\s]+)/g);
    for (let [match] of matches) {
      // each match is of form key=value or key="foo bar"
      const [key, value] = match
        .toString()
        .replace(/"/g, "") // remove " chars if they exist
        // "\\x1b" or "\u001b" are ansi escape codes
        .replace(/(\u001b)|(\\x1b)\[[^m]*m/g, "") // remove ansi color escape codes (https://regex101.com/r/PoqKom/1)
        .split("="); // split into [key, value] pairs
      keyValuePairs.push({ [key]: value });
    }
    const formatted = keyValuePairs.reduce((p, c) => ({ ...p, ...c }), {});
    // this line has invalid log format
    // (probably due to incorrect usage of the CLI)
    if (
      formatted.hasOwnProperty("level") &&
      formatted.hasOwnProperty("level")
    ) {
      return formatted;
    } else {
      throw new Error("Invalid log format");
    }
  }

  private static flag(name: string, userValue: any, defaultValue?: any) {
    const value = userValue || defaultValue;
    return value ? `--${name}=${value}` : undefined;
  }
}
