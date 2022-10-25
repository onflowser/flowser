import {
  ChildProcessWithoutNullStreams,
  spawn,
  SpawnOptionsWithoutStdio,
} from "child_process";
import {
  LogSource,
  ManagedProcess,
  ManagedProcessLog,
  ManagedProcessState,
  managedProcessStateToJSON,
} from "@flowser/shared";
import { randomUUID } from "crypto";
import { Logger } from "@nestjs/common";
import { EventEmitter } from "node:events";

export type ManagedProcessOptions = {
  id?: string;
  name: string;
  command: {
    name: string;
    args?: string[];
    options?: SpawnOptionsWithoutStdio;
  };
};

export enum ManagedProcessEvent {
  STATE_CHANGE = "state_change",
}

export class ManagedProcessEntity extends EventEmitter {
  private readonly logger = new Logger(ManagedProcessEntity.name);
  public readonly id: string;
  private readonly name: string;
  public options: ManagedProcessOptions;
  public childProcess: ChildProcessWithoutNullStreams | undefined;
  public state: ManagedProcessState;
  public logs: ManagedProcessLog[];
  public createdAt: Date;
  public updatedAt: Date;

  constructor(options: ManagedProcessOptions) {
    super();
    this.id = options.id ?? randomUUID();
    this.name = options.name;
    this.options = options;
    this.logs = [];
    this.state = ManagedProcessState.MANAGED_PROCESS_STATE_NOT_RUNNING;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  async waitOnExit() {
    return new Promise<void>((resolve) => {
      this.childProcess.once("exit", resolve);
    });
  }

  async start() {
    const { command } = this.options;

    if (this.isRunning()) {
      throw new Error("Process is already running");
    }

    this.logger.debug(
      `Starting ${this.name} with command: ${command.name} ${command.args.join(
        " "
      )}`
    );

    return new Promise<void>((resolve, reject) => {
      this.childProcess = spawn(command.name, command.args, command.options);
      this.attachEventListeners();
      this.childProcess.once("spawn", () => {
        resolve();
      });
      this.childProcess.once("error", (error) => {
        reject(error);
      });
    });
  }

  async stop() {
    if (!this.isRunning()) {
      return;
    }
    return new Promise<number>(async (resolve, reject) => {
      const isKilledSuccessfully = this.childProcess.kill("SIGINT");
      this.childProcess.once("error", (error) => {
        reject(error);
      });
      if (!isKilledSuccessfully) {
        // If the SIGINT signal doesn't work, force kill with SIGINT
        this.childProcess.kill("SIGKILL");
      }
      this.childProcess.once("exit", (exitCode) => {
        resolve(exitCode);
      });
      // In the worst case, just inform the user that shutdown failed
      const rejectionTimeoutSec = 6;
      setTimeout(() => {
        const timeoutError = new Error(
          `Couldn't kill process ${this.id} (pid=${this.childProcess.pid}) within ${rejectionTimeoutSec}s timeout`
        );
        reject(timeoutError);
      }, rejectionTimeoutSec * 1000);
    });
  }

  public clearLogs() {
    this.logs = [];
  }

  public toProto(): ManagedProcess {
    const { name, args } = this.options.command;
    return {
      id: this.id,
      name: this.name,
      command: { name, args },
      state: this.state,
      logs: this.logs,
      updatedAt: this.updatedAt.toISOString(),
      createdAt: this.createdAt.toISOString(),
    };
  }

  private attachEventListeners() {
    this.childProcess.once("spawn", () => {
      this.logger.debug(`Process ${this.id} started`);
      this.setState(ManagedProcessState.MANAGED_PROCESS_STATE_RUNNING);
    });
    this.childProcess.once("exit", (code, signal) => {
      this.logger.debug(
        `Process ${this.id} exited (code=${code}, signal=${signal})`
      );
      this.setState(
        code > 0
          ? ManagedProcessState.MANAGED_PROCESS_STATE_ERROR
          : ManagedProcessState.MANAGED_PROCESS_STATE_NOT_RUNNING
      );
      this.detachEventListeners();
    });

    this.childProcess.stdout.on("data", (data) =>
      this.handleData(LogSource.LOG_SOURCE_STDOUT, data)
    );
    this.childProcess.stderr.on("data", (data) =>
      this.handleData(LogSource.LOG_SOURCE_STDERR, data)
    );
  }

  private detachEventListeners() {
    // Make sure to remove all listeners to prevent memory leaks
    this.childProcess.stdout.removeAllListeners("data");
    this.childProcess.stderr.removeAllListeners("data");
  }

  private handleData(source: LogSource, data: any) {
    const lines: string[] = data.toString().split("\n");
    const createdAt = new Date().toString();
    const logs = lines.map(
      (line): ManagedProcessLog => ({
        id: randomUUID(),
        source,
        data: line,
        createdAt,
        updatedAt: createdAt,
      })
    );

    this.logs.push(...logs);
  }

  private setState(state: ManagedProcessState) {
    this.logger.debug(
      `Process ${this.id} state changed from ${managedProcessStateToJSON(
        this.state
      )} to ${managedProcessStateToJSON(state)}`
    );
    this.updatedAt = new Date();
    this.state = state;
    this.emit(ManagedProcessEvent.STATE_CHANGE, state);
  }

  public isRunning() {
    return this.state === ManagedProcessState.MANAGED_PROCESS_STATE_RUNNING;
  }
}
