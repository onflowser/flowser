import {
  GetSingleBlockResponse,
  GetPollingBlocksResponse,
} from "@flowser/shared";
import axios from "../config/axios";
import { AxiosResponse } from "axios";
import { TransportService } from "./transports/transport.service";

export class BlocksService {
  constructor(private readonly transport: TransportService) {}

  getAllWithPolling({
    timestamp,
  }: {
    timestamp: number;
  }): Promise<AxiosResponse<GetPollingBlocksResponse>> {
    return axios.get("/api/blocks/polling", {
      params: {
        timestamp,
      },
      transformResponse: (data) =>
        GetPollingBlocksResponse.fromJSON(JSON.parse(data)),
    });
  }

  getSingle(id: string): Promise<GetSingleBlockResponse> {
    return this.transport.send({
      requestMethod: "GET",
      resourceIdentifier: `/api/blocks/${id}`,
      responseProtobuf: GetSingleBlockResponse,
    });
  }
}
