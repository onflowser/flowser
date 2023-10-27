import {
  ChildProcessWithoutNullStreams,
  spawn,
  SpawnOptionsWithoutStdio,
} from "child_process";
import { randomUUID } from "crypto";
import { EventEmitter } from "node:events";
import { IFlowserLogger } from "@onflowser/core";

export type ManagedProcessOptions = {
  id?: string;
  name: string;
  command: {
    name: string;
    args?: string[];
    options?: SpawnOptionsWithoutStdio;
  };
};

export enum ProcessOutputSource {
  OUTPUT_SOURCE_STDOUT = 1,
  OUTPUT_SOURCE_STDERR = 2,
}

export enum ManagedProcessState {
  MANAGED_PROCESS_STATE_NOT_RUNNING = "not_running",
  MANAGED_PROCESS_STATE_RUNNING = "running",
  MANAGED_PROCESS_STATE_ERROR = "error",
}

export interface ManagedProcessOutput {
  id: string;
  processId: string;
  data: string;
  source: ProcessOutputSource;
  createdAt: string;
  updatedAt: string;
}

export enum ManagedProcessEvent {
  STATE_CHANGE = "state_change",
}

export class ManagedProcess extends EventEmitter {
  public readonly id: string;
  private readonly name: string;
  public options: ManagedProcessOptions;
  public childProcess: ChildProcessWithoutNullStreams | undefined;
  public state: ManagedProcessState;
  // List of output lines received from either stdout or stderr.
  public output: ManagedProcessOutput[];
  public createdAt: Date;
  public updatedAt: Date;

  constructor(private readonly logger: IFlowserLogger, options: ManagedProcessOptions) {
    super();
    this.id = options.id ?? randomUUID();
    this.name = options.name;
    this.options = options;
    this.output = [];
    this.state = ManagedProcessState.MANAGED_PROCESS_STATE_NOT_RUNNING;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  async waitOnExit() {
    return new Promise<void>((resolve) => {
      this.childProcess?.once("exit", resolve);
    });
  }

  async start() {
    const { command } = this.options;

    if (this.isRunning()) {
      throw new Error("Process is already running");
    }

    this.logger.debug(
      `Starting ${this.name} with command: ${command.name} ${command.args?.join(
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
    return new Promise<number | null>(async (resolve, reject) => {
      if (!this.childProcess) {
        return;
      }
      const isKilledSuccessfully = this.childProcess.kill("SIGINT");
      this.childProcess.once("error", (error) => {
        reject(error);
      });
      if (!isKilledSuccessfully) {
        this.logger.debug(`Process ${this.name} (${this.id}) didn't shutdown given SIGINT`)
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
          `Couldn't kill process ${this.id} (pid=${this.childProcess?.pid}) within ${rejectionTimeoutSec}s timeout`
        );
        reject(timeoutError);
      }, rejectionTimeoutSec * 1000);
    });
  }

  public clearLogs() {
    this.output = [];
  }

  private attachEventListeners() {
    if (!this.childProcess) {
      return;
    }
    this.childProcess.once("spawn", () => {
      console.debug(`Process ${this.id} started`);
      this.setState(ManagedProcessState.MANAGED_PROCESS_STATE_RUNNING);
    });
    this.childProcess.once("exit", (code, signal) => {
      console.debug(
        `Process ${this.id} exited (code=${code}, signal=${signal})`
      );
      this.setState(
        code !== null && code > 0
          ? ManagedProcessState.MANAGED_PROCESS_STATE_ERROR
          : ManagedProcessState.MANAGED_PROCESS_STATE_NOT_RUNNING
      );
      this.detachEventListeners();
    });

    this.childProcess.stdout.on("data", (data) =>
      this.handleData(ProcessOutputSource.OUTPUT_SOURCE_STDOUT, data)
    );
    this.childProcess.stderr.on("data", (data) =>
      this.handleData(ProcessOutputSource.OUTPUT_SOURCE_STDERR, data)
    );
  }

  private detachEventListeners() {
    if (!this.childProcess) {
      return;
    }
    // Make sure to remove all listeners to prevent memory leaks
    this.childProcess.stdout.removeAllListeners("data");
    this.childProcess.stderr.removeAllListeners("data");
  }

  private handleData(source: ProcessOutputSource, data: any) {
    const lines: string[] = data.toString().split("\n");
    const createdAt = new Date().toString();
    const logs = lines.map(
      (line): ManagedProcessOutput => ({
        id: randomUUID(),
        processId: this.id,
        source,
        data: line,
        createdAt,
        updatedAt: createdAt,
      })
    );

    this.output.push(...logs);
  }

  private setState(newState: ManagedProcessState) {
    console.debug(
      `Process ${this.id} state changed from ${this.state} to ${newState}`
    );
    this.updatedAt = new Date();
    this.state = newState;
    this.emit(ManagedProcessEvent.STATE_CHANGE, newState);
  }

  public isRunning() {
    return this.state === ManagedProcessState.MANAGED_PROCESS_STATE_RUNNING;
  }
}
