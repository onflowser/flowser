import React, {
  createContext,
  Dispatch,
  ReactElement,
  SetStateAction,
  useContext,
  useState,
} from "react";
import { FlowInteractionDefinition } from "../../../utils/flow-interaction-definition";
import { usePlatformAdapter } from "../../../contexts/platform-adapter.context";

type InteractionsDefinitionsManager = {
  definitions: FlowInteractionDefinition[];
  setDefinitions: Dispatch<SetStateAction<FlowInteractionDefinition[]>>;
};

const Context = createContext<InteractionsDefinitionsManager>(undefined as any);

export function InteractionDefinitionsManagerProvider(props: {
  children: React.ReactNode;
}): ReactElement {
  const { cadenceParser } = usePlatformAdapter();
  const [definitions, setDefinitions] = useState<FlowInteractionDefinition[]>([
    new FlowInteractionDefinition({
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
