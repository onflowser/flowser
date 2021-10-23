import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import { Injectable } from "@nestjs/common";
import { Project } from "../../projects/entities/project.entity";
import { EmulatorConfigurationEntity } from "../../projects/entities/emulator-configuration.entity";
import { EventEmitter } from "events";
import { FlowCliConfigService } from "./flow-cli-config.service";
import { randomString } from "../../utils";

type StartCallback = (error: Error, data: string[]) => void;

export enum FlowEmulatorState {
  STOPPED = "stopped", // emulator is not running (exited or hasn't yet been started)
  STARTED = "started", // emulator has been started, but is not yet running (it may error out)
  RUNNING = "running", // emulator is safely running without initialisation errors
}

@Injectable()
export class FlowEmulatorService {

  public events: EventEmitter = new EventEmitter();
  public state: FlowEmulatorState = FlowEmulatorState.STOPPED;
  private projectId: string;
  private configuration: EmulatorConfigurationEntity;
  private emulatorProcess: ChildProcessWithoutNullStreams;

  constructor (private flowCliConfig: FlowCliConfigService) {}

  configureProjectContext(project: Project) {
    this.projectId = project?.id;
    this.configuration = project.emulator;
    this.flowCliConfig.configure(this.projectId);
  }

  private setState(state: FlowEmulatorState) {
    console.log("[Flowser] emulator state changed: ", state)
    this.events.emit(state);
    this.state = state;
  }

  private isState(state: FlowEmulatorState) {
    return this.state === state;
  }

  async init() {
    console.log(`[Flowser] initialising emulator for project: ${this.projectId}`)
    await this.flowCliConfig.init();
  }

  private static flag (name: string, userValue: any, defaultValue?: any) {
    const value = userValue || defaultValue;
    return value ? `--${name}=${value}` : undefined;
  }

  private getFlags() {
    const {flag} = FlowEmulatorService;

    // https://github.com/onflow/flow-emulator#configuration
    return [
      flag("port", this.configuration.rpcServerPort),
      flag("http-port", this.configuration.httpServerPort),
      flag("block-time", this.configuration.blockTime),
      flag("service-priv-key", this.configuration.servicePrivateKey),
      flag("service-pub-key", this.configuration.servicePublicKey),
      flag("dbpath", this.configuration.databasePath),
      flag("token-supply", this.configuration.tokenSupply),
      flag("transaction-expiry", this.configuration.transactionExpiry),
      flag("storage-per-flow", this.configuration.storagePerFlow),
      flag("min-account-balance", this.configuration.minAccountBalance),
      flag("transaction-max-gas-limit", this.configuration.transactionMaxGasLimit),
      flag("script-gas-limit", this.configuration.scriptGasLimit),
      flag("service-sig-algo", this.configuration.serviceSignatureAlgorithm),
      flag("service-hash-algo", this.configuration.serviceHashAlgorithm),
      flag("storage-limit", this.configuration.storageLimit),
      flag("transaction-fees", this.configuration.transactionFees),
      flag("dbpath", this.configuration.databasePath || this.flowCliConfig.databaseDirPath),
      flag("persist", this.configuration.persist),
      flag("verbose", this.configuration.verboseLogging),
      flag("init", true)
    ].filter(Boolean);
  }

  isRunning() {
    return (
      this.emulatorProcess &&
      [FlowEmulatorState.STARTED, FlowEmulatorState.RUNNING].includes(this.state)
    );
  }

