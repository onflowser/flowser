import { join } from "path";
import { mkdir, stat } from "fs/promises";
import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import { Injectable } from "@nestjs/common";
import config from "../../config";
import { Project } from "../../projects/entities/project.entity";
import { EmulatorConfigurationEntity } from "../../projects/entities/emulator-configuration.entity";

type StartCallback = (error: Error, data: string) => void;

@Injectable()
export class FlowEmulatorService {

  private projectId: string;
  private isFlowServerStarted: boolean = false;
  private configuration: EmulatorConfigurationEntity;
  private emulatorProcess: ChildProcessWithoutNullStreams;

  configureProjectContext(project: Project) {
    this.projectId = project.id;
    this.configuration = project.emulator;
  }

  projectDir () {
    return join(config.flowserRootDir, this.projectId);
  }

  databaseDir () {
    return join(this.projectDir(), "flowdb")
  }

  // create directory if it does not already exist
  static async mkdirIfEnoent(path: string) {
    try {
      await stat(path)
      console.debug(`[Flowser] directory "${path}", skipping creation.`)
    } catch (e) {
      if (e.code === "ENOENT") {
        console.debug(`[Flowser] directory "${path}" not found, creating...`)
        await mkdir(path)
      } else {
        throw e;
      }
    }
  }

  async init() {
    console.log(`[Flowser] initialising emulator for project: ${this.projectId}`)
    await FlowEmulatorService.mkdirIfEnoent(config.flowserRootDir);
    await FlowEmulatorService.mkdirIfEnoent(this.projectDir());
  }

  private static flag (name: string, userValue: any, defaultValue?: any) {
    const value = userValue || defaultValue;
    return value ? `--${name}=${value}` : undefined;
  }

  isRunning() {
    return this.emulatorProcess && !this.emulatorProcess.killed;
  }

  start (cb: StartCallback = () => null) {
    this.isFlowServerStarted = false;
    const {flag} = FlowEmulatorService;
    // DOCS: https://github.com/onflow/flow-emulator#configuration
    const flags = [
      flag("port", this.configuration.rpcServerPort),
      flag("http-port", this.configuration.httpServerPort),
      flag("block-time", this.configuration.blockTime),
      flag("service-priv-key", this.configuration.servicePrivateKey),
      flag("service-pub-key", this.configuration.servicePublicKey),
      flag("database-path", this.configuration.databasePath),
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
      flag("dbpath", this.configuration.databasePath || this.databaseDir()),
      flag("persist", this.configuration.persist),
      flag("verbose", this.configuration.verboseLogging),
      flag("init", true)
    ].filter(Boolean);

    console.log(`[Flowser] starting the emulator with (${flags.length}) flags: `, flags.join(" "))

    this.emulatorProcess = spawn("flow", [
      'emulator',
      ...flags
    ], {
      cwd: this.projectDir()
    })

    return new Promise(((resolve, reject) => {
      this.emulatorProcess.stdout.on("data", data => {
        const lines = data.toString().split("\n").filter(e => !!e)
        if (!this.isFlowServerStarted && lines.find(line => line.includes("Starting"))) {
          this.isFlowServerStarted = true;
          this.onServerStarted();
        }
        cb(null, lines)
      })

      this.emulatorProcess.stderr.on("data", data => {
        const error = data.toString();
        cb(error, null)
      })

      this.emulatorProcess.on("close", code => {
        console.log(`[Flowser] "${this.projectId}" emulator exited with code: `, code)
        resolve(code);
      })

      this.emulatorProcess.on("error", error => {
        cb(error, null)
        reject(error)
      })
    }))
  }

  // called when emulator logs "Starting gRPC/HTTP server..."
  onServerStarted() {
    if (this.configuration.numberOfInitialAccounts) {
      this.initialiseAccounts(this.configuration.numberOfInitialAccounts)
    }
  }

  async initialiseAccounts(n: number) {
    console.debug(`[Flowser] initialising ${n} initial flow accounts...`)

    let out = [];
    for (let i = 0; i < n; i++) {
      out.push(await this.createAccount());
    }
    return out;
  }

  createAccount(): Promise<string> {
    return new Promise(((resolve, reject) => {
      let out = "";
      spawn("flow", [
        'accounts',
        'create'
      ], {
        cwd: this.projectDir()
      })
        .stdout.on("data", data => {
          out += data.toString()
        })
        .on("close", (code) => code > 0 ? reject(code) : resolve(out))
    }))
  }

  stop() {
    console.log(`[Flowser] stopping emulator process: ${this.emulatorProcess.pid}`)
    if (this.isRunning()) {
      this.emulatorProcess.kill();
    }
  }

}
