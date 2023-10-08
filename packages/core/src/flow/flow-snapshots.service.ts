import axios, { Method } from "axios";

type CreateSnapshotRequest = {
  name: string;
};

type JumpToBlockHeightRequest = {
  height: number;
};

type JumpToSnapshotRequest = {
  name: string;
};

type ListSnapshotsResponse = {
  names: string[];
};

type SnapshotInfoResponse = {
  context: string;
  blockId: string;
  height: number;
};

export class FlowSnapshotsService {
  constructor() {}

  async rollback(blockHeight: number) {
    await this.jumpToHeight({
      height: blockHeight,
    });

    // const blockIdsUntilTargetHeight = allBlocks
    //   .filter((block) => block.blockHeight > blockHeight)
    //   .map((block) => block.blockId);

    // TODO(restructure): Invalidate data associated with the above blocks
  }

  async checkout(snapshotId: string) {
    await this.jumpToSnapshot({
      name: snapshotId,
    });

    // TODO(restructure): Invalidate (all) blockchain data
  }

  private async create(
    request: CreateSnapshotRequest
  ): Promise<SnapshotInfoResponse> {
    // https://github.com/onflow/flow-emulator/blob/0ca87170b7792b68941da368a839b9b74615d659/server/utils/emulator.go#L208-L233
    const response = await this.emulatorRequest<SnapshotInfoResponse>({
      method: "post",
      endpoint: `/snapshots?name=${request.name}`,
    });

    if (response.status !== 200) {
      throw new Error("Failed creating snapshot");
    }

    return response.data;
  }

  private async jumpToHeight(request: JumpToBlockHeightRequest): Promise<void> {
    // https://github.com/onflow/flow-emulator/blob/0ca87170b7792b68941da368a839b9b74615d659/server/utils/emulator.go#L118-L136
    const response = await this.emulatorRequest({
      method: "post",
      endpoint: `/rollback?height=${request.height}`,
    });

    if (response.status !== 200) {
      throw new Error("Failed to jump to height");
    }
  }

  private async jumpToSnapshot(
    request: JumpToSnapshotRequest
  ): Promise<SnapshotInfoResponse> {
    // https://github.com/onflow/flow-emulator/blob/0ca87170b7792b68941da368a839b9b74615d659/server/utils/emulator.go#L183-L206
    const response = await this.emulatorRequest<SnapshotInfoResponse>({
      method: "put",
      endpoint: `/snapshots/${request.name}`,
    });

    if (response.status === 404) {
      throw new Error("Snapshot not found");
    }

    if (response.status !== 200) {
      throw new Error("Failed to jump to snapshot");
    }

    return response.data;
  }

  private async listSnapshots(): Promise<ListSnapshotsResponse> {
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
    return axios.request<ResponseData>({
      method: options.method,
      url: `http://localhost:8080/emulator${options.endpoint}`,
      // Prevent axios from throwing on certain http response codes
      // https://github.com/axios/axios/issues/41
      validateStatus: () => true,
    });
  }
}
