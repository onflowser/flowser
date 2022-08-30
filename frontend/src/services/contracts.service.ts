import {
  GetSingleContractResponse,
  GetPollingContractsResponse,
} from "@flowser/types";
import axios from "../config/axios";
import { AxiosResponse } from "axios";

export class ContractsService {
  private static instance: ContractsService | undefined;

  static getInstance(): ContractsService {
    if (!ContractsService.instance) {
      ContractsService.instance = new ContractsService();
    }
    return ContractsService.instance;
  }

  getAllWithPolling({
    timestamp,
  }: {
    timestamp: number;
  }): Promise<AxiosResponse<GetPollingContractsResponse>> {
    return axios.get("/api/contracts/polling", {
      params: {
        timestamp,
      },
      transformResponse: (data) =>
        GetPollingContractsResponse.fromJSON(JSON.parse(data)),
    });
  }

  getAllByAccountWithPolling({
    accountAddress,
    timestamp,
  }: {
    accountAddress: string;
    timestamp: number;
  }): Promise<AxiosResponse<GetPollingContractsResponse>> {
    return axios.get(`/api/accounts/${accountAddress}/contracts/polling`, {
      params: {
        timestamp,
      },
      transformResponse: (data) =>
        GetPollingContractsResponse.fromJSON(JSON.parse(data)),
    });
  }

  getSingle(id: string): Promise<AxiosResponse<GetSingleContractResponse>> {
    return axios.get(`/api/contracts/${id}`, {
      transformResponse: (data) =>
        GetSingleContractResponse.fromJSON(JSON.parse(data)),
    });
  }
}
