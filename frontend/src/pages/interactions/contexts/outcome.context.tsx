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
import {
  FlowInteractionDefinition,
  FlowInteractionType,
} from "../../../utils/flow-interaction-definition";
// @ts-ignore
import * as fcl from "@onflow/fcl";

export type FlowTransactionOutcome = {
  success: Transaction | undefined;
  error: string | undefined;
};

export type FlowScriptOutcome = {
  success: unknown; // Script result
  error: string | undefined;
};

type FlowInteractionOutcome = {
  transaction: FlowTransactionOutcome;
  script: FlowScriptOutcome;
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
  const [scriptResult, setScriptResult] = useState<unknown>();
  const [executionError, setExecutionError] = useState<string>();
  const { data: transactionData } = useGetTransaction(transactionId);
  const outcome = useMemo<FlowInteractionOutcome>(
    () => ({
      transaction: {
        success: transactionData?.transaction,
        error: executionError,
      },
      script: {
        success: scriptResult,
        error: executionError,
      },
    }),
    [transactionData, executionError, scriptResult]
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
    switch (definition.type) {
      case FlowInteractionType.SCRIPT:
        return executeScript(definition);
      case FlowInteractionType.TRANSACTION:
        return executeTransaction(definition);
      default:
        // TODO(feature-interact-screen): If there are syntax errors, interaction will be treated as "unknown"
        throw new Error(`Can't execute interaction: ${definition.type}`);
    }
  }

  async function executeTransaction(definition: FlowInteractionDefinition) {
    const accountAddress = "0xf8d6e0586b0a20c7";
    try {
      setExecutionError(undefined);
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
        setExecutionError(error.message);
      }
    }
  }

  async function executeScript(definition: FlowInteractionDefinition) {
    try {
      setExecutionError(undefined);
      setScriptResult(undefined);
      const response = await fcl.query({
        cadence: definition.sourceCode,
      });
      setScriptResult(response);
    } catch (error: unknown) {
      console.error(error);
      if (CommonUtils.isStandardError(error)) {
        setExecutionError(error.message);
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
