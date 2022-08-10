import { TimeoutPollingHook, useTimeoutPolling } from "./timeout-polling";
import {
  Account,
  AccountContract,
} from "@flowser/types/generated/entities/accounts";
import { Transaction } from "@flowser/types/generated/entities/transactions";
import { Block } from "@flowser/types/generated/entities/blocks";
import { Event } from "@flowser/types/generated/entities/events";
import { Log } from "@flowser/types/generated/entities/logs";
import { AccountsService } from "../services/accounts.service";
import { ContractsService } from "../services/contracts.service";
import { TransactionsService } from "../services/transactions.service";
import { BlocksService } from "../services/blocks.service";
import { EventsService } from "../services/events.service";
import { LogsService } from "../services/logs.service";
import { useGetAxiosQuery } from "./use-get-axios-query";
import { ProjectsService } from "../services/projects.service";
import { CommonService } from "../services/common.service";
import { GetFlowserVersionResponse } from "@flowser/types/generated/responses/common";
import {
  GetAllProjectsResponse,
  GetSingleProjectResponse,
} from "@flowser/types/generated/responses/projects";
import {
  GetPollingTransactionsResponse,
  GetSingleTransactionResponse,
} from "@flowser/types/generated/responses/transactions";
import { GetPollingLogsResponse } from "@flowser/types/generated/responses/logs";
import { GetPollingEventsResponse } from "@flowser/types/generated/responses/events";
import {
  GetPollingBlocksResponse,
  GetSingleBlockResponse,
} from "@flowser/types/generated/responses/blocks";
import {
  GetPollingContractsResponse,
  GetSingleContractResponse,
} from "@flowser/types/generated/responses/contracts";
import {
  GetPollingAccountsResponse,
  GetSingleAccountResponse,
} from "@flowser/types/generated/responses/accounts";

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
  });
}

export function useGetCurrentProject() {
  return useGetAxiosQuery<GetSingleProjectResponse>({
    resourceKey: `/projects/current`,
    fetcher: ProjectsService.getInstance().getCurrentProject,
  });
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
