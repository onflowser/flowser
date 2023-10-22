import { FlowserWorkspace } from '@onflowser/api';
import { FlowEmulatorService } from '@onflowser/nodejs';
import { app } from 'electron';
import path from 'path';
import fs from 'fs/promises';
import { randomUUID } from 'crypto';

export class WorkspaceService {
  private readonly openWorkspaces: Map<string, FlowserWorkspace>;

  constructor(private readonly flowEmulatorService: FlowEmulatorService) {
    this.openWorkspaces = new Map();
  }

  async getOpenWorkspaces(): Promise<FlowserWorkspace[]> {
    return Array.from(this.openWorkspaces.values());
  }

  async close(id: string): Promise<void> {
    this.openWorkspaces.delete(id);
  }

  async open(id: string): Promise<void> {
    const workspace = await this.findById(id);
    if (!workspace) {
      throw new Error('Workspace not found');
    }
    this.openWorkspaces.set(id, workspace);
  }

  async list(): Promise<FlowserWorkspace[]> {
    try {
      const file = await fs.readFile(this.getStorageFilePath(), {
        encoding: 'utf-8',
      });
      return JSON.parse(file) as FlowserWorkspace[];
    } catch (e) {
      // TODO(restructure): Return empty list only in case file is not found
      return [];
    }
  }

  async create(createdWorkspace: FlowserWorkspace) {
    const existingWorkspaces = await this.list();

    await this.saveWorkspaces([...existingWorkspaces, createdWorkspace]);
  }

  async update(updatedWorkspace: FlowserWorkspace) {
    const existingWorkspaces = await this.list();

    await this.saveWorkspaces(
      existingWorkspaces.map((existingWorkspace) =>
        existingWorkspace.id === updatedWorkspace.id
          ? updatedWorkspace
          : existingWorkspace,
      ),
    );
  }

  async findById(id: string): Promise<FlowserWorkspace | undefined> {
    const existingWorkspaces = await this.list();
    return existingWorkspaces.find((e) => e.id === id);
  }

  async getDefaultSettings(): Promise<FlowserWorkspace> {
    return {
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: undefined,
      emulator: this.flowEmulatorService.getDefaultConfig(),
      gateway: undefined,
      id: randomUUID(),
      name: 'My awesome project',
    };
  }

  async remove(id: string): Promise<void> {
    const existingWorkspaces = await this.list();
    await this.saveWorkspaces(existingWorkspaces.filter((e) => e.id !== id));
  }

  private async saveWorkspaces(workspaces: FlowserWorkspace[]) {
    await fs.writeFile(this.getStorageFilePath(), JSON.stringify(workspaces));
  }

  private getStorageFilePath() {
    return path.join(app.getPath('userData'), 'flowser.json');
  }
}
