import { GetPollingLogsResponse } from "@flowser/shared";
import axios from "../config/axios";
import { AxiosResponse } from "axios";
import { TransportService } from "./transports/transport.service";

export class LogsService {
  constructor(private readonly transport: TransportService) {}

  getAllWithPolling({
    timestamp,
  }: {
    timestamp: number;
  }): Promise<AxiosResponse<GetPollingLogsResponse>> {
    return axios.get("/api/logs/polling", {
      params: {
        timestamp,
      },
      transformResponse: (data) =>
        GetPollingLogsResponse.fromJSON(JSON.parse(data)),
    });
  }
}
