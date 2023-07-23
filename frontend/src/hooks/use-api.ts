import {
  Account,
  AccountContract,
  AccountKey,
  AccountStorageItem,
  Transaction,
  Block,
  Event,
  ManagedProcessOutput,
  ManagedProcess,
  GetFlowserVersionResponse,
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
  GetPollingOutputsResponse,
  EmulatorSnapshot,
  GetPollingEmulatorSnapshotsResponse,
  GetProjectObjectsResponse,
  GetPollingManagedProcessesResponse,
  GetProjectRequirementsResponse,
  GetProjectStatusResponse,
  Project,
  GetPollingProjectsResponse,
  ServiceStatus,
  FlowserError,
  GetParsedInteractionRequest,
  GetParsedInteractionResponse,
} from "@flowser/shared";
import { ServiceRegistry } from "../services/service-registry";
import { useQuery } from "react-query";
import {
  useTimeoutPolling,
  TimeoutPollingHook,
  useTimeoutPollingState,
  useProjectTimeoutPolling,
} from "contexts/timeout-polling.context";
import { useEffect, useState } from "react";

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
  interactionsService,
} = ServiceRegistry.getInstance();

export function useGetPollingAccounts(): TimeoutPollingHook<Account> {
  return useProjectTimeoutPolling<Account, GetPollingAccountsResponse>({
    resourceKey: "/accounts/polling",
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
    fetcher: (data) =>
      transactionsService.getAllByAccountWithPolling({
        ...data,
        accountAddress,
      }),
  });
}

export function useGetPollingContractsByAccount(
  accountAddress: string
): TimeoutPollingHook<AccountContract> {
  return useTimeoutPolling<AccountContract, GetPollingContractsResponse>({
    resourceKey: `/accounts/${accountAddress}/contracts/polling`,
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
    fetcher: ({ timestamp }) =>
      storageService.getAllByAccountWithPolling({ timestamp, accountAddress }),
  });
}

export function useGetPollingKeysByAccount(
  accountAddress: string
): TimeoutPollingHook<AccountKey> {
  return useTimeoutPolling<AccountKey, GetPollingKeysResponse>({
    resourceKey: `/accounts/${accountAddress}/keys/polling`,
    fetcher: ({ timestamp }) =>
      accountsService.getAllKeysByAccountWithPolling({
        timestamp,
        accountAddress,
      }),
  });
}

export function useGetPollingContracts(): TimeoutPollingHook<AccountContract> {
  return useProjectTimeoutPolling<AccountContract, GetPollingContractsResponse>(
    {
      resourceKey: "/contracts/polling",
      fetcher: ({ timestamp }) =>
        contractsService.getAllWithPolling({ timestamp }),
    }
  );
}

export function useGetContract(contractId: string) {
  return useQuery<GetSingleContractResponse>(
    `/contract/${contractId}`,
    () => contractsService.getSingle(contractId),
    {
      refetchInterval: 2000,
    }
  );
}

export function useGetPollingTransactions(): TimeoutPollingHook<Transaction> {
  return useProjectTimeoutPolling<Transaction, GetPollingTransactionsResponse>({
    resourceKey: "/transactions/polling",
    fetcher: ({ timestamp }) =>
      transactionsService.getAllWithPolling({ timestamp }),
  });
}

export function useGetPollingBlocks(): TimeoutPollingHook<Block> {
  return useProjectTimeoutPolling<Block, GetPollingBlocksResponse>({
    resourceKey: "/blocks/polling",
    fetcher: ({ timestamp }) => blocksService.getAllWithPolling({ timestamp }),
  });
}

export function useGetBlock(blockId: string) {
  return useQuery<GetSingleBlockResponse>(`/blocks/${blockId}`, () =>
    blocksService.getSingle(blockId)
  );
}

export function useGetPollingEvents(): TimeoutPollingHook<Event> {
  return useProjectTimeoutPolling<Event, GetPollingEventsResponse>({
    resourceKey: "/events/polling",
    fetcher: ({ timestamp }) => eventsService.getAllWithPolling({ timestamp }),
  });
}

export function useGetPollingEventsByTransaction(
  transactionId: string
): TimeoutPollingHook<Event> {
  return useTimeoutPolling<Event, GetPollingEventsResponse>({
    resourceKey: `/transaction/${transactionId}/events/polling`,
    fetcher: ({ timestamp }) =>
      eventsService.getAllWithPollingByTransaction({
        timestamp,
        transactionId,
      }),
  });
}

export function useGetPollingOutputs(): TimeoutPollingHook<ManagedProcessOutput> {
  return useTimeoutPolling<ManagedProcessOutput, GetPollingOutputsResponse>({
    resourceKey: "/processes/outputs/polling",
    fetcher: ({ timestamp }) =>
      processesService.getAllOutputsWithPolling({ timestamp }),
  });
}

