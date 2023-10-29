import {
  ManagedProcess,
  ProcessOutputSource,
  ManagedProcessOutput,
  ManagedProcessOptions,
} from "./managed-process";
import { EventEmitter } from "node:events";
import { IFlowserLogger } from "@onflowser/core";

export enum ProcessManagerEvent {
  PROCESS_ADDED = "process_added",
  PROCESS_UPDATED = "process_updated",
}

type ProcessManagerOptions = {
  // False if consumer wants to handle process termination on exit themselves.
  gracefulShutdown: boolean;
};

export class ProcessManagerService extends EventEmitter {
  private readonly processLookupById: Map<string, ManagedProcess>;

  constructor(
    private readonly logger: IFlowserLogger,
    options: ProcessManagerOptions,
  ) {
    super();
    this.processLookupById = new Map();

    if (options.gracefulShutdown) {
      this.handleGracefullyShutdown();
    }
  }

  private handleGracefullyShutdown() {
    // Gracefully shutdown child process in case parent receives a kill signal
    process.once("SIGINT", this.onTerminate.bind(this));
    process.once("SIGTERM", this.onTerminate.bind(this));
  }

  private async onTerminate() {
    await this.stopAll();
    process.exit(0);
  }

  initManagedProcess(options: ManagedProcessOptions) {
    return new ManagedProcess(this.logger, options);
  }

  findAllLogsByProcess(processId: string): ManagedProcessOutput[] {
    const process = this.processLookupById.get(processId);
    if (!process) {
      throw new Error("Process not found");
    }
    return process.output;
  }

  getAll() {
    const allProcesses = [...this.processLookupById.values()];
    return allProcesses.sort(
      (a, b) =>
        new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
    );
  }

  get(processId: string) {
    return this.processLookupById.get(processId);
  }

  async start(process: ManagedProcess) {
    const isExisting = this.processLookupById.has(process.id);
    if (isExisting) {
      await this.startExisting(process.id);
    } else {
      await this.startNew(process);
    }
  }

  async startNew(process: ManagedProcess) {
    this.processLookupById.set(process.id, process);
    this.emit(ProcessManagerEvent.PROCESS_ADDED, process);
    await process.start();
  }

  async startExisting(processId: string) {
    const existingProcess = this.processLookupById.get(processId);
    if (!existingProcess) {
      throw new Error(`Existing process not found: ${processId}`);
    }
    await existingProcess.stop();
    this.emit(ProcessManagerEvent.PROCESS_UPDATED, process);
    await existingProcess.start();
  }

  /**
   * Starts the process, waits until it terminates (exits),
   * and returns the output it produced.
   *
   * If process exists with non-zero exit code, an error is thrown.
   */
  async runUntilTermination(
    process: ManagedProcess,
  ): Promise<ManagedProcessOutput[]> {
    await this.start(process);
    await process.waitOnExit();
    if (
      process.childProcess &&
      process.childProcess.exitCode !== null &&
      process.childProcess.exitCode !== 0
    ) {
      const errorOutput = process.output.filter(
        (outputLine) =>
          outputLine.source == ProcessOutputSource.OUTPUT_SOURCE_STDERR,
      );
      const errorMessage = errorOutput
        .map((errorLine) => errorLine.data)
        .filter((lineData) => lineData.length > 0)
        .join(" ... ");
      throw new Error(
        `Managed process exited with code: ${process.childProcess.exitCode} (${errorMessage})`,
      );
    }
    return process.output;
  }

  isStoppedAll() {
    return this.getAll().every((process) => !process.isRunning());
  }

  async stopAll() {
    this.logger.debug(`Stopping ${this.getAll().length} processes`);
    await Promise.all(this.getAll().map((process) => process.stop()));
  }

  async stop(processId: string) {
    await this.processLookupById.get(processId)?.stop();
  }

  /**
   * Stops the process and removes it from the process table.
   * Process state won't be tracked anymore.
   */
  async remove(processId: string) {
    await this.stop(processId);
    this.processLookupById.delete(processId);
  }

  async restart(processId: string) {
    const process = this.processLookupById.get(processId);
    if (!process) {
      throw new Error("Process not found");
    }
    await process.stop();
    await process.start();
  }
}
