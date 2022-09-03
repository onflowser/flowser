import {
  GetSingleTransactionResponse,
  GetPollingTransactionsResponse,
} from "@flowser/shared";
import axios from "../config/axios";
import { AxiosResponse } from "axios";
import { TransportService } from "./transports/transport.service";

export class TransactionsService {
  constructor(private readonly transport: TransportService) {}

  getAllWithPolling({
    timestamp,
  }: {
    timestamp: number;
  }): Promise<AxiosResponse<GetPollingTransactionsResponse>> {
    return axios.get("/api/transactions/polling", {
      params: {
        timestamp,
      },
      transformResponse: (data) =>
        GetPollingTransactionsResponse.fromJSON(JSON.parse(data)),
    });
  }

  getAllByBlockWithPolling({
    timestamp,
    blockId,
  }: {
    timestamp: number;
    blockId: string;
  }): Promise<AxiosResponse<GetPollingTransactionsResponse>> {
    return axios.get(`/api/blocks/${blockId}/transactions/polling`, {
      params: {
        timestamp,
      },
      transformResponse: (data) =>
        GetPollingTransactionsResponse.fromJSON(JSON.parse(data)),
    });
  }

  getAllByAccountWithPolling({
    timestamp,
    accountAddress,
  }: {
    timestamp: number;
    accountAddress: string;
  }): Promise<AxiosResponse<GetPollingTransactionsResponse>> {
    return axios.get(`/api/accounts/${accountAddress}/transactions/polling`, {
      params: {
        timestamp,
      },
      transformResponse: (data) =>
        GetPollingTransactionsResponse.fromJSON(JSON.parse(data)),
    });
  }

  getSingle(id: string): Promise<GetSingleTransactionResponse> {
    return this.transport.send({
      requestMethod: "GET",
      resourceIdentifier: `/api/transactions/${id}`,
      responseProtobuf: GetSingleTransactionResponse,
    });
  }
}