  start (cb: StartCallback = () => null) {
    const flags = this.getFlags();
    console.log(`[Flowser] starting the emulator with (${flags.length}) flags: `, flags.join(" "))

    return new Promise(((resolve, reject) => {
      try {
        this.emulatorProcess = spawn("flow", [
          'emulator',
          ...flags
        ], {
          cwd: this.flowCliConfig.projectDirPath
        })
      } catch (e) {
        this.setState(FlowEmulatorState.STOPPED);
        cb(e, null)
        reject(e);
      }

      this.emulatorProcess.stdout.on("data", data => {
        const lines = data.toString().split("\n").filter(e => !!e)

        const lineMatch = (line, s) => line.toLowerCase().includes(s.toLowerCase());
        const linesMatch = s => Boolean(lines.find(line => lineMatch(line, s)));

        if (this.isState(FlowEmulatorState.STOPPED) && linesMatch("starting http server")) {
          // emulator is starting (could still exit due to init error)
          this.setState(FlowEmulatorState.STARTED)
        }
        // next line after "🌱  Starting HTTP server ..." is either "❗  Server error...", some other line, or no line
        else if (this.isState(FlowEmulatorState.STARTED) && !linesMatch("server error")) {
          // emulator successfully started
          this.setState(FlowEmulatorState.RUNNING)
          this.onServerRunning();
          resolve(true);
        }

        cb(null, lines)
      })

      // No data is emitted to stderr for now
      // this.emulatorProcess.stderr.on("data", data => {})

      this.emulatorProcess.on("close", code => {
        const error = new Error(`Emulator exited with code ${code}`)
        this.setState(FlowEmulatorState.STOPPED);
        cb(error, null)
        reject(error);
      })

      this.emulatorProcess.on("error", error => {
        cb(error, null)
        reject(error)
      })

      // given that no logs are emitted after "🌱  Starting HTTP server ..." line
      // assume that the server successfully started after 2s timeout
      setTimeout(resolve, 2000)
    }))
  }

  // called when emulator is up and running
  async onServerRunning() {
    if (this.configuration.numberOfInitialAccounts) {
      await this.initialiseAccounts(this.configuration.numberOfInitialAccounts)
    }
  }

  async initialiseAccounts(n: number) {
    console.debug(`[Flowser] initialising ${n} initial flow accounts...`)
    await this.flowCliConfig.load();
    const diff = n - (this.flowCliConfig.totalAccounts - 1);
    if (diff <= 0) {
      return;
    }
    for (let i = 0; i < diff; i++) {
      const {address, privateKey} = await this.createAccount();
      this.flowCliConfig.data.accounts[randomString()] = {
        key: privateKey,
        address,
      }
    }
    await this.flowCliConfig.save();
  }

  async createAccount() {
    const keysOutput = await this.execute("flow", ["keys", "generate"])
    const privateKey = keysOutput[1][1];
    const publicKey = keysOutput[2][1];
    const accountOutput = await this.execute("flow", ["accounts", "create", "--key", publicKey]);
    const address = accountOutput[1][1];
    return { address, publicKey, privateKey }
  }

  stop() {
    return new Promise(resolve => {
      console.log(`[Flowser] stopping emulator: ${this.isRunning()}`)
      if (this.isRunning()) {
        console.log(`[Flowser] stopped emulator process: ${this.emulatorProcess.pid}`)
        const isKilled = this.emulatorProcess.kill();
        // resolve only when the emulator process exits
        this.events.on(FlowEmulatorState.STOPPED, () => resolve(isKilled))
      } else {
        resolve(true);
      }
    })
  }

  private execute(bin = "", args, parsedOutput = true): Promise<string | string[][]> {
    if (!bin) {
      throw new Error("Provide a command");
    }
    return new Promise(((resolve, reject) => {
      let out = "";
      const process = spawn(bin, args, {
        cwd: this.flowCliConfig.projectDirPath
      });

      process.stdout.on("data", data => {
        out += data.toString();
      })

      process.stderr.on("data", data => {
        out += data.toString();
      })

      process.on("exit", (code) => code === 0
          ? resolve(parsedOutput ? parseOutput(out): out)
          : reject(out)
      );
    }))

    function parseOutput(out) {
      return out.split("\n").map(parseLine).filter(Boolean)
    }

    function parseLine(line) {
      const value = line.trim();
      if (/\t/.test(value)) {
        return value.split(/[ ]*\t[ ]*/);
      } else {
        return value;
      }
    }
  }

}
