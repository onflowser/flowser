import { ServiceRegistry } from "../../../services/service-registry";
import { useInteractionDefinitionsManager } from "./definition.context";
import React, {
  createContext,
  ReactElement,
  ReactNode,
  useContext,
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
  transactionId?: string;
  error?: string;
};

export type FlowScriptOutcome = {
  result?: unknown;
  error?: string;
};

type FlowInteractionOutcome = {
  transaction?: FlowTransactionOutcome;
  script?: FlowScriptOutcome;
};

type InteractionOutcomeManager = {
  definition: FlowInteractionDefinition;
  outcome: FlowInteractionOutcome | undefined;
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
  const [outcome, setOutcome] = useState<FlowInteractionOutcome>();

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
      setOutcome({});
      const result = await walletService.sendTransaction({
        cadence: definition.sourceCode,
        authorizerAddresses: [],
        proposerAddress: accountAddress,
        payerAddress: accountAddress,
      });
      setOutcome({
        transaction: {
          transactionId: result.transactionId,
        },
      });
    } catch (error: unknown) {
      console.log(error);
      if (CommonUtils.isStandardError(error)) {
        setOutcome({
          transaction: {
            error: error.message,
          },
        });
      }
    }
  }

  async function executeScript(definition: FlowInteractionDefinition) {
    try {
      setOutcome({});
      const result = await fcl.query({
        cadence: definition.sourceCode,
      });
      setOutcome({
        script: {
          result,
        },
      });
    } catch (error: unknown) {
      console.error(error);
      if (CommonUtils.isStandardError(error)) {
        setOutcome({
          script: {
            error: error.message,
          },
        });
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
