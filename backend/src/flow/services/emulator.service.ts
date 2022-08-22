import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from "@nestjs/common";
import { EventEmitter } from "events";
import {
  HashAlgorithm,
  SignatureAlgorithm,
} from "@flowser/types/generated/entities/common";
import { ProjectContextLifecycle } from "../utils/project-context";
import { ProjectEntity } from "../../projects/entities/project.entity";
import { LogEntity } from "../../logs/entities/log.entity";
import { LogsService } from "../../logs/logs.service";
import { LogSource } from "@flowser/types/generated/entities/logs";

export enum FlowEmulatorState {
  STOPPED = "stopped", // emulator is not running (exited or hasn't yet been started)
  STARTED = "started", // emulator has been started, but is not yet running (it may error out)
  RUNNING = "running", // emulator is safely running without initialisation errors
}

type FlowEmulatorLog = {
  level: "debug" | "info" | "error";
  time: string;
  [key: string]: string;
};

@Injectable()
export class FlowEmulatorService implements ProjectContextLifecycle {
  private readonly logger = new Logger(FlowEmulatorService.name);
  private projectContext: ProjectEntity | undefined;

  public events: EventEmitter = new EventEmitter();
  public state: FlowEmulatorState = FlowEmulatorState.STOPPED;
  public emulatorProcess: ChildProcessWithoutNullStreams;
  public logs: string[] = [];

  constructor(private logsService: LogsService) {}

  async onEnterProjectContext(project: ProjectEntity) {
    this.projectContext = project;
    if (this.projectContext.shouldRunEmulator()) {
      await this.stop();
      try {
        await this.start();
      } catch (e: any) {
        throw new ServiceUnavailableException(
          `Can not start emulator}`,
          e.message
        );
      }
    }
  }

  async onExitProjectContext() {
    this.projectContext = undefined;
    await this.stop();
  }

  async start() {
    const flags = this.getFlags();
    this.logger.debug(
      `starting with (${flags.length}) flags: ${flags.join(" ")}`
    );

    // TODO(milestone-3): check if emulator (or any other process) is already running on emulator ports
    return new Promise((resolve, reject) => {
      try {
        this.emulatorProcess = spawn("flow", ["emulator", ...flags], {
          cwd: this.projectContext.filesystemPath,
        });
      } catch (e) {
        this.logger.debug("Failed to run emulator", e);
        this.setState(FlowEmulatorState.STOPPED);
        reject(e);
      }

      this.emulatorProcess.stdout.on("data", (data) => {
        this.handleOutput(LogSource.LOG_SOURCE_STDOUT, data);

        if (
          this.isState(FlowEmulatorState.STOPPED) &&
          this.findLog("starting")
        ) {
          // emulator is starting (could still exit due to init error)
          this.setState(FlowEmulatorState.STARTED);
          // assume that if no error is thrown in 1s, the emulator is running
          // this line is needed, because if verbose flag is not included
          // emulator may not emit any more logs in the near future
          // therefore we can't reliably tell if emulator started successfully
          setTimeout(() => {
            this.onServerRunning();
            resolve(true);
          }, 1000);
        }
        // next line after "🌱  Starting HTTP server ..." is either "❗  Server error...", some other line, or no line
        // TODO(milestone-x): logic for determining if emulator started successfully could be improved
        // https://github.com/onflowser/flowser/issues/33
        else if (
          this.isState(FlowEmulatorState.STARTED) &&
          !this.findLog("server error")
        ) {
          // emulator successfully started
          this.onServerRunning();
          resolve(true);
        }
      });

      this.emulatorProcess.stderr.on("data", (data) => {
        this.logger.debug("Emulator stderr: ", data.toString());
        this.handleOutput(LogSource.LOG_SOURCE_STDERR, data);
      });

      this.emulatorProcess.on("close", (code, signal) => {
        const error =
          this.getError() || new Error(`Emulator closed: ${code} (${signal})`);
        this.setState(FlowEmulatorState.STOPPED);
        this.logger.error("Emulator closed: " + error);
        this.printLogs();
        reject(error);
      });

      this.emulatorProcess.on("error", (error) => {
        this.logger.error("Emulator error: " + error);
        this.printLogs();
        reject(error);
      });
    });
  }

  private handleOutput(source: LogSource, data: any) {
    const lines = data
      .toString()
      .split("\n")
      .filter((e) => !!e);

    // temporarily store the logs in memory for possible examination
    this.logs.push(...lines);

    const formattedLines =
      source === LogSource.LOG_SOURCE_STDOUT
        ? FlowEmulatorService.formatLogLines(lines)
        : lines;

    formattedLines.forEach((line) => {
      return this.logsService.create(LogEntity.create(source, line));
    });
  }

