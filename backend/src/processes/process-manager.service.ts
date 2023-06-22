import { Injectable, NotFoundException } from "@nestjs/common";
import { ManagedProcessEntity } from "./managed-process.entity";
import { ProcessOutputSource, ManagedProcessOutput } from "@flowser/shared";
import { EventEmitter } from "node:events";

export enum ProcessManagerEvent {
  PROCESS_ADDED = "process_added",
  PROCESS_UPDATED = "process_updated",
}

@Injectable()
export class ProcessManagerService extends EventEmitter {
  private readonly processLookupById: Map<string, ManagedProcessEntity>;

  constructor() {
    super();
    this.processLookupById = new Map();

    // Gracefully shutdown child process in case parent receives a kill signal
    process.once("SIGINT", this.onTerminate.bind(this));
    process.once("SIGTERM", this.onTerminate.bind(this));
  }

  async onTerminate() {
    await this.stopAll();
    process.exit(0);
  }

  findAllProcessesNewerThanTimestamp(timestamp: Date): ManagedProcessEntity[] {
    return this.getAll().filter((process) => {
      const isUpdatedLater = process.updatedAt.getTime() > timestamp.getTime();
      const isCreatedLater = process.createdAt.getTime() > timestamp.getTime();
      return isUpdatedLater || isCreatedLater;
    });
  }

  findAllLogsNewerThanTimestamp(timestamp: Date): ManagedProcessOutput[] {
    const processes = this.getAll();
    const logsByProcesses = processes.map((process) =>
      this.findAllLogsByProcessIdNewerThanTimestamp(process.id, timestamp)
    );
    const allLogs = logsByProcesses.flat();
    return allLogs.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }

  findAllLogsByProcessIdNewerThanTimestamp(
    processId: string,
    timestamp: Date
  ): ManagedProcessOutput[] {
    const process = this.processLookupById.get(processId);
    if (!process) {
      return [];
    }
    return process.output?.filter(
      (log) => new Date(log.createdAt).getTime() > timestamp.getTime()
    );
  }

  getAll() {
    const allProcesses = [...this.processLookupById.values()];
    return allProcesses.sort(
      (a, b) =>
        new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
    );
  }

  get(processId: string) {
    return this.processLookupById.get(processId);
  }

  async start(process: ManagedProcessEntity) {
    const existingProcess = this.processLookupById.get(process.id);
    if (existingProcess) {
      await existingProcess.stop();
      this.processLookupById.set(process.id, process);
      this.emit(ProcessManagerEvent.PROCESS_UPDATED, process);
    } else {
      this.processLookupById.set(process.id, process);
      this.emit(ProcessManagerEvent.PROCESS_ADDED, process);
    }

    await process.start();
  }

  /**
   * Starts the process, waits until it terminates (exits),
   * and returns the output it produced.
   *
   * If process exists with non-zero exit code, an error is thrown.
   */
  async runUntilTermination(
    process: ManagedProcessEntity
  ): Promise<ManagedProcessOutput[]> {
    await this.start(process);
    await process.waitOnExit();
    if (
      process.childProcess &&
      process.childProcess.exitCode !== null &&
      process.childProcess.exitCode > 0
    ) {
      const errorOutput = process.output.filter(
        (outputLine) =>
          outputLine.source == ProcessOutputSource.OUTPUT_SOURCE_STDERR
      );
      const errorMessage = errorOutput
        .map((errorLine) => errorLine.data)
        .filter((lineData) => lineData.length > 0)
        .join(" ... ");
      throw new Error(
        `Managed process exited with code: ${process.childProcess.exitCode} (${errorMessage})`
      );
    }
    return process.output;
  }

  isStoppedAll() {
    return this.getAll().every((process) => !process.isRunning());
  }

  async stopAll() {
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
      throw new NotFoundException("Process not found");
    }
    await process.stop();
    await process.start();
  }
}
