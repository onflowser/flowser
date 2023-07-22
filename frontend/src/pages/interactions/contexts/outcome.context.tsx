import { ServiceRegistry } from "../../../services/service-registry";
import { InteractionDefinition } from "./definitions-registry.context";
import React, {
  createContext,
  ReactElement,
  ReactNode,
  useContext,
  useState,
} from "react";
import { CommonUtils } from "../../../utils/common-utils";
// @ts-ignore FCL types
import * as fcl from "@onflow/fcl";
import { InteractionKind } from "@flowser/shared";
import { useInteractionDefinitionManager } from "./definition.context";

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
  outcome: FlowInteractionOutcome | undefined;
  execute: () => Promise<void>;
};

const Context = createContext<InteractionOutcomeManager>(undefined as any);

type FlowArgBuilder = (value: unknown, type: unknown) => void;
type FlowArgTypeLookup = Record<string, unknown>;

export function InteractionOutcomeManagerProvider(props: {
  children: ReactNode;
}): ReactElement {
  const {
    definition,
    parameterValuesByIndex,
    parameterTypes,
    interactionKind,
  } = useInteractionDefinitionManager();
  const { walletService } = ServiceRegistry.getInstance();
  const [outcome, setOutcome] = useState<FlowInteractionOutcome>();

  async function execute() {
    if (!definition) {
      throw new Error("Assertion error: Expected interaction value");
    }
    switch (interactionKind) {
      case InteractionKind.INTERACTION_SCRIPT:
        return executeScript(definition);
      case InteractionKind.INTERACTION_TRANSACTION:
        return executeTransaction(definition);
      default:
        // TODO(feature-interact-screen): If there are syntax errors, interaction will be treated as "unknown"
        throw new Error(`Can't execute interaction: ${interactionKind}`);
    }
  }

  function buildArguments(arg: FlowArgBuilder, t: FlowArgTypeLookup) {
    return parameterTypes.map((type, index) =>
      arg(parameterValuesByIndex.get(index), t[type.rawType])
    );
  }

  async function executeTransaction(definition: InteractionDefinition) {
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

  async function executeScript(definition: InteractionDefinition) {
    try {
      setOutcome({});
      const result = await fcl.query({
        cadence: definition.sourceCode,
        args: (arg: FlowArgBuilder, t: FlowArgTypeLookup) =>
          buildArguments(arg, t),
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
    <Context.Provider value={{ execute, outcome }}>
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
