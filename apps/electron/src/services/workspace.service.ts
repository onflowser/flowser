import { FlowserWorkspace } from '@onflowser/api';
import { FlowEmulatorService } from '@onflowser/nodejs';
import { randomUUID } from 'crypto';
import EventEmitter from 'events';
import { PersistentStorage } from '@onflowser/core/src/persistent-storage';

export enum WorkspaceEvent {
  WORKSPACE_OPEN = 'WORKSPACE_OPEN',
  WORKSPACE_CLOSE = 'WORKSPACE_CLOSE',
}

export class WorkspaceService extends EventEmitter {
  private readonly openWorkspaceIds: Set<string>;

  constructor(
    private readonly flowEmulatorService: FlowEmulatorService,
    private readonly storage: PersistentStorage,
  ) {
    super();
    this.openWorkspaceIds = new Set();
  }

  async getOpenWorkspaces(): Promise<FlowserWorkspace[]> {
    const allWorkspaces = await this.findAll();
    return allWorkspaces.filter((workspace) =>
      this.openWorkspaceIds.has(workspace.id),
    );
  }

  async close(id: string): Promise<void> {
    this.openWorkspaceIds.delete(id);
    this.emit(WorkspaceEvent.WORKSPACE_CLOSE, id);
  }

  async open(id: string): Promise<void> {
    const workspace = await this.findById(id);
    if (!workspace) {
      throw new Error('Workspace not found');
    }
    this.openWorkspaceIds.add(workspace.id);
    this.emit(WorkspaceEvent.WORKSPACE_OPEN, id);
  }

  async findAll(): Promise<FlowserWorkspace[]> {
    const existing = await this.storage.read();

    return JSON.parse(existing ?? '[]');
  }

  async create(createdWorkspace: FlowserWorkspace) {
    const existingWorkspaces = await this.findAll();

    await this.saveWorkspaces([...existingWorkspaces, createdWorkspace]);
  }

  async update(updatedWorkspace: FlowserWorkspace) {
    const existingWorkspaces = await this.findAll();

    await this.saveWorkspaces(
      existingWorkspaces.map((existingWorkspace) =>
        existingWorkspace.id === updatedWorkspace.id
          ? updatedWorkspace
          : existingWorkspace,
      ),
    );
  }

  async findById(id: string): Promise<FlowserWorkspace | undefined> {
    const existingWorkspaces = await this.findAll();
    return existingWorkspaces.find((e) => e.id === id);
  }

  async findByIdOrThrow(id: string): Promise<FlowserWorkspace> {
    const workspace = await this.findById(id);
    if (!workspace) {
      throw new Error(`Workspace ${id} not found`);
    }
    return workspace;
  }

  async getDefaultSettings(): Promise<FlowserWorkspace> {
    return {
      filesystemPath: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      emulator: this.flowEmulatorService.getDefaultConfig(),
      gateway: undefined,
      id: randomUUID(),
      name: 'My awesome project',
    };
  }

  async remove(id: string): Promise<void> {
    const existingWorkspaces = await this.findAll();
    await this.saveWorkspaces(existingWorkspaces.filter((e) => e.id !== id));
  }

  private async saveWorkspaces(workspaces: FlowserWorkspace[]) {
    await this.storage.write(JSON.stringify(workspaces));
  }
}
