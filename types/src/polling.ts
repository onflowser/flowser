import { PollingMetaData } from "./generated/responses/common";

export interface PollingEntity {
  createdAt: string;
  updatedAt: string;
}

export type PollingResponse<T extends PollingEntity[]> = {
  data: T;
  meta: PollingMetaData | undefined;
};
