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
} from "@flowser/shared";
import { randomUUID } from "crypto";
import { Logger } from "@nestjs/common";
import { EventEmitter } from "node:events";

export type ManagedProcessOptions = {
  id?: string;
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
  public options: ManagedProcessOptions;
  public childProcess: ChildProcessWithoutNullStreams | undefined;
  public state: ManagedProcessState;
  public logs: ManagedProcessLog[];
  public createdAt: Date;
  public updatedAt: Date;

  constructor(options: ManagedProcessOptions) {
    super();
    this.id = options.id ?? randomUUID();
    this.options = options;
    this.logs = [];
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  async waitOnExit() {
    return new Promise<void>((resolve) => {
      this.childProcess.once("exit", resolve);
    });
  }

  async start() {
    const { name, args, options } = this.options.command;

    if (this.isRunning()) {
      throw new Error("Process is already running");
    }

    return new Promise<void>((resolve, reject) => {
      this.childProcess = spawn(name, args, options);
      this.onPostSpawn();
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

        // If nothing works, (for now) just resolve after a timeout
        // TODO(milestone-5): This only happens on windows, should be investigated
        // See https://www.notion.so/flowser/Can-t-open-an-existing-project-on-windows-5b1d4217630b459197a22597756b8ccb
        setTimeout(() => {
          this.logger.debug(
            `Couldn't kill process ${this.id} within 2s timeout (pid=${this.childProcess.pid})`
          );
          resolve(-1);
        }, 2000);
      }
      this.childProcess.once("exit", (exitCode) => {
        resolve(exitCode);
      });
    });
  }

  public toProto(): ManagedProcess {
    const { name, args } = this.options.command;
    return {
      id: this.id,
      command: { name, args },
      state: this.state,
      logs: this.logs,
      updatedAt: this.updatedAt.toISOString(),
      createdAt: this.createdAt.toISOString(),
    };
  }

  private onPostSpawn() {
    this.childProcess.once("spawn", () => {
      this.logger.debug(`Process ${this.id} started`);
      this.setState(ManagedProcessState.MANAGED_PROCESS_STATE_RUNNING);
    });
    this.childProcess.once("exit", (code) => {
      this.logger.debug(`Process ${this.id} exited with code ${code}`);
      this.setState(
        code > 0
          ? ManagedProcessState.MANAGED_PROCESS_STATE_ERROR
          : ManagedProcessState.MANAGED_PROCESS_STATE_NOT_RUNNING
      );
      this.onPostShutdown();
    });

    this.childProcess.stdout.on("data", (data) =>
      this.handleData(LogSource.LOG_SOURCE_STDOUT, data)
    );
    this.childProcess.stderr.on("data", (data) =>
      this.handleData(LogSource.LOG_SOURCE_STDERR, data)
    );
  }

  private onPostShutdown() {
    // Make sure to remove all listeners to prevent memory leaks
    this.childProcess.stdout.removeAllListeners("data");
    this.childProcess.stderr.removeAllListeners("data");
  }

  private handleData(source: LogSource, data: any) {
    const lines: string[] = data.toString().split("\n");
    const createdAt = new Date().toString();
    const logs = lines.map(
      (line, index): ManagedProcessLog => ({
        id: this.logs.length + index,
        source,
        data: line,
        createdAt,
        updatedAt: createdAt,
      })
    );

    this.logs.push(...logs);
  }

  private setState(state: ManagedProcessState) {
    this.updatedAt = new Date();
    this.state = state;
    this.emit(ManagedProcessEvent.STATE_CHANGE, state);
  }

  private isRunning() {
    return this.childProcess?.exitCode === null;
  }
}
