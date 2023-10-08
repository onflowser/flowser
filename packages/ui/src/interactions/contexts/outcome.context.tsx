import { ServiceRegistry } from "../../../../../frontend/src/services/service-registry";
import React, {
  createContext,
  ReactElement,
  ReactNode,
  useContext,
  useMemo,
} from "react";
import { CommonUtils } from "../../../../../frontend/src/utils/common-utils";
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
import { useQuery } from "react-query";
import { InteractionDefinition, InteractionOutcome } from "../core/core-types";

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
  const { walletService } = ServiceRegistry.getInstance();
  const { data, refetch } = useQuery(
    `/interactions/execute/${JSON.stringify(definition)}`,
    async () => {
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
          throw new Error(
            `Can't execute interaction: ${parsedInteraction.kind}`
          );
      }
    },
    {
      // Prevent automatic fetching when cache key changes.
      // https://tanstack.com/query/v4/docs/react/guides/disabling-queries
      enabled: false,
    }
  );

  const outcome = useMemo(
    () => data ?? definition.initialOutcome,
    [definition, data]
  );

  async function execute() {
    await refetch();
  }

  async function executeTransaction(
    definition: InteractionDefinition
  ): Promise<InteractionOutcome | undefined> {
    const { transactionOptions } = definition;
    if (!transactionOptions) {
      throw new Error("Transaction options must be set");
    }
    if (!parsedInteraction) {
      throw new Error("Interaction not parsed yet");
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
      const result = await walletService.sendTransaction({
        cadence: definition.code,
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

  async function executeScript(definition: InteractionDefinition) {
    try {
      const result = await fcl.query({
        cadence: definition.code,
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
