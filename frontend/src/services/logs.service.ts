import { GetPollingLogsResponse } from "@flowser/shared";
import axios from "../config/axios";
import { AxiosResponse } from "axios";

export class LogsService {
  private static instance: LogsService | undefined;

  static getInstance(): LogsService {
    if (!LogsService.instance) {
      LogsService.instance = new LogsService();
    }
    return LogsService.instance;
  }

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
