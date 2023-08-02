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
  focusedDefinition: InteractionDefinition | undefined;
  update: (interaction: InteractionDefinition) => void;
  create: (interaction: InteractionDefinition) => void;
  remove: (interactionId: string) => void;
  setFocused: (interactionId: string) => void;
  persist: (interactionId: string) => void;
  forkTemplate: (template: InteractionDefinitionTemplate) => void;
  removeTemplate: (templateId: string) => void;
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

const initialSourceCode = `transaction (prompt: String) {
  execute {
    log(prompt)
  }
}`;

export function InteractionRegistryProvider(props: {
  children: React.ReactNode;
}): ReactElement {
  const initialInteractionDefinition: InteractionDefinition = {
    name: "Hello World",
    id: crypto.randomUUID(),
    sourceCode: initialSourceCode,
    initialFclValuesByIdentifier: new Map([["prompt", "Hello World"]]),
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
  const [focusedInteractionId, setFocusedInteractionId] = useState<
    string | undefined
  >(definitions?.[0]?.id);
  const focusedDefinition = useMemo(
    () =>
      definitions.find((definition) => definition.id === focusedInteractionId),
    [focusedInteractionId, definitions]
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
    const definition: InteractionDefinition = {
      id: crypto.randomUUID(),
      name: template.name,
      sourceCode: template.sourceCode,
      initialFclValuesByIdentifier: new Map(
        Object.entries(template.initialFclValuesByIdentifier)
      ),
      transactionOptions: template.transactionOptions,
      initialOutcome: {},
    };
    setDefinitions([...definitions, definition]);
    setFocusedInteractionId(definition.id);
  }

  function removeTemplate(templateId: string) {
    setRawTemplates((rawTemplates) =>
      rawTemplates.filter((template) => template.id !== templateId)
    );
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

  function remove(interactionId: string) {
    setDefinitions((interactions) =>
      interactions.filter((interaction) => interaction.id !== interactionId)
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
        focusedDefinition,
        setFocused: setFocusedInteractionId,
        forkTemplate,
        removeTemplate,
        remove,
        create,
        update,
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
