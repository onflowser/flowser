import {
  GetAllEmulatorSnapshotsResponse,
  GetPollingEmulatorSnapshotsResponse,
  CreateEmulatorSnapshotRequest,
  RevertToEmulatorSnapshotRequest,
  RevertToEmulatorSnapshotResponse,
  CreateEmulatorSnapshotResponse,
} from "@flowser/shared";
import axios from "../config/axios";
import { AxiosResponse } from "axios";
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

  getAllWithPolling({
    timestamp,
  }: {
    timestamp: number;
  }): Promise<AxiosResponse<GetPollingEmulatorSnapshotsResponse>> {
    return axios.get("/api/flow/snapshots/polling", {
      params: {
        timestamp,
      },
      transformResponse: (data) =>
        GetPollingEmulatorSnapshotsResponse.fromJSON(JSON.parse(data)),
    });
  }
}
