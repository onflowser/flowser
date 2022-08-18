import { GetPollingStorageResponse } from "@flowser/types/generated/responses/accounts";
import axios from "../config/axios";
import { AxiosResponse } from "axios";

export class StorageService {
  private static instance: StorageService | undefined;

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

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