export function useGetPollingLogsByProcess(
  processId: string
): TimeoutPollingHook<ManagedProcessOutput> {
  return useTimeoutPolling<ManagedProcessOutput, GetPollingOutputsResponse>({
    resourceKey: `/processes/${processId}/outputs/polling`,
    fetcher: ({ timestamp }) =>
      processesService.getAllOutputsByProcessWithPolling({
        timestamp,
        processId,
      }),
  });
}

export function useGetPollingProcesses(): TimeoutPollingHook<ManagedProcess> {
  return useTimeoutPolling<ManagedProcess, GetPollingManagedProcessesResponse>({
    resourceKey: `/processes`,
    fetcher: ({ timestamp }) =>
      processesService.getAllProcessesWithPolling({ timestamp }),
  });
}

export function useGetTransactionsByBlock(
  blockId: string,
  options?: {
    pollingInterval?: number;
  }
): TimeoutPollingHook<Transaction> {
  return useTimeoutPolling<Transaction, GetPollingTransactionsResponse>({
    resourceKey: `/block/${blockId}/transactions/polling`,
    fetcher: ({ timestamp }) =>
      transactionsService.getAllByBlockWithPolling({
        blockId,
        timestamp,
      }),
    interval: options?.pollingInterval,
  });
}

export function useGetTransaction(transactionId: string | undefined) {
  return useQuery<GetSingleTransactionResponse>(
    `/transactions/${transactionId}`,
    () =>
      transactionId
        ? transactionsService.getSingle(transactionId)
        : GetSingleTransactionResponse.fromPartial({}),
    {
      // Poll until the transaction is found
      refetchInterval: (data) => (data?.transaction ? false : 500),
      enabled: Boolean(transactionId),
    }
  );
}

export function useCurrentProjectId(): string | undefined {
  const { data } = useGetCurrentProject();
  return data?.project?.id;
}

export const getCurrentProjectKey = "/projects/current";

export function useGetCurrentProject() {
  const { data, error, ...rest } = useQuery<GetSingleProjectResponse>(
    getCurrentProjectKey,
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
    () => projectsService.getRequirements(),
    {
      refetchInterval(data: GetProjectRequirementsResponse | undefined) {
        // Refetch only if not all requirements are satisfied
        // to verify if user fixed the required issues
        if (!data || data.missingRequirements.length > 0) {
          return 1000;
        }
        return false;
      },
    }
  );
}

export function useGatewayStatus(): {
  isInitialLoad: boolean;
  error: FlowserError | undefined;
} {
  const [error, setError] = useState<FlowserError | undefined>();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const { data } = useGetProjectStatus();

  useEffect(() => {
    if (isInitialLoad) {
      setIsInitialLoad(data?.totalBlocksToProcess !== 0);
    }
  }, [data]);

  useEffect(() => {
    if (data?.flowApiStatus === ServiceStatus.SERVICE_STATUS_OFFLINE) {
      setError({
        name: "Service Unreachable",
        message: "Flow API offline",
        description:
          "Can't reach Flow access node. Make sure Flow emulator is running without errors.",
      });
    } else {
      setError(undefined);
    }
  }, [data]);

  return {
    error,
    isInitialLoad,
  };
}

export function useGetProjectStatus(options?: {
  refetchInterval?: number;
  enabled?: boolean;
}) {
  const { refetchInterval = 1000, enabled = true } = options ?? {};
  return useQuery<GetProjectStatusResponse>(
    `/projects/status`,
    () => projectsService.getStatus(),
    { refetchInterval, enabled }
  );
}

export function useGetProjectObjects() {
  const { enabled } = useTimeoutPollingState();
  return useQuery<GetProjectObjectsResponse>(
    `/flow/objects`,
    () => projectsService.getAllProjectObjects(),
    {
      refetchInterval: 1000,
      enabled,
    }
  );
}

export function useGetAllProjects() {
  return useTimeoutPolling<Project, GetPollingProjectsResponse>({
    resourceKey: "/projects/polling",
    fetcher: ({ timestamp }) =>
      projectsService.getAllWithPolling({ timestamp }),
  });
}

export function useGetFlowserVersion() {
  return useQuery<GetFlowserVersionResponse>("/version", () =>
    commonService.getFlowserVersion()
  );
}

export function useGetParsedInteraction(request: GetParsedInteractionRequest) {
  return useQuery<GetParsedInteractionResponse>(request.sourceCode, () =>
    interactionsService.parseInteraction(request)
  );
}

export function useGetFlowCliInfo() {
  return useQuery<GetFlowCliInfoResponse>("/version", () =>
    commonService.getFlowCliInfo()
  );
}

export function useGetPollingEmulatorSnapshots(): TimeoutPollingHook<EmulatorSnapshot> {
  const projectId = useCurrentProjectId() ?? "";
  return useTimeoutPolling<
    EmulatorSnapshot,
    GetPollingEmulatorSnapshotsResponse
  >({
    resourceKey: `/${projectId}/snapshots/polling`,
    fetcher: ({ timestamp }) =>
      snapshotService.getAllWithPolling({ timestamp, projectId }),
  });
}
