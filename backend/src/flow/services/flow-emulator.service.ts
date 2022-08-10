import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import { Injectable, Logger } from "@nestjs/common";
import { ProjectEntity } from "../../projects/entities/project.entity";
import { EventEmitter } from "events";
import { FlowCliService } from "./flow-cli.service";
import { randomString } from "../../utils";
import { Emulator } from "@flowser/types/generated/entities/projects";

type StartCallback = (data: string[]) => void;

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
export class FlowEmulatorService {
  private projectId: string;
  private readonly logger = new Logger(FlowEmulatorService.name);

  public events: EventEmitter = new EventEmitter();
  public state: FlowEmulatorState = FlowEmulatorState.STOPPED;
  public emulatorConfig: Emulator;
  public emulatorProcess: ChildProcessWithoutNullStreams;
  public logs: string[] = [];

  constructor(private flowCliService: FlowCliService) {}

  configureProjectContext(project: ProjectEntity) {
    this.projectId = project?.id;
    this.emulatorConfig = project.emulator;
  }

  async init() {
    this.logger.debug(`initialising for project: ${this.projectId}`);
    await this.flowCliService.init();
  }

  async start(cb: StartCallback = () => null) {
    const flags = this.getFlags();
    this.logger.debug(
      `starting with (${flags.length}) flags: ${flags.join(" ")}`
    );

    return new Promise((resolve, reject) => {
      try {
        this.emulatorProcess = spawn("flow", ["emulator", ...flags], {
          cwd: this.flowCliService.projectDirPath,
        });
      } catch (e) {
        this.setState(FlowEmulatorState.STOPPED);
        reject(e);
      }

      this.emulatorProcess.stdout.on("data", (data) => {
        const lines = data
          .toString()
          .split("\n")
          .filter((e) => !!e);

        // temporarily store the logs in memory for possible examination
        this.logs.push(...lines);

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
        // TODO(milestone-2): logic for determining if emulator started successfully could be improved
        // https://github.com/onflowser/flowser/issues/33
        else if (
          this.isState(FlowEmulatorState.STARTED) &&
          !this.findLog("server error")
        ) {
          // emulator successfully started
          this.onServerRunning();
          resolve(true);
        }

        cb(FlowEmulatorService.formatLogLines(lines));
      });

      // No data is emitted to stderr for now
      // this.emulatorProcess.stderr.on("data", data => {})

      this.emulatorProcess.on("close", (code, signal) => {
        const error =
          this.getError() || new Error(`Emulator closed: ${code} (${signal})`);
        this.setState(FlowEmulatorState.STOPPED);
        this.logger.error(error.message);
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
    if (this.emulatorConfig.numberOfInitialAccounts) {
      try {
        await this.initialiseAccounts(
          this.emulatorConfig.numberOfInitialAccounts
        );
      } catch (e: any) {
        this.logger.error(
          `failed to initialise accounts: ${e.message || e}`,
          e.stack
        );
      }
    }
  }

  async initialiseAccounts(n: number) {
    await this.flowCliService.load();
    const diff = n - this.flowCliService.totalNonServiceAccounts;
    this.logger.debug(`generating ${diff} initial flow accounts`);
    for (let i = 0; i < diff; i++) {
      const { address, privateKey } = await this.createAccount();
      this.flowCliService.data.accounts[randomString()] = {
        key: privateKey,
        address,
      };
      this.logger.debug(`generated account: ${address}`);
    }
    await this.flowCliService.save();
  }

  async createAccount() {
    const keysOutput = await this.flowCliService.execute("flow", [
      "keys",
      "generate",
    ]);
    const privateKey = keysOutput.findValue("Private Key");
    const publicKey = keysOutput.findValue("Public Key");
    if (!privateKey) {
      throw new Error("Could not find generated private key");
    }
    if (!privateKey) {
      throw new Error("Could not find generated public key");
    }
    const accountOutput = await this.flowCliService.execute("flow", [
      "accounts",
      "create",
      "--key",
      publicKey,
    ]);
    return {
      address: accountOutput.findValue("address"),
      publicKey,
      privateKey,
    };
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

    // keep those parameters up to date with the currently used flow-cli version
    // https://github.com/onflow/flow-emulator#configuration
    return [
      flag("port", this.emulatorConfig.rpcServerPort),
      flag("http-port", this.emulatorConfig.httpServerPort),
      flag("block-time", this.emulatorConfig.blockTime),
      flag("service-priv-key", this.emulatorConfig.servicePrivateKey),
      flag("service-pub-key", this.emulatorConfig.servicePublicKey),
      flag("dbpath", this.emulatorConfig.databasePath),
      flag("token-supply", this.emulatorConfig.tokenSupply),
      flag("transaction-expiry", this.emulatorConfig.transactionExpiry),
      flag("storage-per-flow", this.emulatorConfig.storagePerFlow),
      flag("min-account-balance", this.emulatorConfig.minAccountBalance),
      flag(
        "transaction-max-gas-limit",
        this.emulatorConfig.transactionMaxGasLimit
      ),
      flag("script-gas-limit", this.emulatorConfig.scriptGasLimit),
      flag("service-sig-algo", this.emulatorConfig.serviceSignatureAlgorithm),
      flag("service-hash-algo", this.emulatorConfig.serviceHashAlgorithm),
      flag("storage-limit", this.emulatorConfig.storageLimit),
      flag("transaction-fees", this.emulatorConfig.transactionFees),
      flag(
        "dbpath",
        this.emulatorConfig.databasePath || this.flowCliService.databaseDirPath
      ),
      // flow emulator is always started with persist flag
      // this is needed, so that storage script can index the db
      flag("persist", true),
      flag("verbose", this.emulatorConfig.verboseLogging),
      flag("init", true),
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
        // TODO(milestone-2): improve API calls log filtering logic
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
