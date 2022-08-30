import { GetPollingEventsResponse } from "@flowser/shared";
import axios from "../config/axios";
import { AxiosResponse } from "axios";

export class EventsService {
  private static instance: EventsService | undefined;

  static getInstance(): EventsService {
    if (!EventsService.instance) {
      EventsService.instance = new EventsService();
    }
    return EventsService.instance;
  }

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
