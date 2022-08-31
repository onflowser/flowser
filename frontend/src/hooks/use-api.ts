import { TimeoutPollingHook, useTimeoutPolling } from "./use-timeout-polling";
import {
  Account,
  AccountContract,
  AccountKey,
  AccountStorageItem,
  Transaction,
  Block,
  Event,
  Log,
  GetAllObjectsCountsResponse,
  GetFlowserVersionResponse,
  GetAllProjectsResponse,
  GetSingleProjectResponse,
  GetPollingTransactionsResponse,
  GetSingleTransactionResponse,
  GetPollingBlocksResponse,
  GetSingleBlockResponse,
  GetPollingContractsResponse,
  GetSingleContractResponse,
  GetPollingAccountsResponse,
  GetPollingKeysResponse,
  GetPollingStorageResponse,
  GetSingleAccountResponse,
  GetFlowCliInfoResponse,
  GetPollingEventsResponse,
  GetPollingLogsResponse,
  EmulatorSnapshot,
  GetPollingEmulatorSnapshotsResponse,
} from "@flowser/shared";
import { AccountsService } from "../services/accounts.service";
import { ContractsService } from "../services/contracts.service";
import { TransactionsService } from "../services/transactions.service";
import { BlocksService } from "../services/blocks.service";
import { EventsService } from "../services/events.service";
import { LogsService } from "../services/logs.service";
import { useGetAxiosQuery } from "./use-get-axios-query";
import { ProjectsService } from "../services/projects.service";
import { CommonService } from "../services/common.service";
import { StorageService } from "../services/storage.service";
import { SnapshotService } from "../services/snapshots.service";

export function useGetPollingAccounts(): TimeoutPollingHook<Account> {
  return useTimeoutPolling<Account, GetPollingAccountsResponse>({
    resourceKey: "/accounts/polling",
    resourceIdKey: "address",
    fetcher: AccountsService.getInstance().getAllWithPolling,
  });
}

export function useGetAccount(address: string) {
  return useGetAxiosQuery<GetSingleAccountResponse>({
    resourceKey: `/accounts/${address}`,
    fetcher: () => AccountsService.getInstance().getSingle(address),
  });
}

export function useGetPollingTransactionsByAccount(
  accountAddress: string
): TimeoutPollingHook<Transaction> {
  return useTimeoutPolling<Transaction, GetPollingTransactionsResponse>({
    resourceKey: `/accounts/${accountAddress}/transactions/polling`,
    resourceIdKey: "id",
    fetcher: ({ timestamp }) =>
      TransactionsService.getInstance().getAllByAccountWithPolling({
        accountAddress,
        timestamp,
      }),
  });
}

export function useGetPollingContractsByAccount(
  accountAddress: string
): TimeoutPollingHook<AccountContract> {
  return useTimeoutPolling<AccountContract, GetPollingContractsResponse>({
    resourceKey: `/accounts/${accountAddress}/contracts/polling`,
    resourceIdKey: "id",
    fetcher: ({ timestamp }) =>
      ContractsService.getInstance().getAllByAccountWithPolling({
        accountAddress,
        timestamp,
      }),
  });
}

export function useGetPollingStorageByAccount(
  accountAddress: string
): TimeoutPollingHook<AccountStorageItem> {
  return useTimeoutPolling<AccountStorageItem, GetPollingStorageResponse>({
    resourceKey: `/accounts/${accountAddress}/storage/polling`,
    resourceIdKey: "id",
    fetcher: ({ timestamp }) =>
      StorageService.getInstance().getAllByAccountWithPolling({
        accountAddress,
        timestamp,
      }),
  });
}

export function useGetPollingKeysByAccount(
  accountAddress: string
): TimeoutPollingHook<AccountKey> {
  return useTimeoutPolling<AccountKey, GetPollingKeysResponse>({
    resourceKey: `/accounts/${accountAddress}/keys/polling`,
    resourceIdKey: "index",
    fetcher: ({ timestamp }) =>
      AccountsService.getInstance().getAllKeysByAccountWithPolling({
        accountAddress,
        timestamp,
      }),
  });
}

export function useGetPollingContracts(): TimeoutPollingHook<AccountContract> {
  return useTimeoutPolling<AccountContract, GetPollingContractsResponse>({
    resourceKey: "/contracts/polling",
    resourceIdKey: "id",
    fetcher: ContractsService.getInstance().getAllWithPolling,
  });
}

export function useGetContract(contractId: string) {
  return useGetAxiosQuery<GetSingleContractResponse>({
    resourceKey: `/contract/${contractId}`,
    fetcher: () => ContractsService.getInstance().getSingle(contractId),
  });
}

