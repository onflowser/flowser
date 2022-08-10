import {
  GetSingleAccountResponse,
  GetPollingAccountsResponse,
} from "@flowser/types/generated/responses/accounts";
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

  getSingle(id: string): Promise<AxiosResponse<GetSingleAccountResponse>> {
    return axios.get(`/api/accounts/${id}`, {
      transformResponse: (data) =>
        GetSingleAccountResponse.fromJSON(JSON.parse(data)),
    });
  }
}
