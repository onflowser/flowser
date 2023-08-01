import React, {
  createContext,
  ReactElement,
  useContext,
  useState,
} from "react";
import { FclValueLookupByIdentifier } from "./definition.context";
import { useLocalStorage } from "usehooks-ts";

type InteractionsRegistry = {
  templates: InteractionDefinition[];
  definitions: InteractionDefinition[];
  focusedDefinition: InteractionDefinition;
  getById: (id: string) => InteractionDefinition;
  update: (interaction: InteractionDefinitionWithoutMetadata) => void;
  create: (interaction: InteractionDefinitionWithoutMetadata) => void;
  setFocused: (interactionId: string) => void;
  persist: (interactionId: string) => void;
};

export type InteractionDefinition = {
  id: string;
  name: string;
  sourceCode: string;
  initialFclValuesByIdentifier: FclValueLookupByIdentifier;
  initialOutcome: FlowInteractionOutcome;
  transactionOptions: TransactionOptions;
  // Store dates in serialization-friendly format
  createdDate: string;
  updatedDate: string;
};

type InteractionDefinitionWithoutMetadata = Omit<
  InteractionDefinition,
  "createdDate" | "updatedDate"
>;

export type TransactionOptions = {
  authorizerAddresses: string[];
  proposerAddress: string;
  payerAddress: string;
};

export type FlowTransactionOutcome = {
  transactionId?: string;
  error?: string;
};

export type FlowScriptOutcome = {
  result?: unknown;
  error?: string;
};

export type FlowInteractionOutcome = {
  transaction?: FlowTransactionOutcome;
  script?: FlowScriptOutcome;
};

const Context = createContext<InteractionsRegistry>(undefined as never);

export function InteractionRegistryProvider(props: {
  children: React.ReactNode;
}): ReactElement {
  const initialInteractionDefinition: InteractionDefinition = {
    name: "Demo",
    id: "demo",
    sourceCode: "transaction {}",
    initialFclValuesByIdentifier: new Map(),
    initialOutcome: {},
    transactionOptions: {
      authorizerAddresses: [],
      proposerAddress: "0xf8d6e0586b0a20c7",
      payerAddress: "0xf8d6e0586b0a20c7",
    },
    createdDate: new Date().toISOString(),
    updatedDate: new Date().toISOString(),
  };
  const [templates, setTemplates] = useLocalStorage<InteractionDefinition[]>(
    "interactions",
    []
  );
  const [definitions, setDefinitions] = useState<InteractionDefinition[]>([
    initialInteractionDefinition,
  ]);
  const [focusedInteractionId, setFocusedInteractionId] = useState<string>(
    definitions[0].id
  );

  function persist(interactionId: string) {
    const interaction = getById(interactionId);

    setTemplates([
      ...templates.filter((template) => template.id !== interactionId),
      { ...interaction, updatedDate: new Date().toISOString() },
    ]);
  }

  function update(updatedInteraction: InteractionDefinitionWithoutMetadata) {
    setDefinitions((interactions) =>
      interactions.map((existingInteraction) => {
        if (existingInteraction.id === updatedInteraction.id) {
          return {
            ...existingInteraction,
            ...updatedInteraction,
            updatedDate: new Date().toISOString(),
          };
        }
        return existingInteraction;
      })
    );
  }

  function create(newInteraction: InteractionDefinitionWithoutMetadata) {
    const isExisting = definitions.some(
      (definition) => definition.id === newInteraction.id
    );
    if (!isExisting) {
      setDefinitions([
        ...definitions,
        {
          ...newInteraction,
          createdDate: new Date().toISOString(),
          updatedDate: new Date().toISOString(),
        },
      ]);
    }
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
        templates,
        definitions,
        focusedDefinition: getById(focusedInteractionId),
        setFocused: setFocusedInteractionId,
        create,
        update,
        getById,
        persist,
      }}
    >
      {props.children}
    </Context.Provider>
  );
}

export function useInteractionRegistry(): InteractionsRegistry {
  const context = useContext(Context);

  if (context === undefined) {
    throw new Error("Interaction definitions manager provider not found");
  }

  return context;
}
