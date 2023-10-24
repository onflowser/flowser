import useSWR, { SWRResponse } from "swr";
import {
  FlowAccount,
  FlowAccountKey,
  FlowAccountStorage,
  FlowBlock, FlowCliInfo,
  FlowContract,
  FlowEvent,
  FlowserWorkspace, FlowserUsageRequirement,
  FlowStateSnapshot,
  FlowTransaction, InteractionTemplate,
  ManagedProcessOutput, ParsedInteractionOrError
} from '@onflowser/api';
import { useServiceRegistry } from "./contexts/service-registry.context";
import { InteractionDefinition } from './interactions/core/core-types';
import { useEffect } from "react";

export function useGetAccounts(): SWRResponse<FlowAccount[]> {
  const { accountIndex } = useServiceRegistry();
  return useSWR("accounts", () => accountIndex.findAll(), {
    refreshInterval: 1000,
  });
}

export function useGetAccount(
  id: string
): SWRResponse<FlowAccount | undefined> {
  const { accountIndex } = useServiceRegistry();
  return useSWR(`account/${id}`, () => accountIndex.findOneById(id), {
    refreshInterval: 1000,
  });
}

export function useGetKeysByAccount(id: string): SWRResponse<FlowAccountKey[]> {
  const { accountIndex } = useServiceRegistry();
  return useSWR(
    `account/${id}`,
    () => accountIndex.findOneById(id).then((res) => res?.keys ?? []),
    {
      refreshInterval: 1000,
    }
  );
}

export function useGetStoragesByAccount(
  id: string
): SWRResponse<FlowAccountStorage[]> {
  const { accountStorageIndex } = useServiceRegistry();
  return useSWR(
    `${id}/storages`,
    () =>
      accountStorageIndex
        .findAll()
        .then((res) => res.filter((e) => e.address === id)),
    {
      refreshInterval: 1000,
    }
  );
}

export function useGetContractsByAccount(
  address: string
): SWRResponse<FlowContract[]> {
  const { contractIndex } = useServiceRegistry();
  return useSWR(
    `contracts`,
    () =>
      contractIndex
        .findAll()
        .then((res) => res.filter((e) => e.address === address)),
    {
      refreshInterval: 1000,
    }
  );
}

export function useGetTransactions(): SWRResponse<FlowTransaction[]> {
  const { transactionsIndex } = useServiceRegistry();
  return useSWR(`transactions`, () => transactionsIndex.findAll(), {
    refreshInterval: 1000,
  });
}

export function useGetTransaction(
  id: string
): SWRResponse<FlowTransaction | undefined> {
  const { transactionsIndex } = useServiceRegistry();
  return useSWR(`transaction/${id}`, () => transactionsIndex.findOneById(id), {
    refreshInterval: 1000,
  });
}

export function useGetTransactionsByAccount(
  address: string
): SWRResponse<FlowTransaction[]> {
  const { transactionsIndex } = useServiceRegistry();
  return useSWR(
    `${address}/transactions`,
    () =>
      transactionsIndex
        .findAll()
        .then((res) =>
          res.filter(
            (e) =>
              e.authorizers.includes(address) ||
              e.payer === address ||
              e.proposalKey.address === address
          )
        ),
    {
      refreshInterval: 1000,
    }
  );
}

export function useGetTransactionsByBlock(
  blockId: string
): SWRResponse<FlowTransaction[]> {
  const { transactionsIndex } = useServiceRegistry();
  return useSWR(
    `${blockId}/transactions`,
    () =>
      transactionsIndex
        .findAll()
        .then((res) => res.filter((e) => e.blockId === blockId)),
    {
      refreshInterval: 1000,
    }
  );
}

export function useGetBlock(id: string): SWRResponse<FlowBlock | undefined> {
  const { blocksIndex } = useServiceRegistry();

  return useSWR(`blocks/${id}`, () => blocksIndex.findOneById(id), {
    refreshInterval: 1000,
  });
}

export function useGetBlocks(): SWRResponse<FlowBlock[]> {
  const { blocksIndex } = useServiceRegistry();

  return useSWR(`blocks`, () => blocksIndex.findAll(), {
    refreshInterval: 1000,
  });
}

export function useGetContracts(): SWRResponse<FlowContract[]> {
  const { contractIndex } = useServiceRegistry();

  return useSWR(`contracts`, () => contractIndex.findAll(), {
    refreshInterval: 1000,
  });
}

export function useGetContract(
  id: string
): SWRResponse<FlowContract | undefined> {
  const { contractIndex } = useServiceRegistry();

  return useSWR(`contracts/${id}`, () => contractIndex.findOneById(id), {
    refreshInterval: 1000,
  });
}

export function useGetEvents(): SWRResponse<FlowEvent[]> {
  const { eventsIndex } = useServiceRegistry();

  return useSWR(`events`, () => eventsIndex.findAll(), {
    refreshInterval: 1000,
  });
}

export function useGetEventsByTransaction(
  id: string
): SWRResponse<FlowEvent[]> {
  const { eventsIndex } = useServiceRegistry();

  return useSWR(
    `${id}/events`,
    () =>
      eventsIndex
        .findAll()
        .then((res) => res.filter((e) => e.transactionId === id)),
    {
      refreshInterval: 1000,
    }
  );
}

export function useGetOutputsByProcess(
  id: string
): SWRResponse<ManagedProcessOutput[]> {
  const { processOutputIndex } = useServiceRegistry();

  return useSWR(
    `${id}/outputs`,
    () =>
      processOutputIndex
        .findAll()
        .then((res) => res.filter((e) => e.processId === id)),
    {
      refreshInterval: 1000,
    }
  );
}

export function useGetEvent(id: string): SWRResponse<FlowEvent | undefined> {
  const { eventsIndex } = useServiceRegistry();

  return useSWR(`events/${id}`, () => eventsIndex.findOneById(id), {
    refreshInterval: 1000,
  });
}

export function useGetStateSnapshots(): SWRResponse<FlowStateSnapshot[]> {
  const { snapshotService } = useServiceRegistry();

  return useSWR(`snapshots`, () => snapshotService.findAll(), {
    refreshInterval: 1000,
  });
}

export function useGetWorkspaces(): SWRResponse<FlowserWorkspace[]> {
  const { workspaceService } = useServiceRegistry();

  return useSWR("workspaces", () =>workspaceService.list());
}

export function useGetWorkspace(
  id: string
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
  return useSWR(`account-index/${address}`, () => flowService.getIndexOfAddress(address));
}

export function useGetParsedInteraction(
  request: InteractionDefinition
): SWRResponse<ParsedInteractionOrError> {
  const { interactionsService } = useServiceRegistry();

  // We are not using `sourceCode` as the cache key,
  // to avoid the flickering UI effect that's caused
  // by undefined parsed interaction every time the source code changes.
  const state = useSWR(`parsed-interaction/${request.id}`, () => (interactionsService.parse(request.code)));

  useEffect(() => {
    state.mutate();
  }, [request.code]);

  return state;
}

export function useGetInteractionTemplates(): SWRResponse<InteractionTemplate[]> {
  const { interactionsService } = useServiceRegistry();

  return useSWR(`interaction-templates`, () => (interactionsService.getTemplates()));
}

export function useGetFlowserUsageRequirements(): SWRResponse<FlowserUsageRequirement[]> {
  // TODO(restructure): Implement and move to electron dir only
  return useSWR(`usage-requirements`, () => ([]));
}
