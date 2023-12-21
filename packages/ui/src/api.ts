import useSWR, { SWRConfiguration, SWRResponse } from "swr";
import {
  FlowAccount,
  FlowAccountKey,
  FlowAccountStorage,
  FlowBlock,
  FlowCliInfo,
  FlowContract,
  FlowEvent,
  FlowserWorkspace,
  FlowStateSnapshot,
  FlowTransaction,
  WorkspaceTemplate,
  ManagedProcessOutput,
  ParsedInteractionOrError,
  ManagedKeyPair, ManagedProcess
} from "@onflowser/api";
import { useServiceRegistry } from "./contexts/service-registry.context";
import { InteractionDefinition } from "./interactions/core/core-types";
import { useEffect } from "react";
import { TokenListProvider } from "flow-native-token-registry";
import { ensureNonPrefixedAddress } from "@onflowser/core";

export function useGetAccounts(): SWRResponse<FlowAccount[]> {
  const { accountIndex } = useServiceRegistry();
  return useSWR("accounts", () => accountIndex.findAll());
}

export function useGetAccount(
  id: string,
): SWRResponse<FlowAccount | undefined> {
  const { accountIndex } = useServiceRegistry();
  return useSWR(`account/${id}`, () => accountIndex.findOneById(id));
}

export function useGetKeysByAccount(
  address: string,
): SWRResponse<FlowAccountKey[]> {
  const { accountKeyIndex } = useServiceRegistry();
  return useSWR(`${address}/keys`, () =>
    accountKeyIndex
      .findAll()
      .then((res) => res.filter((e) => e.address === address)),
  );
}

export function useGetManagedKeys(): SWRResponse<ManagedKeyPair[]> {
  const { walletService } = useServiceRegistry();
  return useSWR(`managed-keys`, () => walletService.listKeyPairs());
}

export function useGetStoragesByAccount(
  id: string,
): SWRResponse<FlowAccountStorage[]> {
  const { accountStorageIndex } = useServiceRegistry();
  return useSWR(`${id}/storages`, () =>
    accountStorageIndex
      .findAll()
      .then((res) => res.filter((e) => e.address === id)),
  );
}

export function useGetContractsByAccount(
  address: string,
): SWRResponse<FlowContract[]> {
  const { contractIndex } = useServiceRegistry();
  return useSWR(`${address}/contracts`, () =>
    contractIndex
      .findAll()
      .then((res) => res.filter((e) => e.address === address)),
  );
}

export function useGetTransactions(): SWRResponse<FlowTransaction[]> {
  const { transactionsIndex } = useServiceRegistry();
  return useSWR(`transactions`, () => transactionsIndex.findAll());
}

export function useGetTransaction(
  id: string,
  options?: SWRConfiguration,
): SWRResponse<FlowTransaction | undefined> {
  const { transactionsIndex } = useServiceRegistry();
  return useSWR(
    `transaction/${id}`,
    () => transactionsIndex.findOneById(id),
    options,
  );
}

export function useGetTransactionsByAccount(
  address: string,
): SWRResponse<FlowTransaction[]> {
  const { transactionsIndex } = useServiceRegistry();
  return useSWR(`${address}/transactions`, () =>
    transactionsIndex
      .findAll()
      .then((res) =>
        res.filter(
          (e) =>
            e.authorizers.includes(address) ||
            e.payer === address ||
            e.proposalKey.address === address,
        ),
      ),
  );
}

export function useGetTransactionsByBlock(
  blockId: string,
): SWRResponse<FlowTransaction[]> {
  const { transactionsIndex } = useServiceRegistry();
  return useSWR(`${blockId}/transactions`, () =>
    transactionsIndex
      .findAll()
      .then((res) => res.filter((e) => e.blockId === blockId)),
  );
}

export function useGetBlock(id: string): SWRResponse<FlowBlock | undefined> {
  const { blocksIndex } = useServiceRegistry();

  return useSWR(`blocks/${id}`, () => blocksIndex.findOneById(id));
}

export function useGetBlocks(): SWRResponse<FlowBlock[]> {
  const { blocksIndex } = useServiceRegistry();

  return useSWR(`blocks`, () => blocksIndex.findAll());
}

export function useGetContracts(): SWRResponse<FlowContract[]> {
  const { contractIndex } = useServiceRegistry();

  return useSWR(`contracts`, () => contractIndex.findAll());
}

