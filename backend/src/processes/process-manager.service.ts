import { Injectable, NotFoundException } from "@nestjs/common";
import { ManagedProcessEntity } from "./managed-process.entity";
import { ManagedProcessLog } from "@flowser/shared";

@Injectable()
export class ProcessManagerService {
  private readonly processLookupById: Map<string, ManagedProcessEntity>;

  constructor() {
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

  findAllLogsNewerThanTimestamp(timestamp: Date): ManagedProcessLog[] {
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
  ): ManagedProcessLog[] {
    const process = this.processLookupById.get(processId);
    return process.logs?.filter(
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

  async start(process: ManagedProcessEntity) {
    const existingProcess = this.processLookupById.get(process.id);
    if (existingProcess) {
      await existingProcess.stop();
    }
    this.processLookupById.set(process.id, process);

    await process.start();
  }

  async stopAll() {
    await Promise.all(this.getAll().map((process) => process.stop()));
  }

  async stop(processId: string) {
    await this.processLookupById.get(processId)?.stop();
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
