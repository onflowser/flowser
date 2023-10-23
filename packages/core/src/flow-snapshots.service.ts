import axios, { Method } from "axios";
import { FlowEmulatorConfig } from "@onflowser/api";

type ListSnapshotsResponse = {
  names: string[];
};

type SnapshotInfoResponse = {
  context: string;
  blockId: string;
  height: number;
};

type FlowSnapshotsConfig = Pick<FlowEmulatorConfig, "adminServerPort">;

export class FlowSnapshotsService {
  private config: FlowSnapshotsConfig

  constructor() {
    this.config = {
      adminServerPort: 8080
    }
  }

  configure(config: FlowSnapshotsConfig) {
    this.config = config;
  }

  public async create(
    name: string
  ): Promise<SnapshotInfoResponse> {
    // https://github.com/onflow/flow-emulator/blob/0ca87170b7792b68941da368a839b9b74615d659/server/utils/emulator.go#L208-L233
    const response = await this.emulatorRequest<SnapshotInfoResponse>({
      method: "post",
      endpoint: `/snapshots?name=${name}`,
    });

    if (response.status !== 200) {
      throw new Error("Failed creating snapshot");
    }

    return response.data;
  }

  public async jumpToHeight(height: number): Promise<void> {
    // https://github.com/onflow/flow-emulator/blob/0ca87170b7792b68941da368a839b9b74615d659/server/utils/emulator.go#L118-L136
    const response = await this.emulatorRequest({
      method: "post",
      endpoint: `/rollback?height=${height}`,
    });

    if (response.status !== 200) {
      throw new Error("Failed to jump to height");
    }
  }

  public async jumpToSnapshot(
    name: string
  ): Promise<SnapshotInfoResponse> {
    // https://github.com/onflow/flow-emulator/blob/0ca87170b7792b68941da368a839b9b74615d659/server/utils/emulator.go#L183-L206
    const response = await this.emulatorRequest<SnapshotInfoResponse>({
      method: "put",
      endpoint: `/snapshots/${name}`,
    });

    if (response.status === 404) {
      throw new Error("Snapshot not found");
    }

    if (response.status !== 200) {
      throw new Error("Failed to jump to snapshot");
    }

    return response.data;
  }

  public async findAll(): Promise<ListSnapshotsResponse> {
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

  private emulatorRequest<ResponseData>(options: {
    method: Method;
    endpoint: string;
  }) {
    const { adminServerPort } = this.config;

    return axios.request<ResponseData>({
      method: options.method,
      url: `http://localhost:${adminServerPort}/emulator${options.endpoint}`,
      // Prevent axios from throwing on certain http response codes
      // https://github.com/axios/axios/issues/41
      validateStatus: () => true,
    });
  }
}
