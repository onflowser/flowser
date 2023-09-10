import React, {
  createContext,
  ReactElement,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { FclValueLookupByIdentifier } from "./definition.context";
import { InteractionTemplate } from "@flowser/shared";

type InteractionsRegistry = {
  definitions: InteractionDefinition[];
  focusedDefinition: InteractionDefinition | undefined;
  update: (interaction: InteractionDefinition) => void;
  create: (interaction: InteractionDefinition) => void;
  remove: (interactionId: string) => void;
  setFocused: (interactionId: string) => void;
  forkTemplate: (template: InteractionDefinitionTemplate) => void;
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

  return (
    <Context.Provider
      value={{
        definitions,
        focusedDefinition,
        setFocused: setFocusedInteractionId,
        forkTemplate,
        remove,
        create,
        update,
      }}
    >
      {props.children}
    </Context.Provider>
  );
}

export function useInteractionRegistry(): InteractionsRegistry {
  const context = useContext(Context);

  if (context === undefined) {
    throw new Error("Interaction definitions registry provider not found");
  }

  return context;
}
