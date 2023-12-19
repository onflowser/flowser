import axios, { Method } from "axios";
import { FlowEmulatorConfig, FlowStateSnapshot } from "@onflowser/api";
import { PersistentStorage } from "./persistent-storage";
import EventEmitter from "events";
import { HttpService } from "./http.service";

type ListSnapshotsResponse = {
  names: string[];
};

type SnapshotInfoResponse = {
  context: string;
  blockId: string;
  height: number;
};

type FlowSnapshotsConfig = Pick<FlowEmulatorConfig, "adminServerPort">;

export enum FlowSnapshotsEvent {
  ROLLBACK_TO_HEIGHT = "ROLLBACK_TO_HEIGHT",
  JUMP_TO = "JUMP_TO",
}

export class FlowSnapshotsService extends EventEmitter {
  private config: FlowSnapshotsConfig;

  constructor(
    private readonly storage: PersistentStorage,
    private readonly httpService: HttpService
  ) {
    super();
    this.config = {
      adminServerPort: 8080,
    };
  }

  configure(config: FlowSnapshotsConfig) {
    this.config = config;
  }

  public async create(name: string): Promise<SnapshotInfoResponse> {
    // https://github.com/onflow/flow-emulator/blob/0ca87170b7792b68941da368a839b9b74615d659/server/utils/emulator.go#L208-L233
    const response = await this.emulatorRequest<SnapshotInfoResponse>({
      method: "post",
      endpoint: `/snapshots?name=${name}`,
    });

    if (response.status === 409) {
      throw new Error("Snapshot already exists");
    }

    if (response.status !== 200) {
      throw new Error("Failed creating snapshot");
    }

    const existing = await this.findAllPersisted();
    await this.persistAll([
      ...existing,
      {
        id: name,
        blockId: response.data.blockId,
        blockHeight: response.data.height,
      },
    ]);

    return response.data;
  }

  public async rollbackToHeight(height: number): Promise<void> {
    // https://github.com/onflow/flow-emulator/blob/0ca87170b7792b68941da368a839b9b74615d659/server/utils/emulator.go#L118-L136
    const response = await this.emulatorRequest({
      method: "post",
      endpoint: `/rollback?height=${height}`,
    });

    if (response.status !== 200) {
      throw new Error("Failed to jump to height");
    }

    this.emit(FlowSnapshotsEvent.ROLLBACK_TO_HEIGHT, height);
  }

  public async jumpTo(id: string): Promise<SnapshotInfoResponse> {
    // https://github.com/onflow/flow-emulator/blob/0ca87170b7792b68941da368a839b9b74615d659/server/utils/emulator.go#L183-L206
    const response = await this.emulatorRequest<SnapshotInfoResponse>({
      method: "put",
      endpoint: `/snapshots/${id}`,
    });

    if (response.status === 404) {
      throw new Error("Snapshot not found");
    }

    if (response.status !== 200) {
      throw new Error("Failed to jump to snapshot");
    }

    this.emit(FlowSnapshotsEvent.JUMP_TO, id);

    return response.data;
  }

  public async synchronizeIndex() {
    const [persistedSnapshots, emulatorSnapshots] = await Promise.all([
      this.findAllPersisted(),
      this.findAllOnEmulator(),
    ]);

    const validSnapshotIdLookup = new Set(emulatorSnapshots.names);

    // Ensure we exclude the ones that were deleted without using Flowser.
    await this.persistAll(
      persistedSnapshots.filter((snapshot) =>
        validSnapshotIdLookup.has(snapshot.id),
      ),
    );
  }

  public async findAll(): Promise<FlowStateSnapshot[]> {
    // Only valid snapshots (after synchronization) should be persisted.
    return this.findAllPersisted();
  }

  private async findAllOnEmulator(): Promise<ListSnapshotsResponse> {
    // https://github.com/onflow/flow-emulator/blob/0ca87170b7792b68941da368a839b9b74615d659/server/utils/emulator.go#L138-L156
    const response = await this.emulatorRequest<string[]>({
      method: "get",
      endpoint: "/snapshots",
    });

    if (response.status !== 200) {
      throw new Error("Failed to list snapshots");
    }

    const emptyResponse: ListSnapshotsResponse = {
      names: [],
    };

    // Emulator returns `null` when no snapshots exist.
    return response.data ? { names: response.data } : emptyResponse;
  }

  private async findAllPersisted(): Promise<FlowStateSnapshot[]> {
    const rawValue = await this.storage.read();
    return JSON.parse(rawValue ?? "[]");
  }

  private async persistAll(snapshots: FlowStateSnapshot[]) {
    await this.storage.write(JSON.stringify(snapshots));
  }

  private async emulatorRequest<Response>(options: {
    method: Method;
    endpoint: string;
  }) {
    const { adminServerPort } = this.config;

    return this.httpService.request<Response>({
      method: options.method,
      url: `http://localhost:${adminServerPort}/emulator${options.endpoint}`
    })
  }
}
