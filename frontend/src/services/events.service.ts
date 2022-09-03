import { GetPollingEventsResponse } from "@flowser/shared";
import axios from "../config/axios";
import { AxiosResponse } from "axios";
import { TransportService } from "./transports/transport.service";

export class EventsService {
  constructor(private readonly transport: TransportService) {}

  getAllWithPolling({
    timestamp,
  }: {
    timestamp: number;
  }): Promise<AxiosResponse<GetPollingEventsResponse>> {
    return axios.get("/api/events/polling", {
      params: {
        timestamp,
      },
      transformResponse: (data) =>
        GetPollingEventsResponse.fromJSON(JSON.parse(data)),
    });
  }

  getAllWithPollingByTransaction({
    timestamp,
    transactionId,
  }: {
    timestamp: number;
    transactionId: string;
  }): Promise<AxiosResponse<GetPollingEventsResponse>> {
    return axios.get(`/api/transactions/${transactionId}/events/polling`, {
      params: {
        timestamp,
      },
      transformResponse: (data) =>
        GetPollingEventsResponse.fromJSON(JSON.parse(data)),
    });
  }
}
