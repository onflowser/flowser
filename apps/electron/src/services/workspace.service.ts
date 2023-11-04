import { FlowserWorkspace } from '@onflowser/api';
import { FlowEmulatorService } from '@onflowser/nodejs';
import { randomUUID } from 'crypto';
import EventEmitter from 'events';
import { PersistentStorage } from '@onflowser/core/src/persistent-storage';

export enum WorkspaceEvent {
  WORKSPACE_OPEN = 'WORKSPACE_OPEN',
  WORKSPACE_CLOSE = 'WORKSPACE_CLOSE',
  WORKSPACE_UPDATE = 'WORKSPACE_UPDATE',
}

export class WorkspaceService extends EventEmitter {
  private readonly openWorkspaceIds: Set<string>;
  private readonly temporaryWorkspaceLookup: Map<string, FlowserWorkspace>;

  constructor(
    private readonly flowEmulatorService: FlowEmulatorService,
    private readonly storage: PersistentStorage,
  ) {
    super();
    this.openWorkspaceIds = new Set();
    this.temporaryWorkspaceLookup = new Map();
  }

  async getOpenWorkspace(): Promise<FlowserWorkspace | undefined> {
    const [openWorkspace] = await this.getOpenWorkspaces();
    // There will be only 1 open workspace for now.
    return openWorkspace;
  }

  async getOpenWorkspaceOrThrow(): Promise<FlowserWorkspace> {
    const openWorkspace = await this.getOpenWorkspace();
    if (!openWorkspace) {
      throw new Error('Open workspace not found');
    }
    return openWorkspace;
  }

  private async getOpenWorkspaces(): Promise<FlowserWorkspace[]> {
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
    const persisted = await this.readPersisted();
    const temporary = Array.from(this.temporaryWorkspaceLookup.values());
    return [...persisted, ...temporary];
  }

  // Temporary workspaces are not persisted to disk.
  async createTemporary(createdWorkspace: FlowserWorkspace) {
    this.temporaryWorkspaceLookup.set(createdWorkspace.id, createdWorkspace);
  }

  async create(createdWorkspace: FlowserWorkspace) {
    const existingWorkspaces = await this.findAll();

    await this.saveAll([...existingWorkspaces, createdWorkspace]);
  }

  async update(updatedWorkspace: FlowserWorkspace) {
    const existingWorkspaces = await this.findAll();

    await this.saveAll(
      existingWorkspaces.map((existingWorkspace) =>
        existingWorkspace.id === updatedWorkspace.id
          ? updatedWorkspace
          : existingWorkspace,
      ),
    );

    this.emit(WorkspaceEvent.WORKSPACE_UPDATE, updatedWorkspace.id);
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
      id: randomUUID(),
      name: 'My awesome project',
    };
  }

  async remove(id: string): Promise<void> {
    const existingWorkspaces = await this.findAll();
    await this.saveAll(existingWorkspaces.filter((e) => e.id !== id));
  }

  private async saveAll(workspaces: FlowserWorkspace[]) {
    const temporary = workspaces.filter((w) =>
      this.temporaryWorkspaceLookup.has(w.id),
    );

    temporary.forEach((w) => this.temporaryWorkspaceLookup.set(w.id, w));

    const persistable = workspaces.filter(
      (w) => !this.temporaryWorkspaceLookup.has(w.id),
    );

    await this.persist(persistable);
  }

  private async readPersisted(): Promise<FlowserWorkspace[]> {
    const existing = await this.storage.read();

    return JSON.parse(existing ?? '[]');
  }

  private async persist(workspaces: FlowserWorkspace[]) {
    await this.storage.write(JSON.stringify(workspaces));
  }
}
