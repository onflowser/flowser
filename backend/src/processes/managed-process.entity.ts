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

const commandExists = require("command-exists");

export type ManagedProcessOptions = {
  id?: string;
  command: {
    name: string;
    args: string[];
    options?: SpawnOptionsWithoutStdio;
  };
};

export class ManagedProcessEntity {
  private readonly logger = new Logger(ManagedProcessEntity.name);
  public readonly id: string;
  public options: ManagedProcessOptions;
  public childProcess: ChildProcessWithoutNullStreams | undefined;
  public state: ManagedProcessState;
  public logs: ManagedProcessLog[];
  public createdAt: Date;
  public updatedAt: Date;

  constructor(options: ManagedProcessOptions) {
    this.id = options.id ?? randomUUID();
    this.options = options;
    this.logs = [];
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  async commandExists() {
    try {
      await commandExists(this.options.command.name);
      return true;
    } catch (e) {
      return false;
    }
  }

  async waitOnExit() {
    return new Promise<void>((resolve) => {
      this.childProcess.on("exit", resolve);
    });
  }

  async start() {
    const { name, args, options } = this.options.command;

    const isRunning = this.childProcess?.exitCode === null;
    if (isRunning) {
      throw new Error("Process is already running");
    }

    return new Promise<void>((resolve, reject) => {
      this.childProcess = spawn(name, args, options);
      this.onPostSpawn();
      this.childProcess.on("spawn", () => {
        resolve();
      });
      this.childProcess.on("error", (error) => {
        reject(error);
      });
    });
  }

  async stop() {
    const isRunning = this.childProcess?.exitCode === null;
    if (!isRunning) {
      return;
    }
    return new Promise<void>((resolve, reject) => {
      const isKilledSuccessfully = this.childProcess.kill("SIGINT");
      this.childProcess.on("error", (error) => {
        reject(error);
      });
      if (isKilledSuccessfully) {
        this.onPostShutdown();
        resolve();
      } else {
        reject();
      }
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
    this.childProcess.on("spawn", () => {
      this.setState(ManagedProcessState.MANAGED_PROCESS_STATE_RUNNING);
    });
    this.childProcess.on("exit", (code) => {
      this.logger.debug(`Process ${this.id} exited with code ${code}`);
      this.setState(
        code > 0
          ? ManagedProcessState.MANAGED_PROCESS_STATE_ERROR
          : ManagedProcessState.MANAGED_PROCESS_STATE_NOT_RUNNING
      );
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
    this.childProcess.removeAllListeners("spawn");
    this.childProcess.removeAllListeners("exit");
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
  }
}