  findLog(query) {
    // traverse the most recent logs first (start from the end)
    for (let i = this.logs.length - 1; i >= 0; i--) {
      const line = this.logs[i];
      if (line.toLowerCase().includes(query.toLowerCase())) {
        // a log match is found
        return line;
      }
    }
    return null;
  }

  stop() {
    return new Promise((resolve) => {
      if (this.isStarted()) {
        this.logger.debug(`stopping pid: ${this.emulatorProcess.pid}`);
        const isKilled = this.emulatorProcess.kill(); // send SIGTERM signal
        // resolve only when the emulator process exits
        this.events.on(FlowEmulatorState.STOPPED, () => {
          this.logger.debug(`Process ${this.emulatorProcess.pid} stopped`);
          resolve(isKilled);
        });
      } else {
        this.logger.debug(`already stopped, skipping`);
        resolve(true);
      }
    });
  }

  // called when emulator is up and running
  async onServerRunning() {
    // ensure correct state transition STARTED => RUNNING
    if (!this.isState(FlowEmulatorState.STARTED)) {
      return;
    }
    this.setState(FlowEmulatorState.RUNNING);
  }

  isStarted() {
    return (
      !this.emulatorProcess?.killed &&
      [FlowEmulatorState.STARTED, FlowEmulatorState.RUNNING].includes(
        this.state
      )
    );
  }

  isRunning() {
    return (
      !this.emulatorProcess?.killed && this.state === FlowEmulatorState.RUNNING
    );
  }

  public getError() {
    for (let i = this.logs.length - 1; i > 0; i--) {
      if (this.logs[i].includes("level=error")) {
        const errorLine = FlowEmulatorService.parseLogLine(this.logs[i]);
        return errorLine.error ? new Error(errorLine.error) : null;
      }
    }
    return null;
  }

  private setState(state: FlowEmulatorState) {
    this.logger.debug(`emulator state changed: ${state}`);
    this.events.emit(state);
    this.state = state;
  }

  private isState(state: FlowEmulatorState) {
    return this.state === state;
  }

  private getFlags() {
    const { flag } = FlowEmulatorService;
    const { emulator } = this.projectContext ?? {};

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
        FlowEmulatorService.formatSignatureAlgo(
          emulator.serviceSignatureAlgorithm
        )
      ),
      flag(
        "service-hash-algo",
        FlowEmulatorService.formatHashAlgo(emulator.serviceHashAlgorithm)
      ),
      flag("init", emulator.performInit),
      flag("rest-debug", emulator.enableRestDebug),
      flag("grpc-debug", emulator.enableGrpcDebug),
      flag("persist", emulator.persist),
      flag("dbpath", emulator.databasePath),
      flag("simple-addresses", emulator.useSimpleAddresses),
      flag(
        "token-supply",
        FlowEmulatorService.formatTokenSupply(emulator.tokenSupply)
      ),
      flag("transaction-expiry", emulator.transactionExpiry),
      flag("storage-limit", emulator.storageLimit),
      flag("storage-per-flow", emulator.storagePerFlow),
      flag("min-account-balance", emulator.minAccountBalance),
      flag("transaction-fees", emulator.transactionFees),
      flag("transaction-max-gas-limit", emulator.transactionMaxGasLimit),
      flag("script-gas-limit", emulator.scriptGasLimit),
    ].filter(Boolean);
  }

  static formatTokenSupply(tokenSupply: number) {
    // format to 1 decimal place precision
    return tokenSupply.toFixed(1);
  }

  static formatHashAlgo(hashAlgo: HashAlgorithm): string {
    switch (hashAlgo) {
      case HashAlgorithm.SHA2_256:
        return "SHA2_256";
      case HashAlgorithm.SHA2_384:
        return "SHA2_384";
      case HashAlgorithm.SHA3_256:
        return "SHA3_256";
      case HashAlgorithm.SHA3_384:
        return "SHA3_384";
      case HashAlgorithm.KECCAK_256:
        return "KECCAK_256";
      case HashAlgorithm.KMAC128_BLS_BLS12_381:
        return "KMAC128_BLS_BLS12_381";
      default:
        throw new Error("Hash algorithm not supported");
    }
  }

  static formatSignatureAlgo(signAlgo: SignatureAlgorithm): string {
    switch (signAlgo) {
      case SignatureAlgorithm.ECDSA_P256:
        return "ECDSA_P256";
      case SignatureAlgorithm.ECDSA_secp256k1:
        return "ECDSA_secp256k1";
      case SignatureAlgorithm.BLS_BLS12_381:
        return "BLS_BLS12_381";
      default:
        throw new Error("Signature algorithm not supported");
    }
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

  private printLogs() {
    if (this.logs.length > 0) {
      this.logger.debug("Emulator stdout: ");
      console.log(this.logs.join("\n"));
    }
  }
}
