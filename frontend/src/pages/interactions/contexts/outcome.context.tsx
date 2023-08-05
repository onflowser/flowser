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
import toast from "react-hot-toast";

type InteractionOutcomeManager = {
  outcome: FlowInteractionOutcome | undefined;
  execute: () => Promise<void>;
};

const Context = createContext<InteractionOutcomeManager>(undefined as never);

export function InteractionOutcomeManagerProvider(props: {
  children: ReactNode;
}): ReactElement {
  const { definition, fclValuesByIdentifier, parsedInteraction } =
    useInteractionDefinitionManager();
  const { walletService } = ServiceRegistry.getInstance();
  const [outcome, setOutcome] = useState<FlowInteractionOutcome>();

  useEffect(() => {
    setOutcome(definition.initialOutcome);
  }, [definition]);

  async function execute() {
    if (!definition) {
      throw new Error("Assertion error: Expected interaction value");
    }
    if (!parsedInteraction) {
      throw new Error("Interaction not parsed yet");
    }
    switch (parsedInteraction.kind) {
      case InteractionKind.INTERACTION_SCRIPT:
        return executeScript(definition);
      case InteractionKind.INTERACTION_TRANSACTION:
        return executeTransaction(definition);
      default:
        // TODO(feature-interact-screen): If there are syntax errors, interaction will be treated as "unknown"
        throw new Error(`Can't execute interaction: ${parsedInteraction.kind}`);
    }
  }

  async function executeTransaction(definition: InteractionDefinition) {
    const { transactionOptions } = definition;
    if (!transactionOptions) {
      throw new Error("Transaction options must be set");
    }
    if (!parsedInteraction) {
      throw new Error("Interaction not parsed yet");
    }
    const unspecifiedAuthorizers = transactionOptions.authorizerAddresses
      .map((value, index) => ({ value, index }))
      .filter((e) => e.value === "");
    if (unspecifiedAuthorizers.length > 0) {
      toast.error(
        `Unspecified authorizers: ${unspecifiedAuthorizers
          .map((e) => e.index + 1)
          .join(", ")}`
      );
      return;
    }
    try {
      setOutcome({});
      const result = await walletService.sendTransaction({
        cadence: definition.sourceCode,
        authorizerAddresses: transactionOptions.authorizerAddresses,
        proposerAddress: transactionOptions.proposerAddress,
        payerAddress: transactionOptions.payerAddress,
        arguments: parsedInteraction.parameters.map(
          (parameter): TransactionArgument => {
            if (!parameter.type) {
              throw new Error("Expecting parameter type");
            }
            return {
              valueAsJson:
                JSON.stringify(
                  fclValuesByIdentifier.get(parameter.identifier)
                ) ?? "",
              type: parameter.type,
              identifier: parameter.identifier,
            };
          }
        ),
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
          if (!parsedInteraction) {
            throw new Error("Interaction not parsed yet");
          }
          const fclArguments = parsedInteraction.parameters.map(
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
