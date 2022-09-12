import { Injectable } from "@nestjs/common";
import { ManagedProcessEntity } from "./managed-process.entity";
import { ManagedProcessLog } from "@flowser/shared";

@Injectable()
export class ProcessManagerService {
  private readonly processLookupById: Map<string, ManagedProcessEntity>;

  constructor() {
    this.processLookupById = new Map();

    // Gracefully shutdown child process in case parent receives a kill signal
    // FIXME: This doesn't work well with fast refresh
    process.once("SIGINT", this.stopAll.bind(this));
    process.once("SIGTERM", this.stopAll.bind(this));
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

  getAllLogs() {
    const allLogs = this.getAll()
      .map((process) => process.logs)
      .flat();
    return allLogs.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
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
    const processes = [...this.processLookupById.values()];
    await Promise.all(processes.map((process) => process.stop()));
  }

  async stop(processId: string) {
    await this.processLookupById.get(processId)?.stop();
  }
}