export function useGetContract(
  id: string,
): SWRResponse<FlowContract | undefined> {
  const { contractIndex } = useServiceRegistry();

  return useSWR(`contracts/${id}`, () => contractIndex.findOneById(id));
}

export function useGetEvents(): SWRResponse<FlowEvent[]> {
  const { eventsIndex } = useServiceRegistry();

  return useSWR(`events`, () => eventsIndex.findAll());
}

export function useGetEventsByTransaction(
  transaction: FlowTransaction,
): SWRResponse<FlowEvent[]> {
  const { eventsIndex } = useServiceRegistry();

  return useSWR(`${transaction.id}/events`, () =>
    eventsIndex
      .findAll()
      .then((res) => res.filter((e) => e.transactionId === transaction.id)),
  );
}

export function useGetEventsByContract(
  contract: FlowContract,
): SWRResponse<FlowEvent[]> {
  const { eventsIndex } = useServiceRegistry();

  return useSWR(`${contract.id}/events`, () =>
    eventsIndex
      .findAll()
      .then((res) =>
        res.filter((e) =>
          e.type.startsWith(
            `A.${ensureNonPrefixedAddress(contract.address)}.${contract.name}`,
          ),
        ),
      ),
  );
}

export function useGetProcesses(
): SWRResponse<ManagedProcess[]> {
  const { processManagerService } = useServiceRegistry();

  return useSWR(`processes`, () =>
    processManagerService.listProcesses(),
  );
}

export function useGetOutputsByProcess(
  id: string,
): SWRResponse<ManagedProcessOutput[]> {
  const { processManagerService } = useServiceRegistry();

  return useSWR(`${id}/outputs`, () =>
    processManagerService.listLogsByProcessId(id),
  );
}

export function useGetEvent(id: string): SWRResponse<FlowEvent | undefined> {
  const { eventsIndex } = useServiceRegistry();

  return useSWR(`events/${id}`, () => eventsIndex.findOneById(id));
}

export function useGetStateSnapshots(): SWRResponse<FlowStateSnapshot[]> {
  const { snapshotService } = useServiceRegistry();

  return useSWR(`snapshots`, () => snapshotService.list());
}

export function useGetWorkspaces(): SWRResponse<FlowserWorkspace[]> {
  const { workspaceService } = useServiceRegistry();

  return useSWR("workspaces", () => workspaceService.list());
}

export function useGetWorkspace(
  id: string,
): SWRResponse<FlowserWorkspace | undefined> {
  const { workspaceService } = useServiceRegistry();

  return useSWR(`projects/${id}`, () => workspaceService.findById(id));
}

export function useGetFlowCliInfo(): SWRResponse<FlowCliInfo> {
  const { flowService } = useServiceRegistry();

  return useSWR(`flow-cli`, () => flowService.getFlowCliInfo());
}

export function useGetAddressIndex(address: string): SWRResponse<number> {
  const { flowService } = useServiceRegistry();
  return useSWR(`account-index/${address}`, () =>
    flowService.getIndexOfAddress(address),
  );
}

export function useGetParsedInteraction(
  request: InteractionDefinition,
): SWRResponse<ParsedInteractionOrError> {
  const { interactionsService } = useServiceRegistry();

  // We are not using `sourceCode` as the cache key,
  // to avoid the flickering UI effect that's caused
  // by undefined parsed interaction every time the source code changes.
  const state = useSWR(`parsed-interaction/${request.id}`, () =>
    interactionsService.parse(request.code),
  );

  useEffect(() => {
    state.mutate();
  }, [request.code]);

  return state;
}

export function useGetWorkspaceInteractionTemplates(): SWRResponse<
  WorkspaceTemplate[]
> {
  const { interactionsService } = useServiceRegistry();

  return useSWR(`workspace-interaction-templates`, () =>
    interactionsService.getTemplates(),
  );
}

export function useGetFlowConfigContracts() {
  const { flowConfigService } = useServiceRegistry();
  return useSWR("flow-config/contracts", () =>
    flowConfigService.getContracts(),
  );
}

export function useGetFlowConfigAccounts() {
  const { flowConfigService } = useServiceRegistry();
  return useSWR("flow-config/accounts", () => flowConfigService.getAccounts());
}

export function useGetTokenMetadataList() {
  return useSWR("token-list", async () => {
    const tokenListContainer = await new TokenListProvider().resolve();
    return tokenListContainer.getList();
  });
}
