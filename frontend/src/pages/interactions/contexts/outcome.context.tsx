import { Transaction } from "@flowser/shared";
import { ServiceRegistry } from "../../../services/service-registry";
import { useGetTransaction } from "../../../hooks/use-api";
import { useInteractionDefinitionsManager } from "./definition.context";
import React, {
  createContext,
  ReactElement,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";
import { CommonUtils } from "../../../utils/common-utils";
import { FlowInteractionDefinition } from "../../../utils/flow-interaction-definition";

type FlowTransactionOutcome = {
  success: Transaction | undefined;
  error: string | undefined;
};

type FlowInteractionOutcome = {
  transaction: FlowTransactionOutcome;
};

type InteractionOutcomeManager = {
  definition: FlowInteractionDefinition;
  outcome: FlowInteractionOutcome;
  updateCadenceSource: (sourceCode: string) => void;
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
  const [transactionError, setTransactionError] = useState<string>();
  const { data: transactionData } = useGetTransaction(transactionId);
  const outcome = useMemo<FlowInteractionOutcome>(
    () => ({
      transaction: {
        success: transactionData?.transaction,
        error: transactionError,
      },
    }),
    [transactionData, transactionError]
  );

  function updateCadenceSource(sourceCode: string) {
    setDefinitions((openInteractions) =>
      openInteractions.map((existing) => {
        if (existing.id === props.interactionId) {
          existing.setSourceCode(sourceCode);
        }
        return existing;
      })
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
    try {
      setTransactionError(undefined);
      setTransactionId(undefined);
      const transactionResult = await walletService.sendTransaction({
        cadence: definition.sourceCode,
        authorizerAddresses: [],
        proposerAddress: accountAddress,
        payerAddress: accountAddress,
      });
      setTransactionId(transactionResult.transactionId);
    } catch (error: unknown) {
      console.log(error);
      if (CommonUtils.isStandardError(error)) {
        setTransactionError(error.message);
      }
    }
  }

  return (
    <Context.Provider
      value={{ updateCadenceSource, execute, definition, outcome }}
    >
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
