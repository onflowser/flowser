import { GetPollingStorageResponse } from "@flowser/shared";
import axios from "../config/axios";
import { AxiosResponse } from "axios";
import { TransportService } from "./transports/transport.service";

export class StorageService {
  constructor(private readonly transport: TransportService) {}

  getAllByAccountWithPolling({
    accountAddress,
    timestamp,
  }: {
    accountAddress: string;
    timestamp: number;
  }): Promise<AxiosResponse<GetPollingStorageResponse>> {
    return axios.get(`/api/accounts/${accountAddress}/storage/polling`, {
      params: {
        timestamp,
      },
      transformResponse: (data) =>
        GetPollingStorageResponse.fromJSON(JSON.parse(data)),
    });
  }
}
