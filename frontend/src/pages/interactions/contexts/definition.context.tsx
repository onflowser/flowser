import React, {
  createContext,
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  InteractionDefinition,
  TransactionOptions,
  useInteractionRegistry,
} from "./interaction-registry.context";
import { useGetParsedInteraction } from "../../../hooks/use-api";
import { FclValue, InteractionKind, Parameter } from "@flowser/shared";

type InteractionDefinitionManager = InteractionParameterBuilder & {
  isParsing: boolean;
  parseError: string | undefined;
  interactionKind: InteractionKind;
  parameters: Parameter[];
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
  const [fclValuesByIdentifier, setFclValuesByIdentifier] = useState(
    new Map<string, FclValue>(definition.initialFclValuesByIdentifier)
  );

  useEffect(() => {
    setFclValuesByIdentifier(definition.initialFclValuesByIdentifier);
  }, [definition.initialFclValuesByIdentifier]);

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
    setFclValuesByIdentifier((oldMapping) => {
      const newMapping = new Map(oldMapping);
      newMapping.set(identifier, value);
      return newMapping;
    });
  }

  return (
    <Context.Provider
      value={{
        definition,
        setSourceCode,
        setFclValue,
        setTransactionOptions,
        fclValuesByIdentifier,
        interactionKind:
          data?.interaction?.kind ?? InteractionKind.INTERACTION_UNKNOWN,
        parameters: data?.interaction?.parameters ?? [],
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
