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
import { CadenceType, InteractionKind } from "@flowser/shared";

type InteractionDefinitionManager = InteractionParameterBuilder & {
  isParsing: boolean;
  parseError: string | undefined;
  interactionKind: InteractionKind;
  parameterTypes: CadenceType[];
  definition: InteractionDefinition;
  setSourceCode: (code: string) => void;
};

export type InteractionParameterBuilder = {
  parameterValuesByIndex: Map<number, unknown>;
  setParameterValueByIndex: (index: number, value: unknown) => void;
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
  const [parameterValuesByIndex, setParameterValues] = useState(new Map());

  function setSourceCode(sourceCode: string) {
    update({ ...definition, sourceCode });
  }

  function setParameterValueByIndex(index: number, value: unknown) {
    setParameterValues((oldMapping) => {
      const newMapping = new Map(oldMapping);
      newMapping.set(index, value);
      return newMapping;
    });
  }

  return (
    <Context.Provider
      value={{
        definition,
        setSourceCode,
        setParameterValueByIndex,
        parameterValuesByIndex,
        interactionKind:
          data?.interaction?.kind ?? InteractionKind.INTERACTION_UNKNOWN,
        parameterTypes: data?.interaction?.parameters ?? [],
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
