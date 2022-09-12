import { Injectable } from "@nestjs/common";
import { ManagedProcess } from "./managed-process";

@Injectable()
export class ProcessManagerService {
  private readonly processLookupById: Map<string, ManagedProcess>;

  constructor() {
    this.processLookupById = new Map();
  }

  async getAll() {
    return [...this.processLookupById.values()];
  }

  async run(process: ManagedProcess) {
    if (!this.processLookupById.has(process.id)) {
      this.processLookupById.set(process.id, process);
    }

    await process.start();
  }

  async stopAll() {
    const processes = [...this.processLookupById.values()];
    await Promise.all(processes.map((process) => process.stop()));
  }

  async stop(processId: string) {
    if (!this.processLookupById.has(processId)) {
      throw new Error("Process not found");
    }
    await this.processLookupById.get(processId).stop();
  }
}
