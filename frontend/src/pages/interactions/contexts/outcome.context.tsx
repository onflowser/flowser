import { Transaction } from "@flowser/shared";
import { ServiceRegistry } from "../../../services/service-registry";
import { useGetTransaction } from "../../../hooks/use-api";
import {
  FlowInteractionDefinition,
  useInteractionDefinitionsManager,
} from "./definition.context";
import React, {
  createContext,
  ReactElement,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";

type FlowInteractionOutcome = {
  transaction: Transaction | undefined;
};

type InteractionOutcomeManager = {
  definition: FlowInteractionDefinition;
  outcome: FlowInteractionOutcome;
  update: (interaction: Partial<FlowInteractionDefinition>) => void;
  execute: () => Promise<void>;
};

const Context = createContext<InteractionOutcomeManager>(undefined as any);

export function InteractionOutcomeManagerProvider(props: {
  interactionId: string;
  children: ReactNode;
}): ReactElement {
  const { walletService } = ServiceRegistry.getInstance();
  const { definitions, setDefinitions } = useInteractionDefinitionsManager();
  const [transactionId, setTransactionId] = useState<string>();
  const { data: transactionData } = useGetTransaction(transactionId);
  const outcome = useMemo<FlowInteractionOutcome>(
    () => ({
      transaction: transactionData?.transaction,
    }),
    []
  );

  function update(partialUpdated: Partial<FlowInteractionDefinition>) {
    setDefinitions((openInteractions) =>
      openInteractions.map((existing) =>
        existing.id === props.interactionId
          ? { ...existing, ...partialUpdated }
          : existing
      )
    );
  }

  const definition = definitions.find(
    (interaction) => interaction.id === props.interactionId
  );

  if (!definition) {
    throw new Error("Assertion error: Expected interaction value");
  }

  async function execute() {
    if (!definition) {
      throw new Error("Assertion error: Expected interaction value");
    }
    const accountAddress = "0xf8d6e0586b0a20c7";
    const transactionResult = await walletService.sendTransaction({
      cadence: definition.code,
      authorizerAddresses: [],
      proposerAddress: accountAddress,
      payerAddress: accountAddress,
    });
    setTransactionId(transactionResult.transactionId);
  }

  return (
    <Context.Provider value={{ update, execute, definition, outcome }}>
      {props.children}
    </Context.Provider>
  );
}

export function useInteractionOutcomeManager(): InteractionOutcomeManager {
  const context = useContext(Context);

  if (context === undefined) {
    throw new Error("Interaction outcome manager provider not found");
  }

  return context;
}
