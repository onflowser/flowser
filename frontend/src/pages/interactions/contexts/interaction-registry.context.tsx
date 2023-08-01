import React, {
  createContext,
  ReactElement,
  useContext,
  useMemo,
  useState,
} from "react";
import { FclValueLookupByIdentifier } from "./definition.context";
import { useLocalStorage } from "usehooks-ts";
import { FclValue } from "@flowser/shared";

type InteractionsRegistry = {
  templates: InteractionDefinitionTemplate[];
  definitions: InteractionDefinition[];
  focusedDefinition: InteractionDefinition;
  getById: (id: string) => InteractionDefinition;
  update: (interaction: InteractionDefinition) => void;
  create: (interaction: InteractionDefinition) => void;
  setFocused: (interactionId: string) => void;
  persist: (interactionId: string) => void;
  forkTemplate: (template: InteractionDefinitionTemplate) => void;
};

export type InteractionDefinition = {
  id: string;
  name: string;
  sourceCode: string;
  initialFclValuesByIdentifier: FclValueLookupByIdentifier;
  initialOutcome: FlowInteractionOutcome;
  transactionOptions: TransactionOptions;
};

export type InteractionDefinitionTemplate = {
  id: string;
  name: string;
  sourceCode: string;
  initialFclValuesByIdentifier: FclValueLookupByIdentifier;
  transactionOptions: TransactionOptions;
  createdDate: Date;
  updatedDate: Date;
};

// Internal structure that's persisted in local storage.
type RawInteractionDefinitionTemplate = {
  id: string;
  name: string;
  sourceCode: string;
  initialFclValuesByIdentifier: Record<string, FclValue>;
  transactionOptions: TransactionOptions;
  createdDate: string;
  updatedDate: string;
};

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
  };
  const [rawTemplates, setRawTemplates] = useLocalStorage<
    RawInteractionDefinitionTemplate[]
  >("interactions", []);
  const templates = useMemo(
    () =>
      rawTemplates.map(
        (template): InteractionDefinitionTemplate => ({
          ...template,
          createdDate: new Date(template.createdDate),
          updatedDate: new Date(template.updatedDate),
          initialFclValuesByIdentifier: new Map(
            Object.entries(template.initialFclValuesByIdentifier)
          ),
        })
      ),
    [rawTemplates]
  );
  const [definitions, setDefinitions] = useState<InteractionDefinition[]>([
    initialInteractionDefinition,
  ]);
  const [focusedInteractionId, setFocusedInteractionId] = useState<string>(
    definitions[0].id
  );

  function persist(interactionId: string) {
    const interaction = getById(interactionId);

    setRawTemplates([
      ...rawTemplates,
      {
        id: crypto.randomUUID(),
        name: interaction.name,
        sourceCode: interaction.sourceCode,
        initialFclValuesByIdentifier: Object.fromEntries(
          interaction.initialFclValuesByIdentifier
        ),
        transactionOptions: interaction.transactionOptions,
        createdDate: new Date().toISOString(),
        updatedDate: new Date().toISOString(),
      },
    ]);
  }

  function forkTemplate(template: InteractionDefinitionTemplate) {
    setDefinitions([
      ...definitions,
      {
        id: crypto.randomUUID(),
        name: template.name,
        sourceCode: template.sourceCode,
        initialFclValuesByIdentifier: new Map(
          Object.entries(template.initialFclValuesByIdentifier)
        ),
        transactionOptions: template.transactionOptions,
        initialOutcome: {},
      },
    ]);
  }

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

  function create(newInteraction: InteractionDefinition) {
    const isExisting = definitions.some(
      (definition) => definition.id === newInteraction.id
    );
    if (!isExisting) {
      setDefinitions([...definitions, newInteraction]);
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
        forkTemplate,
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
