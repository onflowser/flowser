import {
  GetPollingEmulatorSnapshotsResponse,
  CreateEmulatorSnapshotRequest,
  RevertToEmulatorSnapshotRequest,
  RevertToEmulatorSnapshotResponse,
  CreateEmulatorSnapshotResponse,
  GetPollingEmulatorSnapshotsRequest,
} from "@flowser/shared";
import { TransportService } from "./transports/transport.service";

export class SnapshotService {
  constructor(private readonly transport: TransportService) {}

  create(
    data: CreateEmulatorSnapshotRequest
  ): Promise<CreateEmulatorSnapshotResponse> {
    return this.transport.send({
      requestMethod: "POST",
      resourceIdentifier: "/api/flow/snapshots",
      requestData: data,
      requestProtobuf: CreateEmulatorSnapshotRequest,
      responseProtobuf: CreateEmulatorSnapshotResponse,
    });
  }

  checkoutBlock(
    data: RevertToEmulatorSnapshotRequest
  ): Promise<RevertToEmulatorSnapshotResponse> {
    return this.transport.send({
      requestMethod: "PUT",
      resourceIdentifier: "/api/flow/snapshots",
      requestData: data,
      requestProtobuf: RevertToEmulatorSnapshotRequest,
      responseProtobuf: RevertToEmulatorSnapshotResponse,
    });
  }

  getAllWithPolling(
    data: GetPollingEmulatorSnapshotsRequest
  ): Promise<GetPollingEmulatorSnapshotsResponse> {
    return this.transport.send({
      requestMethod: "POST",
      resourceIdentifier: "/api/flow/snapshots/polling",
      requestData: data,
      requestProtobuf: GetPollingEmulatorSnapshotsRequest,
      responseProtobuf: GetPollingEmulatorSnapshotsResponse,
    });
  }
}
