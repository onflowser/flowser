import React, {
  createContext,
  ReactElement,
  ReactNode,
  useContext,
} from "react";
import {
  InteractionDefinition,
  TransactionOptions,
  useInteractionRegistry,
} from "./interaction-registry.context";
import { useGetParsedInteraction } from "../../../hooks/use-api";
import { FclValue, Interaction } from "@flowser/shared";

type InteractionDefinitionManager = InteractionParameterBuilder & {
  isParsing: boolean;
  parseError: string | undefined;
  parsedInteraction: Interaction | undefined;
  definition: InteractionDefinition;
  setSourceCode: (code: string) => void;
  setTransactionOptions: (options: Partial<TransactionOptions>) => void;
};

export type FclValueLookupByIdentifier = Map<string, FclValue>;

export type InteractionParameterBuilder = {
  fclValuesByIdentifier: FclValueLookupByIdentifier;
  setFclValue: (identifier: string, value: FclValue) => void;
};

const Context = createContext<InteractionDefinitionManager>(undefined as never);

export function InteractionDefinitionManagerProvider(props: {
  definition: InteractionDefinition;
  children: ReactNode;
}): ReactElement {
  const { definition } = props;
  const { update } = useInteractionRegistry();
  const { data, isLoading } = useGetParsedInteraction({
    sourceCode: definition.sourceCode,
  });
  const fclValuesByIdentifier = definition.fclValuesByIdentifier;

  function setSourceCode(sourceCode: string) {
    update({ ...definition, sourceCode });
  }

  function setTransactionOptions(options: Partial<TransactionOptions>) {
    update({
      ...definition,
      transactionOptions: { ...definition.transactionOptions, ...options },
    });
  }

  function setFclValue(identifier: string, value: FclValue) {
    const oldMapping = definition.fclValuesByIdentifier;
    const newMapping = new Map(oldMapping);
    newMapping.set(identifier, value);
    update({
      ...definition,
      fclValuesByIdentifier: newMapping,
    });
  }

  return (
    <Context.Provider
      value={{
        definition,
        parsedInteraction: data?.interaction,
        setSourceCode,
        setFclValue,
        setTransactionOptions,
        fclValuesByIdentifier,
        parseError: data?.error,
        isParsing: isLoading,
      }}
    >
      {props.children}
    </Context.Provider>
  );
}

export function useInteractionDefinitionManager(): InteractionDefinitionManager {
  const context = useContext(Context);

  if (context === undefined) {
    throw new Error("Interaction definition registry context not found");
  }

  return context;
}
