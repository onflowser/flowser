import React, {
  createContext,
  ReactElement,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { InteractionDefinition } from "../core/core-types";
import { InteractionUtils } from "../core/core-utils";

type CreateInteractionDefinition = Omit<
  InteractionDefinition,
  "id" | "createdDate" | "updatedDate"
>;

type CreateInteractionOptions = {
  allowDuplicates: boolean;
};

type InteractionsRegistry = {
  definitions: InteractionDefinition[];
  focusedDefinition: InteractionDefinition | undefined;
  create: (
    interaction: CreateInteractionDefinition,
    options?: CreateInteractionOptions
  ) => InteractionDefinition;
  update: (interaction: InteractionDefinition) => void;
  remove: (interactionId: string) => void;
  setFocused: (interactionId: string) => void;
};

const Context = createContext<InteractionsRegistry>(undefined as never);

export function InteractionRegistryProvider(props: {
  children: React.ReactNode;
}): ReactElement {
  const defaultInteraction: InteractionDefinition = {
    id: crypto.randomUUID(),
    name: "Your first interaction",
    code: "",
    fclValuesByIdentifier: new Map(),
    initialOutcome: undefined,
    transactionOptions: {
      authorizerAddresses: [],
      proposerAddress: "0xf8d6e0586b0a20c7",
      payerAddress: "0xf8d6e0586b0a20c7",
    },
    createdDate: new Date(),
    updatedDate: new Date(),
  };
  const [definitions, setDefinitions] = useState<InteractionDefinition[]>([
    defaultInteraction,
  ]);
  const [focusedInteractionId, setFocusedInteractionId] = useState<
    string | undefined
  >();
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
    const lastDefinition = newDefinitions[newDefinitions.length - 1];
    if (lastDefinition) {
      setFocusedInteractionId(lastDefinition.id);
    }
  }

  function create(
    newPartialInteraction: CreateInteractionDefinition,
    options?: CreateInteractionOptions
  ): InteractionDefinition {
    const existingInteraction = definitions.find((definition) =>
      InteractionUtils.areLogicallyEqual(newPartialInteraction, definition)
    );
    if (existingInteraction && !options?.allowDuplicates) {
      return existingInteraction;
    } else {
      const newInteractionDefinition: InteractionDefinition = {
        id: crypto.randomUUID(),
        ...newPartialInteraction,
        createdDate: new Date(),
        updatedDate: new Date(),
      };
      setDefinitions([...definitions, newInteractionDefinition]);
      return newInteractionDefinition;
    }
  }

  return (
    <Context.Provider
      value={{
        definitions,
        focusedDefinition,
        setFocused: setFocusedInteractionId,
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
