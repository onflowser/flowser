import React, {
  createContext,
  ReactElement,
  ReactNode,
  useContext,
} from "react";
import {
  InteractionDefinition,
  useInteractionDefinitionsRegistry,
} from "./definitions-registry.context";
import { useGetParsedInteraction } from "../../../hooks/use-api";
import { CadenceType, InteractionKind } from "@flowser/shared";

type InteractionDefinitionManager = {
  isParsing: boolean;
  parseError: string | undefined;
  interactionKind: InteractionKind;
  parameterTypes: CadenceType[];
  definition: InteractionDefinition;
  setSourceCode: (code: string) => void;
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

  function setSourceCode(sourceCode: string) {
    update({ ...definition, sourceCode });
  }

  return (
    <Context.Provider
      value={{
        definition,
        setSourceCode,
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
