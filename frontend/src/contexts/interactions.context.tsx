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

export type FlowInteraction = {
  id: string;
  name: string;
  type: FlowInteractionType;
  code: string;
  // TODO(feature-interact-screen): Add and formalize `arguments` field
};

type InteractionsContext = {
  openInteractions: FlowInteraction[];
  setOpenInteractions: Dispatch<SetStateAction<FlowInteraction[]>>;
};

const InteractionsContextInstance = createContext<InteractionsContext>(
  undefined as any
);

type InteractionsProviderProps = {
  children: React.ReactNode;
};

export function InteractionsProvider(
  props: InteractionsProviderProps
): ReactElement {
  const [openInteractions, setOpenInteractions] = useState<FlowInteraction[]>([
    {
      id: "demo",
      name: "First transaction",
      type: FlowInteractionType.TRANSACTION,
      code: "transaction {}",
    },
  ]);

  return (
    <InteractionsContextInstance.Provider
      value={{
        openInteractions,
        setOpenInteractions,
      }}
    >
      {props.children}
    </InteractionsContextInstance.Provider>
  );
}

export function useInteractions(): InteractionsContext {
  const context = useContext(InteractionsContextInstance);

  if (context === undefined) {
    throw new Error("InteractionsContext provider not found");
  }

  return context;
}

type SingleInteractionCRUD = {
  value: FlowInteraction;
  update: (interaction: Partial<FlowInteraction>) => void;
};

export function useSingleInteractionCRUD(
  targetInteractionId: string
): SingleInteractionCRUD {
  const { openInteractions, setOpenInteractions } = useInteractions();

  function update(partialUpdated: Partial<FlowInteraction>) {
    setOpenInteractions((openInteractions) =>
      openInteractions.map((existing) =>
        existing.id === targetInteractionId
          ? { ...existing, ...partialUpdated }
          : existing
      )
    );
  }

  const value = openInteractions.find(
    (interaction) => interaction.id === targetInteractionId
  );

  if (!value) {
    throw new Error("Assertion error: Expected interaction value");
  }

  return { update, value };
}
