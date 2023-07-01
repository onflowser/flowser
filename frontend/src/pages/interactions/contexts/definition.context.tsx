import React, {
  createContext,
  Dispatch,
  ReactElement,
  SetStateAction,
  useContext,
  useState,
} from "react";

enum FlowInteractionType {
  SCRIPT,
  TRANSACTION,
}

export type FlowInteractionDefinition = {
  id: string;
  name: string;
  type: FlowInteractionType;
  code: string;
  // TODO(feature-interact-screen): Add and formalize `arguments` field
};

type InteractionsDefinitionsManager = {
  definitions: FlowInteractionDefinition[];
  setDefinitions: Dispatch<SetStateAction<FlowInteractionDefinition[]>>;
};

const Context = createContext<InteractionsDefinitionsManager>(undefined as any);

export function InteractionDefinitionsManagerProvider(props: {
  children: React.ReactNode;
}): ReactElement {
  const [definitions, setDefinitions] = useState<FlowInteractionDefinition[]>([
    {
      id: "demo",
      name: "First transaction",
      type: FlowInteractionType.TRANSACTION,
      code: "transaction {}",
    },
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
