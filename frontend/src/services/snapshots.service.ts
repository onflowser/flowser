import {
  GetAllEmulatorSnapshotsResponse,
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

  revertTo(
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

  getAll(): Promise<GetAllEmulatorSnapshotsResponse> {
    return this.transport.send({
      requestMethod: "GET",
      resourceIdentifier: "/api/flow/snapshots",
      responseProtobuf: GetAllEmulatorSnapshotsResponse,
    });
  }

  getAllWithPolling(data: {
    timestamp: number;
  }): Promise<GetPollingEmulatorSnapshotsResponse> {
    return this.transport.send({
      requestMethod: "POST",
      resourceIdentifier: "/api/flow/snapshots/polling",
      requestData: data,
      requestProtobuf: GetPollingEmulatorSnapshotsRequest,
      responseProtobuf: GetPollingEmulatorSnapshotsResponse,
    });
  }
}
