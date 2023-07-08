import React, {
  createContext,
  Dispatch,
  ReactElement,
  SetStateAction,
  useContext,
  useState,
} from "react";
import { InteractionDefinition } from "../interaction-definition";
import { usePlatformAdapter } from "../../../contexts/platform-adapter.context";

type InteractionsDefinitionsManager = {
  definitions: InteractionDefinition[];
  setDefinitions: Dispatch<SetStateAction<InteractionDefinition[]>>;
};

const Context = createContext<InteractionsDefinitionsManager>(undefined as any);

export function InteractionDefinitionsManagerProvider(props: {
  children: React.ReactNode;
}): ReactElement {
  const { cadenceParser } = usePlatformAdapter();
  const [definitions, setDefinitions] = useState<InteractionDefinition[]>([
    new InteractionDefinition({
      id: "demo",
      sourceCode: "transaction {}",
      cadenceParser,
    }),
  ]);

  return (
    <Context.Provider
      value={{
        definitions,
        setDefinitions,
      }}
    >
      {props.children}
    </Context.Provider>
  );
}

export function useInteractionDefinitionsManager(): InteractionsDefinitionsManager {
  const context = useContext(Context);

  if (context === undefined) {
    throw new Error("Interaction definitions manager provider not found");
  }

  return context;
}