export function useGetPollingTransactions(): TimeoutPollingHook<Transaction> {
  return useTimeoutPolling<Transaction, GetPollingTransactionsResponse>({
    resourceKey: "/transactions/polling",
    resourceIdKey: "id",
    fetcher: TransactionsService.getInstance().getAllWithPolling,
  });
}

export function useGetPollingBlocks(): TimeoutPollingHook<Block> {
  return useTimeoutPolling<Block, GetPollingBlocksResponse>({
    resourceKey: "/blocks/polling",
    resourceIdKey: "id",
    fetcher: BlocksService.getInstance().getAllWithPolling,
  });
}

export function useGetBlock(blockId: string) {
  return useGetAxiosQuery<GetSingleBlockResponse>({
    resourceKey: `/blocks/${blockId}`,
    fetcher: () => BlocksService.getInstance().getSingle(blockId),
  });
}

export function useGetPollingEvents(): TimeoutPollingHook<Event> {
  return useTimeoutPolling<Event, GetPollingEventsResponse>({
    resourceKey: "/events/polling",
    resourceIdKey: "id",
    fetcher: EventsService.getInstance().getAllWithPolling,
  });
}

export function useGetPollingEventsByTransaction(
  transactionId: string
): TimeoutPollingHook<Event> {
  return useTimeoutPolling<Event, GetPollingEventsResponse>({
    resourceKey: `/transaction/${transactionId}/events/polling`,
    resourceIdKey: "id",
    fetcher: ({ timestamp }) =>
      EventsService.getInstance().getAllWithPollingByTransaction({
        transactionId,
        timestamp,
      }),
  });
}

export function useGetPollingLogs(): TimeoutPollingHook<Log> {
  return useTimeoutPolling<Log, GetPollingLogsResponse>({
    resourceKey: "/logs/polling",
    resourceIdKey: "id",
    fetcher: LogsService.getInstance().getAllWithPolling,
  });
}

export function useGetPollingTransactionsByBlock(
  blockId: string
): TimeoutPollingHook<Transaction> {
  return useTimeoutPolling<Transaction, GetPollingTransactionsResponse>({
    resourceKey: "/logs/polling",
    resourceIdKey: "id",
    fetcher: ({ timestamp }) =>
      TransactionsService.getInstance().getAllByBlockWithPolling({
        blockId,
        timestamp,
      }),
  });
}

export function useGetTransaction(transactionId: string) {
  return useGetAxiosQuery<GetSingleTransactionResponse>({
    resourceKey: `/transactions/${transactionId}`,
    fetcher: () => TransactionsService.getInstance().getSingle(transactionId),
    refetchInterval: 1000,
  });
}

export function useGetCurrentProject() {
  const { data, error, ...rest } = useGetAxiosQuery<GetSingleProjectResponse>({
    resourceKey: `/projects/current`,
    fetcher: ProjectsService.getInstance().getCurrentProject,
  });

  // In case there is no current project, 404 error is thrown
  return {
    data: error ? undefined : data,
    error,
    ...rest,
  };
}

export function useGetAllProjects() {
  return useGetAxiosQuery<GetAllProjectsResponse>({
    resourceKey: `/projects`,
    fetcher: ProjectsService.getInstance().getAll,
    refetchInterval: 1000,
  });
}

export function useGetFlowserVersion() {
  return useGetAxiosQuery<GetFlowserVersionResponse>({
    resourceKey: "/version",
    fetcher: CommonService.getInstance().getFlowserVersion,
  });
}

export function useGetFlowCliInfo() {
  return useGetAxiosQuery<GetFlowCliInfoResponse>({
    resourceKey: "/version",
    fetcher: CommonService.getInstance().getFlowCliInfo,
  });
}

export function useGetAllObjectsCounts() {
  return useGetAxiosQuery<GetAllObjectsCountsResponse>({
    resourceKey: "/counts",
    fetcher: CommonService.getInstance().getAllObjectsCounts,
    refetchInterval: 1000,
  });
}

export function useGetPollingEmulatorSnapshots(): TimeoutPollingHook<EmulatorSnapshot> {
  return useTimeoutPolling<
    EmulatorSnapshot,
    GetPollingEmulatorSnapshotsResponse
  >({
    resourceKey: "/snapshots/polling",
    resourceIdKey: "id",
    fetcher: ({ timestamp }) =>
      SnapshotService.getInstance().getAllWithPolling({
        timestamp,
      }),
  });
}
