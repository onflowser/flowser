import React, {
  createContext,
  ReactElement,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { FclValueLookupByIdentifier } from "./definition.context";
import { useLocalStorage } from "usehooks-ts";
import { FclValue, InteractionTemplate } from "@flowser/shared";
import { useGetPollingFlowInteractionTemplates } from "../../../hooks/use-api";

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
  removeTemplate: (template: InteractionDefinitionTemplate) => void;
};

export type CoreInteractionDefinition = Omit<
  InteractionTemplate,
  "source" | "createdDate" | "updatedDate"
>;

export type InteractionDefinition = CoreInteractionDefinition & {
  fclValuesByIdentifier: FclValueLookupByIdentifier;
  initialOutcome: FlowInteractionOutcome | undefined;
  transactionOptions: TransactionOptions | undefined;
};

export type InteractionDefinitionTemplate = CoreInteractionDefinition & {
  fclValuesByIdentifier: FclValueLookupByIdentifier;
  transactionOptions: TransactionOptions | undefined;
  createdDate: Date;
  updatedDate: Date;
  isMutable: boolean;
};

// Internal structure that's persisted in local StorageDomainBadge.
type RawInteractionDefinitionTemplate = CoreInteractionDefinition & {
  fclValuesByIdentifier: Record<string, FclValue>;
  transactionOptions: TransactionOptions | undefined;
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

const helloWorldScript = `pub fun main(): String {
  return "Hello World"
}`;

const helloWorldScriptWithArguments = `pub fun main(a: String, b: String): String {
  return a.concat(" ").concat(b)
}`;

const helloWorldTransaction = `transaction() {
  prepare(signer: AuthAccount) {
    log("Preparing")
  }
  execute {
    log("Executing")    
  }
}
`;

export function InteractionRegistryProvider(props: {
  children: React.ReactNode;
}): ReactElement {
  const defaultInteraction: InteractionDefinition = {
    name: "Your first interaction",
    id: crypto.randomUUID(),
    code: "",
    fclValuesByIdentifier: new Map(),
    initialOutcome: undefined,
    transactionOptions: {
      authorizerAddresses: [],
      proposerAddress: "0xf8d6e0586b0a20c7",
      payerAddress: "0xf8d6e0586b0a20c7",
    },
  };
  const { data: projectTemplatesData } =
    useGetPollingFlowInteractionTemplates();
  const [customTemplates, setRawTemplates] = useLocalStorage<
    RawInteractionDefinitionTemplate[]
  >("interactions", []);
  const predefinedTemplates = useMemo<
    (CoreInteractionDefinition & Partial<InteractionDefinitionTemplate>)[]
  >(
    () => [
      {
        id: "hello-world-script",
        name: "Hello World",
        code: helloWorldScript,
      },
      {
        id: "script-with-arguments",
        name: "Arguments example",
        code: helloWorldScriptWithArguments,
        fclValuesByIdentifier: new Map([
          ["a", "Hello"],
          ["b", "World"],
        ]),
      },
      {
        id: "hello-world-transaction",
        name: "Hello World",
        code: helloWorldTransaction,
      },
    ],
    []
  );
  const templates = useMemo<InteractionDefinitionTemplate[]>(
    () => [
      ...predefinedTemplates.map(
        (template): InteractionDefinitionTemplate => ({
          createdDate: new Date(),
          updatedDate: new Date(),
          fclValuesByIdentifier: new Map(),
          transactionOptions: undefined,
          isMutable: false,
          ...template,
        })
      ),
      ...customTemplates.map(
        (template): InteractionDefinitionTemplate => ({
          ...template,
          createdDate: new Date(template.createdDate),
          updatedDate: new Date(template.updatedDate),
          fclValuesByIdentifier: new Map(
            Object.entries(template.fclValuesByIdentifier)
          ),
          isMutable: true,
        })
      ),
      ...(projectTemplatesData?.templates?.map(
        (template): InteractionDefinitionTemplate => ({
          ...template,
          isMutable: false,
          transactionOptions: undefined,
          fclValuesByIdentifier: new Map(),
          createdDate: new Date(template.createdDate),
          updatedDate: new Date(template.updatedDate),
        })
      ) ?? []),
    ],
    [customTemplates, projectTemplatesData]
  );
  const [definitions, setDefinitions] = useState<InteractionDefinition[]>([
    defaultInteraction,
  ]);
  const [focusedInteractionId, setFocusedInteractionId] = useState<
    string | undefined
  >(definitions?.[0]?.id);
  const focusedDefinition = useMemo(
    () =>
      definitions.find((definition) => definition.id === focusedInteractionId),
    [focusedInteractionId, definitions]
  );

  useEffect(() => {
    // Make sure there is always at least one tab open.
    // Otherwise, the UI looks weird.
    if (definitions.length === 0) {
      setDefinitions([defaultInteraction]);
      setFocusedInteractionId(defaultInteraction.id);
    }
  }, [definitions]);

  function persist(interactionId: string) {
    const interaction = getById(interactionId);

    const newTemplate: RawInteractionDefinitionTemplate = {
      id: interaction.name,
      name: interaction.name,
      code: interaction.code,
      fclValuesByIdentifier: Object.fromEntries(
        interaction.fclValuesByIdentifier
      ),
      transactionOptions: interaction.transactionOptions,
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
    };

    setRawTemplates([
      ...customTemplates.filter(
        (template) => template.name !== newTemplate.name
      ),
      newTemplate,
    ]);
  }

  function forkTemplate(template: InteractionDefinitionTemplate) {
    const definition: InteractionDefinition = {
      id: template.id,
      name: template.name,
      code: template.code,
      fclValuesByIdentifier: template.fclValuesByIdentifier,
      transactionOptions: template.transactionOptions,
      initialOutcome: undefined,
    };
    const isAlreadyOpen = definitions.some(
      (definition) => definition.id === template.id
    );
    if (!isAlreadyOpen) {
      setDefinitions([...definitions, definition]);
      setFocusedInteractionId(definition.id);
    }
  }

  function removeTemplate(template: InteractionDefinitionTemplate) {
    setRawTemplates((rawTemplates) =>
      rawTemplates.filter(
        (existingTemplate) => existingTemplate.name !== template.name
      )
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
    const newDefinitions = definitions.filter(
      (definition) => definition.id !== interactionId
    );
    setDefinitions(newDefinitions);
    const lastDefinition = newDefinitions.reverse()[0];
    if (lastDefinition) {
      setFocusedInteractionId(lastDefinition.id);
    }
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
