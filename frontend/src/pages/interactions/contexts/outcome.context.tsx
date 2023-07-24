import { ServiceRegistry } from "../../../services/service-registry";
import {
  FlowInteractionOutcome,
  InteractionDefinition,
} from "./interaction-registry.context";
import React, {
  createContext,
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { CommonUtils } from "../../../utils/common-utils";
// @ts-ignore FCL types
import * as fcl from "@onflow/fcl";
import {
  InteractionKind,
  FclValues,
  FclArgBuilder,
  FclTypeLookup,
  FclArgumentWithMetadata,
  TransactionArgument,
} from "@flowser/shared";
import { useInteractionDefinitionManager } from "./definition.context";

type InteractionOutcomeManager = {
  outcome: FlowInteractionOutcome | undefined;
  execute: () => Promise<void>;
};

const Context = createContext<InteractionOutcomeManager>(undefined as never);

export function InteractionOutcomeManagerProvider(props: {
  children: ReactNode;
}): ReactElement {
  const { definition, fclValuesByIdentifier, parameters, interactionKind } =
    useInteractionDefinitionManager();
  const { walletService } = ServiceRegistry.getInstance();
  const [outcome, setOutcome] = useState<FlowInteractionOutcome>();

  useEffect(() => {
    if (definition.initialOutcome) {
      setOutcome(definition.initialOutcome);
    }
  }, [definition]);

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

  async function executeTransaction(definition: InteractionDefinition) {
    const accountAddress = "0xf8d6e0586b0a20c7";
    try {
      setOutcome({});
      const result = await walletService.sendTransaction({
        cadence: definition.sourceCode,
        authorizerAddresses: [],
        proposerAddress: accountAddress,
        payerAddress: accountAddress,
        arguments: parameters.map((parameter): TransactionArgument => {
          if (!parameter.type) {
            throw new Error("Expecting parameter type");
          }
          return {
            valueAsJson:
              JSON.stringify(fclValuesByIdentifier.get(parameter.identifier)) ??
              "",
            type: parameter.type,
            identifier: parameter.identifier,
          };
        }),
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
        args: (arg: FclArgBuilder, t: FclTypeLookup) => {
          const fclArguments = parameters.map(
            (parameter): FclArgumentWithMetadata => {
              if (!parameter.type) {
                throw new Error("Expecting parameter type");
              }
              return {
                value: fclValuesByIdentifier.get(parameter.identifier),
                type: parameter.type,
                identifier: parameter.identifier,
              };
            }
          );
          const argumentFunction = FclValues.getArgumentFunction(fclArguments);
          return argumentFunction(arg, t);
        },
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
