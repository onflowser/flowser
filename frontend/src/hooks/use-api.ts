import { TimeoutPollingHook, useTimeoutPollingV2 } from "./use-timeout-polling";
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
  GetPollingEmulatorSnapshotsRequest,
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
  return useTimeoutPollingV2<Account, GetPollingAccountsResponse>({
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
  return useTimeoutPollingV2<
    Transaction,
    GetPollingTransactionsResponse,
    {
      accountAddress: string;
    }
  >({
    resourceKey: `/accounts/${accountAddress}/transactions/polling`,
    resourceIdKey: "id",
    params: { accountAddress },
    fetcher: (data) => transactionsService.getAllByAccountWithPolling(data),
  });
}

export function useGetPollingContractsByAccount(
  accountAddress: string
): TimeoutPollingHook<AccountContract> {
  return useTimeoutPollingV2<
    AccountContract,
    GetPollingContractsResponse,
    {
      accountAddress: string;
    }
  >({
    resourceKey: `/accounts/${accountAddress}/contracts/polling`,
    resourceIdKey: "id",
    params: { accountAddress },
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
  console.log("account address", accountAddress);
  return useTimeoutPollingV2<
    AccountStorageItem,
    GetPollingStorageResponse,
    {
      accountAddress: string;
    }
  >({
    resourceKey: `/accounts/${accountAddress}/storage/polling`,
    resourceIdKey: "id",
    params: { accountAddress },
    fetcher: (data) => storageService.getAllByAccountWithPolling(data),
  });
}

export function useGetPollingKeysByAccount(
  accountAddress: string
): TimeoutPollingHook<AccountKey> {
  return useTimeoutPollingV2<
    AccountKey,
    GetPollingKeysResponse,
    {
      accountAddress: string;
    }
  >({
    resourceKey: `/accounts/${accountAddress}/keys/polling`,
    resourceIdKey: "index",
    params: { accountAddress },
    fetcher: (data) => accountsService.getAllKeysByAccountWithPolling(data),
  });
}

export function useGetPollingContracts(): TimeoutPollingHook<AccountContract> {
  return useTimeoutPollingV2<AccountContract, GetPollingContractsResponse>({
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
  return useTimeoutPollingV2<Transaction, GetPollingTransactionsResponse>({
    resourceKey: "/transactions/polling",
    resourceIdKey: "id",
    fetcher: (data) => transactionsService.getAllWithPolling(data),
  });
}

export function useGetPollingBlocks(): TimeoutPollingHook<Block> {
  return useTimeoutPollingV2<Block, GetPollingBlocksResponse>({
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
  return useTimeoutPollingV2<Event, GetPollingEventsResponse>({
    resourceKey: "/events/polling",
    resourceIdKey: "id",
    fetcher: (data) => eventsService.getAllWithPolling(data),
  });
}

export function useGetPollingEventsByTransaction(
  transactionId: string
): TimeoutPollingHook<Event> {
  return useTimeoutPollingV2<
    Event,
    GetPollingEventsResponse,
    { transactionId: string }
  >({
    resourceKey: `/transaction/${transactionId}/events/polling`,
    resourceIdKey: "id",
    params: { transactionId },
    fetcher: (data) => eventsService.getAllWithPollingByTransaction(data),
  });
}

export function useGetPollingLogs(): TimeoutPollingHook<ManagedProcessLog> {
  return useTimeoutPollingV2<ManagedProcessLog, GetPollingLogsResponse>({
    resourceKey: "/processes/logs/polling",
    resourceIdKey: "id",
    fetcher: (data) => processesService.getAllLogsWithPolling(data),
  });
}

export function useGetPollingLogsByProcess(
  processId: string
): TimeoutPollingHook<ManagedProcessLog> {
  return useTimeoutPollingV2<
    ManagedProcessLog,
    GetPollingLogsResponse,
    { processId: string }
  >({
    resourceKey: `/processes/${processId}/logs/polling`,
    resourceIdKey: "id",
    params: { processId },
    fetcher: (data) => processesService.getAllLogsByProcessWithPolling(data),
  });
}

export function useGetPollingProcesses(): TimeoutPollingHook<ManagedProcess> {
  return useTimeoutPollingV2<
    ManagedProcess,
    GetPollingManagedProcessesResponse
  >({
    resourceKey: `/processes`,
    resourceIdKey: "id",
    fetcher: (data) => processesService.getAllProcessesWithPolling(data),
  });
}

export function useGetPollingTransactionsByBlock(
  blockId: string
): TimeoutPollingHook<Transaction> {
  return useTimeoutPollingV2<Transaction, GetPollingTransactionsResponse>({
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

export function useCurrentProjectId(): string | undefined {
  const { data } = useGetCurrentProject();
  return data?.project?.id;
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
  const projectId = useCurrentProjectId() ?? "";
  return useTimeoutPollingV2<
    EmulatorSnapshot,
    GetPollingEmulatorSnapshotsResponse,
    GetPollingEmulatorSnapshotsRequest
  >({
    resourceKey: "/snapshots/polling",
    resourceIdKey: "id",
    params: { projectId },
    fetcher: (data) => snapshotService.getAllWithPolling(data),
  });
}
