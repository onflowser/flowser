import {
  GetSingleAccountResponse,
  GetPollingAccountsResponse,
  GetPollingKeysResponse,
} from "@flowser/shared";
import axios from "../config/axios";
import { AxiosResponse } from "axios";
import { TransportService } from "./transports/transport.service";

export class AccountsService {
  constructor(private readonly transport: TransportService) {}

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

  getSingle(id: string): Promise<GetSingleAccountResponse> {
    return this.transport.send({
      requestMethod: "GET",
      resourceIdentifier: `/api/accounts/${id}`,
      responseProtobuf: GetSingleAccountResponse,
    });
  }
}
