import {
  GetSingleTransactionResponse,
  GetPollingTransactionsResponse,
} from "@flowser/types/generated/responses/transactions";
import axios from "../config/axios";
import { AxiosResponse } from "axios";

export class TransactionsService {
  private static instance: TransactionsService | undefined;

  static getInstance(): TransactionsService {
    if (!TransactionsService.instance) {
      TransactionsService.instance = new TransactionsService();
    }
    return TransactionsService.instance;
  }

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

  getSingle(id: string): Promise<AxiosResponse<GetSingleTransactionResponse>> {
    return axios.get(`/api/transactions/${id}`, {
      transformResponse: (data) =>
        GetSingleTransactionResponse.fromJSON(JSON.parse(data)),
    });
  }
}
