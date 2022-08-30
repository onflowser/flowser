import {
  GetSingleAccountResponse,
  GetPollingAccountsResponse,
  GetPollingKeysResponse,
} from "@flowser/shared";
import axios from "../config/axios";
import { AxiosResponse } from "axios";

export class AccountsService {
  private static instance: AccountsService | undefined;

  static getInstance(): AccountsService {
    if (!AccountsService.instance) {
      AccountsService.instance = new AccountsService();
    }
    return AccountsService.instance;
  }

  getAllWithPolling({
    timestamp,
  }: {
    timestamp: number;
  }): Promise<AxiosResponse<GetPollingAccountsResponse>> {
    return axios.get("/api/accounts/polling", {
      params: {
        timestamp,
      },
      transformResponse: (data) =>
        GetPollingAccountsResponse.fromJSON(JSON.parse(data)),
    });
  }

  getAllKeysByAccountWithPolling({
    accountAddress,
    timestamp,
  }: {
    accountAddress: string;
    timestamp: number;
  }): Promise<AxiosResponse<GetPollingKeysResponse>> {
    return axios.get(`/api/accounts/${accountAddress}/keys/polling`, {
      params: {
        timestamp,
      },
      transformResponse: (data) =>
        GetPollingKeysResponse.fromJSON(JSON.parse(data)),
    });
  }

  getSingle(id: string): Promise<AxiosResponse<GetSingleAccountResponse>> {
    return axios.get(`/api/accounts/${id}`, {
      transformResponse: (data) =>
        GetSingleAccountResponse.fromJSON(JSON.parse(data)),
    });
  }
}
