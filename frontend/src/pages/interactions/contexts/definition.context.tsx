import React, {
  createContext,
  ReactElement,
  ReactNode,
  useContext,
  useState,
} from "react";
import {
  InteractionDefinition,
  useInteractionDefinitionsRegistry,
} from "./definitions-registry.context";
import { useGetParsedInteraction } from "../../../hooks/use-api";
import { InteractionKind, Parameter } from "@flowser/shared";

type InteractionDefinitionManager = InteractionParameterBuilder & {
  isParsing: boolean;
  parseError: string | undefined;
  interactionKind: InteractionKind;
  parameters: Parameter[];
  definition: InteractionDefinition;
  setSourceCode: (code: string) => void;
};

export type InteractionParameterBuilder = {
  parameterValuesByIdentifier: Map<string, unknown>;
  setParameterValueByIdentifier: (identifier: string, value: unknown) => void;
};

const Context = createContext<InteractionDefinitionManager>(undefined as any);

export function InteractionDefinitionManagerProvider(props: {
  interactionId: string;
  children: ReactNode;
}): ReactElement {
  const { getById, update } = useInteractionDefinitionsRegistry();
  const definition = getById(props.interactionId);
  const { data, isLoading } = useGetParsedInteraction({
    sourceCode: definition.sourceCode,
  });
  const [parameterValuesByIdentifier, setParameterValuesByIdentifier] =
    useState(new Map<string, unknown>());

  function setSourceCode(sourceCode: string) {
    update({ ...definition, sourceCode });
  }

  function setParameterValueByIdentifier(identifier: string, value: unknown) {
    setParameterValuesByIdentifier((oldMapping) => {
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
        setParameterValueByIdentifier,
        parameterValuesByIdentifier,
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
