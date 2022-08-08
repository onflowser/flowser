import { Account } from "@flowser/types/generated/accounts";
import { EntityService } from "./entity-service";
import { PollingResponse } from "@flowser/types/generated/common";
import axios from "../config/axios";
import { AxiosResponse } from "axios";

export class AccountsService implements EntityService<Account> {
  resourceIdKey: keyof Account = "address";
  getAllWithPollingKey = "accounts-polling";
  getSingleKey = "account";
  private static instance: AccountsService | undefined;

  static getInstance(): EntityService<Account> {
    if (!AccountsService.instance) {
      AccountsService.instance = new AccountsService();
    }
    return AccountsService.instance;
  }

  getAllWithPolling({
    timestamp,
  }: {
    timestamp: number;
  }): Promise<AxiosResponse<PollingResponse<Account>>> {
    return axios.get("/api/accounts/polling", {
      params: {
        timestamp,
      },
    });
  }

  getSingle(id: string): Promise<AxiosResponse<Account>> {
    return axios.get("/api/accounts/:id", {
      params: {
        id,
      },
    });
  }
}
