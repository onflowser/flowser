import React, {
  createContext,
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { CommonUtils } from "../../utils/common-utils";
import { useInteractionDefinitionManager } from "./definition.context";
import toast from "react-hot-toast";
import { InteractionDefinition, InteractionOutcome } from "../core/core-types";
import { FclArgumentWithMetadata, InteractionKind } from "@onflowser/api";
import { useServiceRegistry } from "../../contexts/service-registry.context";

type InteractionOutcomeManager = {
  outcome: InteractionOutcome | undefined;
  execute: () => Promise<void>;
};

const Context = createContext<InteractionOutcomeManager>(undefined as never);

export function InteractionOutcomeManagerProvider(props: {
  children: ReactNode;
}): ReactElement {
  const { definition, fclValuesByIdentifier, parsedInteraction } =
    useInteractionDefinitionManager();
  const { flowService } = useServiceRegistry();
  const [outcome, setOutcome] = useState<InteractionOutcome | undefined>();

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
        return setOutcome(await executeScript(definition));
      case InteractionKind.INTERACTION_TRANSACTION:
        return setOutcome(await executeTransaction(definition));
      default:
        // TODO(feature-interact-screen): If there are syntax errors, interaction will be treated as "unknown"
        throw new Error(`Can't execute interaction: ${parsedInteraction.kind}`);
    }
  }

  async function executeTransaction(
    definition: InteractionDefinition
  ): Promise<InteractionOutcome | undefined> {
    const { transactionOptions } = definition;
    if (!transactionOptions) {
      throw new Error("Transaction options must be set");
    }
    let hasErrors = false;
    const unspecifiedAuthorizers = transactionOptions.authorizerAddresses
      .map((value, index) => ({ value, index }))
      .filter((e) => e.value === "");
    if (unspecifiedAuthorizers.length > 0) {
      toast.error(
        `Unspecified authorizers: ${unspecifiedAuthorizers
          .map((e) => e.index + 1)
          .join(", ")}`
      );
      hasErrors = true;
    }
    if (!transactionOptions.proposerAddress) {
      toast.error("Must specify a proposer");
      hasErrors = true;
    }
    if (!transactionOptions.payerAddress) {
      toast.error("Must specify a payer");
      hasErrors = true;
    }
    if (hasErrors) {
      return undefined;
    }
    try {
      const result = await flowService.sendTransaction({
        cadence: definition.code,
        authorizerAddresses: transactionOptions.authorizerAddresses,
        proposerAddress: transactionOptions.proposerAddress,
        payerAddress: transactionOptions.payerAddress,
        arguments: serializeParameters(),
      });
      return {
        transaction: {
          transactionId: result.transactionId,
        },
      };
    } catch (error: unknown) {
      console.log(error);
      if (CommonUtils.isStandardError(error)) {
        toast.error(`Unexpected error: ${error.message}`);
      } else {
        toast.error("Unexpected error");
      }
      return undefined;
    }
  }

  async function executeScript(
    definition: InteractionDefinition
  ): Promise<InteractionOutcome | undefined> {
    try {
      const result = await flowService.executeScript({
        cadence: definition.code,
        arguments: serializeParameters(),
      });
      return {
        script: {
          result,
        },
      };
    } catch (error: unknown) {
      console.error(error);
      if (CommonUtils.isStandardError(error)) {
        return {
          script: {
            error: error.toString(),
          },
        };
      } else {
        toast.error("Unexpected error");
        return undefined;
      }
    }
  }

  function serializeParameters(): FclArgumentWithMetadata[] {
    if (!parsedInteraction) {
      throw new Error("Interaction not parsed yet");
    }
    return parsedInteraction.parameters.map(
      (parameter): FclArgumentWithMetadata => {
        if (!parameter.type) {
          throw new Error("Expecting parameter type");
        }
        const value = fclValuesByIdentifier.get(parameter.identifier);
        const reMappedValue =
          value === "" && parameter.type.optional ? undefined : value;
        return {
          value: reMappedValue,
          type: parameter.type,
          identifier: parameter.identifier,
        };
      }
    );
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
