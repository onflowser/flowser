import { Injectable } from "@nestjs/common";
import { ManagedProcess } from "./managed-process";

@Injectable()
export class ProcessManagerService {
  private readonly processLookupById: Map<string, ManagedProcess>;

  constructor() {
    this.processLookupById = new Map();

    // Gracefully shutdown child process in case parent receives a kill signal
    // FIXME: This doesn't work well with fast refresh
    process.once("SIGINT", this.stopAll.bind(this));
    process.once("SIGTERM", this.stopAll.bind(this));
  }

  async getAll() {
    return [...this.processLookupById.values()];
  }

  async start(process: ManagedProcess) {
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
