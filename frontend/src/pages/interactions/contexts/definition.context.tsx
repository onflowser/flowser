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
  useInteractionDefinitionsRegistry,
} from "./definitions-registry.context";
import { useGetParsedInteraction } from "../../../hooks/use-api";
import { FclValue, InteractionKind, Parameter } from "@flowser/shared";

type InteractionDefinitionManager = InteractionParameterBuilder & {
  isParsing: boolean;
  parseError: string | undefined;
  interactionKind: InteractionKind;
  parameters: Parameter[];
  definition: InteractionDefinition;
  setSourceCode: (code: string) => void;
};

export type FclValueLookupByIdentifier = Map<string, FclValue>;

export type InteractionParameterBuilder = {
  fclValuesByIdentifier: FclValueLookupByIdentifier;
  setFclValue: (identifier: string, value: FclValue) => void;
};

const Context = createContext<InteractionDefinitionManager>(undefined as never);

export function InteractionDefinitionManagerProvider(props: {
  interactionId: string;
  children: ReactNode;
}): ReactElement {
  const { getById, update } = useInteractionDefinitionsRegistry();
  const definition = getById(props.interactionId);
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
