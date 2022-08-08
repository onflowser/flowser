import { AxiosResponse } from "axios";
import { PollingResponse } from "@flowser/types/generated/common";

export interface EntityService<T> {
  resourceIdKey: keyof T;

  getAllWithPollingKey: string;
  getAllWithPolling: ({
    timestamp,
  }: {
    timestamp: number;
  }) => Promise<AxiosResponse<PollingResponse<T>>>;

  getSingleKey: string;
  getSingle: (id: string) => Promise<AxiosResponse<T>>;
}
