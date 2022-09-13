import { TimeoutPollingHook, useTimeoutPolling } from "./use-timeout-polling";
import {
  Account,
  AccountContract,
  AccountKey,
  AccountStorageItem,
  Transaction,
  Block,
  Event,
  ManagedProcessLog,
  ManagedProcess,
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
  GetProjectObjectsResponse,
  GetPollingManagedProcessesResponse,
  GetProjectRequirementsResponse,
} from "@flowser/shared";
import { ServiceRegistry } from "../services/service-registry";
import { useQuery } from "react-query";

const {
  projectsService,
  commonService,
  contractsService,
  transactionsService,
  storageService,
  blocksService,
  eventsService,
  processesService,
  accountsService,
  snapshotService,
} = ServiceRegistry.getInstance();

export function useGetPollingAccounts(): TimeoutPollingHook<Account> {
  return useTimeoutPolling<Account, GetPollingAccountsResponse>({
    resourceKey: "/accounts/polling",
    resourceIdKey: "address",
    fetcher: (data) => accountsService.getAllWithPolling(data),
  });
}

export function useGetAccount(address: string) {
  return useQuery<GetSingleAccountResponse>(`/accounts/${address}`, () =>
    accountsService.getSingle(address)
  );
}

export function useGetPollingTransactionsByAccount(
  accountAddress: string
): TimeoutPollingHook<Transaction> {
  return useTimeoutPolling<Transaction, GetPollingTransactionsResponse>({
    resourceKey: `/accounts/${accountAddress}/transactions/polling`,
    resourceIdKey: "id",
    fetcher: ({ timestamp }) =>
      transactionsService.getAllByAccountWithPolling({
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
      contractsService.getAllByAccountWithPolling({
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
      storageService.getAllByAccountWithPolling({
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
      accountsService.getAllKeysByAccountWithPolling({
        accountAddress,
        timestamp,
      }),
  });
}

export function useGetPollingContracts(): TimeoutPollingHook<AccountContract> {
  return useTimeoutPolling<AccountContract, GetPollingContractsResponse>({
    resourceKey: "/contracts/polling",
    resourceIdKey: "id",
    fetcher: (data) => contractsService.getAllWithPolling(data),
  });
}

export function useGetContract(contractId: string) {
  return useQuery<GetSingleContractResponse>(`/contract/${contractId}`, () =>
    contractsService.getSingle(contractId)
  );
}

export function useGetPollingTransactions(): TimeoutPollingHook<Transaction> {
  return useTimeoutPolling<Transaction, GetPollingTransactionsResponse>({
    resourceKey: "/transactions/polling",
    resourceIdKey: "id",
    fetcher: (data) => transactionsService.getAllWithPolling(data),
  });
}

export function useGetPollingBlocks(): TimeoutPollingHook<Block> {
  return useTimeoutPolling<Block, GetPollingBlocksResponse>({
    resourceKey: "/blocks/polling",
    resourceIdKey: "id",
    fetcher: (data) => blocksService.getAllWithPolling(data),
  });
}

export function useGetBlock(blockId: string) {
  return useQuery<GetSingleBlockResponse>(`/blocks/${blockId}`, () =>
    blocksService.getSingle(blockId)
  );
}

export function useGetPollingEvents(): TimeoutPollingHook<Event> {
  return useTimeoutPolling<Event, GetPollingEventsResponse>({
    resourceKey: "/events/polling",
    resourceIdKey: "id",
    fetcher: (data) => eventsService.getAllWithPolling(data),
  });
}

export function useGetPollingEventsByTransaction(
  transactionId: string
): TimeoutPollingHook<Event> {
  return useTimeoutPolling<Event, GetPollingEventsResponse>({
    resourceKey: `/transaction/${transactionId}/events/polling`,
    resourceIdKey: "id",
    fetcher: ({ timestamp }) =>
      eventsService.getAllWithPollingByTransaction({
        transactionId,
        timestamp,
      }),
  });
}

export function useGetPollingLogs(): TimeoutPollingHook<ManagedProcessLog> {
  return useTimeoutPolling<ManagedProcessLog, GetPollingLogsResponse>({
    resourceKey: "/processes/logs/polling",
    resourceIdKey: "id",
    fetcher: (data) => processesService.getAllLogsWithPolling(data),
  });
}

export function useGetPollingLogsByProcess(
  processId: string
): TimeoutPollingHook<ManagedProcessLog> {
  return useTimeoutPolling<ManagedProcessLog, GetPollingLogsResponse>({
    resourceKey: `/processes/${processId}/logs/polling`,
    resourceIdKey: "id",
    fetcher: (data) =>
      processesService.getAllLogsByProcessWithPolling({ processId, ...data }),
  });
}

export function useGetPollingProcesses(): TimeoutPollingHook<ManagedProcess> {
  return useTimeoutPolling<ManagedProcess, GetPollingManagedProcessesResponse>({
    resourceKey: `/processes`,
    resourceIdKey: "id",
    fetcher: (data) => processesService.getAllProcessesWithPolling(data),
  });
}

export function useGetPollingTransactionsByBlock(
  blockId: string
): TimeoutPollingHook<Transaction> {
  return useTimeoutPolling<Transaction, GetPollingTransactionsResponse>({
    resourceKey: "/block/transactions/polling",
    resourceIdKey: "id",
    fetcher: ({ timestamp }) =>
      transactionsService.getAllByBlockWithPolling({
        blockId,
        timestamp,
      }),
  });
}

export function useGetTransaction(transactionId: string) {
  return useQuery<GetSingleTransactionResponse>(
    `/transactions/${transactionId}`,
    () => transactionsService.getSingle(transactionId),
    { refetchInterval: 1000 }
  );
}

export function useGetCurrentProject() {
  const { data, error, ...rest } = useQuery<GetSingleProjectResponse>(
    `/projects/current`,
    () => projectsService.getCurrentProject()
  );

  // In case there is no current project, 404 error is thrown
  return {
    data: error ? undefined : data,
    error,
    ...rest,
  };
}

export function useGetProjectRequirements() {
  return useQuery<GetProjectRequirementsResponse>(
    `/projects/requirements`,
    () => projectsService.getRequirements()
  );
}

export function useGetProjectObjects() {
  return useQuery<GetProjectObjectsResponse>(
    `/flow/objects`,
    () => projectsService.getAllProjectObjects(),
    {
      refetchInterval: 1000,
    }
  );
}

export function useGetAllProjects() {
  return useQuery<GetAllProjectsResponse>(
    `/projects`,
    () => projectsService.getAll(),
    {
      refetchInterval: 1000,
    }
  );
}

export function useGetFlowserVersion() {
  return useQuery<GetFlowserVersionResponse>("/version", () =>
    commonService.getFlowserVersion()
  );
}

export function useGetFlowCliInfo() {
  return useQuery<GetFlowCliInfoResponse>("/version", () =>
    commonService.getFlowCliInfo()
  );
}

export function useGetPollingEmulatorSnapshots(): TimeoutPollingHook<EmulatorSnapshot> {
  return useTimeoutPolling<
    EmulatorSnapshot,
    GetPollingEmulatorSnapshotsResponse
  >({
    resourceKey: "/snapshots/polling",
    resourceIdKey: "id",
    fetcher: ({ timestamp }) =>
      snapshotService.getAllWithPolling({
        timestamp,
      }),
  });
}
