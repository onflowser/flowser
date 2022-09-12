import {
  ChildProcessWithoutNullStreams,
  spawn,
  SpawnOptionsWithoutStdio,
} from "child_process";
import { Log, LogSource } from "@flowser/shared";
import { randomUUID } from "crypto";

export type ManagedProcessOptions = {
  command: {
    name: string;
    args: string[];
    options?: SpawnOptionsWithoutStdio;
  };
};

export enum ManagedProcessState {
  NOT_RUNNING,
  RUNNING,
  ERROR,
}

export class ManagedProcess {
  public readonly id: string;
  public options: ManagedProcessOptions;
  public childProcess: ChildProcessWithoutNullStreams | undefined;
  public state: ManagedProcessState;
  public logs: Log[];

  constructor(options: ManagedProcessOptions) {
    this.id = randomUUID();
    this.options = options;
    this.logs = [];

    // Gracefully shutdown child process in case parent receives a kill signal
    process.once("SIGINT", async () => {
      await this.stop();
    });
    process.once("SIGTERM", async () => {
      await this.stop();
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

  private onPostSpawn() {
    this.childProcess.on("spawn", () => {
      this.state = ManagedProcessState.RUNNING;
    });
    this.childProcess.on("exit", (code) => {
      if (code > 0) {
        this.state = ManagedProcessState.ERROR;
      } else {
        this.state = ManagedProcessState.NOT_RUNNING;
      }
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
      (line, index): Log => ({
        id: this.logs.length + index,
        source,
        data: line,
        createdAt,
        updatedAt: createdAt,
      })
    );

    this.logs.push(...logs);
  }
}
