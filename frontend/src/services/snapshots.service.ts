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

export class SnapshotService {
  private static instance: SnapshotService | undefined;

  static getInstance(): SnapshotService {
    if (!SnapshotService.instance) {
      SnapshotService.instance = new SnapshotService();
    }
    return SnapshotService.instance;
  }

  create(
    data: CreateEmulatorSnapshotRequest
  ): Promise<AxiosResponse<CreateEmulatorSnapshotResponse>> {
    return axios.post(
      "/api/flow/snapshots",
      CreateEmulatorSnapshotRequest.toJSON(data),
      {
        transformResponse: (data) =>
          CreateEmulatorSnapshotResponse.fromJSON(JSON.parse(data)),
      }
    );
  }

  revertTo(
    data: RevertToEmulatorSnapshotRequest
  ): Promise<AxiosResponse<RevertToEmulatorSnapshotResponse>> {
    return axios.put(
      "/api/flow/snapshots",
      RevertToEmulatorSnapshotRequest.toJSON(data),
      {
        transformResponse: (data) =>
          RevertToEmulatorSnapshotResponse.fromJSON(JSON.parse(data)),
      }
    );
  }

  getAll(): Promise<AxiosResponse<GetAllEmulatorSnapshotsResponse>> {
    return axios.get("/api/flow/snapshots", {
      transformResponse: (data) =>
        GetAllEmulatorSnapshotsResponse.fromJSON(JSON.parse(data)),
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
