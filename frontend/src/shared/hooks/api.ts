import { TimeoutPollingHook, useTimeoutPolling } from "./timeout-polling";
import { AccountsService } from "../services/accounts.service";
import { Account } from "@flowser/types/generated/accounts";

export function useGetPollingAccounts(): TimeoutPollingHook<Account> {
  return useTimeoutPolling<Account>({
    resourceKey: "/accounts/polling",
    resourceIdKey: "address",
    fetcher: AccountsService.getInstance().getAllWithPolling,
  });
}
