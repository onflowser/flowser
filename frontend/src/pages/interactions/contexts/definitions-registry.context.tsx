import React, {
  createContext,
  ReactElement,
  useContext,
  useState,
} from "react";

type InteractionsDefinitionsRegistry = {
  definitions: InteractionDefinition[];
  getById: (id: string) => InteractionDefinition;
  update: (interaction: InteractionDefinition) => void;
};

export type InteractionDefinition = {
  id: string;
  name: string;
  sourceCode: string;
};

const Context = createContext<InteractionsDefinitionsRegistry>(
  undefined as any
);

export function InteractionDefinitionsRegistryProvider(props: {
  children: React.ReactNode;
}): ReactElement {
  const initialInteractionDefinition: InteractionDefinition = {
    name: "Demo",
    id: "demo",
    sourceCode: "transaction {}",
  };
  const [definitions, setDefinitions] = useState<InteractionDefinition[]>([
    initialInteractionDefinition,
  ]);

  function update(updatedInteraction: InteractionDefinition) {
    setDefinitions((interactions) =>
      interactions.map((existingInteraction) => {
        if (existingInteraction.id === updatedInteraction.id) {
          return updatedInteraction;
        }
        return existingInteraction;
      })
    );
  }

  function getById(id: string) {
    const definition = definitions.find((definition) => definition.id === id);
    if (!definition) {
      throw new Error(`Definition not found by id: ${id}`);
    }
    return definition;
  }

  return (
    <Context.Provider
      value={{
        definitions,
        update,
        getById,
      }}
    >
      {props.children}
    </Context.Provider>
  );
}

export function useInteractionDefinitionsRegistry(): InteractionsDefinitionsRegistry {
  const context = useContext(Context);

  if (context === undefined) {
    throw new Error("Interaction definitions manager provider not found");
  }

  return context;
}
