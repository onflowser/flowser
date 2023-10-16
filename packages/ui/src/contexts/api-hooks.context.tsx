import { createContext, ReactNode, useContext } from "react";
import { InteractionDefinition } from "../interactions/core/core-types";
import { SWRResponse } from "swr";
import {
  FlowAccount,
  FlowAccountKey,
  FlowAccountStorage,
  FlowBlock,
  FlowCliInfo,
  FlowContract,
  FlowEvent,
  FlowserProject,
  FlowserUsageRequirement,
  FlowStateSnapshot,
  FlowTransaction,
  InteractionTemplate,
  ManagedProcessOutput,
  ParsedInteractionOrError,
} from "@onflowser/api";

type FlowserHooksApi = {
  useGetAccounts(): SWRResponse<FlowAccount[]>;
  useGetAccount(id: string): SWRResponse<FlowAccount>;
  useGetKeysByAccount(address: string): SWRResponse<FlowAccountKey[]>;
  useGetStoragesByAccount(address: string): SWRResponse<FlowAccountStorage[]>;
  useGetBlocks(): SWRResponse<FlowBlock[]>;
  useGetBlock(id: string): SWRResponse<FlowBlock>;
  // TODO(restructure): Test polling of not found resources
  useGetTransaction(id: string): SWRResponse<FlowTransaction>;
  useGetTransactions(): SWRResponse<FlowTransaction[]>;
  useGetTransactionsByAccount(address: string): SWRResponse<FlowTransaction[]>;
  useGetTransactionsByBlock(id: string): SWRResponse<FlowTransaction[]>;
  useGetContracts(): SWRResponse<FlowContract[]>;
  useGetContract(id: string): SWRResponse<FlowContract>;
  useGetContractsByAccount(address: string): SWRResponse<FlowContract[]>;
  useGetStateSnapshots(): SWRResponse<FlowStateSnapshot[]>;
  useGetEvents(): SWRResponse<FlowEvent[]>;
  useGetEvent(id: string): SWRResponse<FlowEvent>;
  useGetEventsByTransaction(id: string): SWRResponse<FlowEvent[]>;
  useGetOutputsByProcess(id: string): SWRResponse<ManagedProcessOutput[]>;
  useGetFlowserProjects(): SWRResponse<FlowserProject[]>;
  useGetFlowserProject(id: string): SWRResponse<FlowserProject>;
  useGetFlowserUsageRequirements(): SWRResponse<FlowserUsageRequirement>;
  useGetInteractionTemplates(): SWRResponse<InteractionTemplate[]>;
  // TODO(restructure): See below note
  // We are not using `sourceCode` as the cache key,
  // to avoid the flickering UI effect that's caused
  // by undefined parsed interaction every time the source code changes.
  useGetParsedInteraction(
    request: InteractionDefinition
  ): SWRResponse<ParsedInteractionOrError>;
  useGetFlowCliInfo(): SWRResponse<FlowCliInfo>;
  useGetFlowJson(): SWRResponse<string>;
};

const FlowserHooksApiContext = createContext<FlowserHooksApi>(
  undefined as never
);

type FlowserHooksApiProviderProps = {
  children: ReactNode;
  hooks: FlowserHooksApi;
};

export function FlowserHooksApiProvider(props: FlowserHooksApiProviderProps) {
  return (
    <FlowserHooksApiContext.Provider value={props.hooks}>
      {props.children}
    </FlowserHooksApiContext.Provider>
  );
}

export function useFlowserHooksApi() {
  const context = useContext(FlowserHooksApiContext);

  if (context === undefined) {
    throw new Error("FlowserHooksApi context not found");
  }

  return context;
}
