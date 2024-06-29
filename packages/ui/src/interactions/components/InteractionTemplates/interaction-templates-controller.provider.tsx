import { createContext, ReactNode, useContext } from "react";

export type InteractionTemplateFilters = {
  dependencies?: {
    contractAddress?: string;
    contractName?: string;
  }
}

const Context = createContext<InteractionTemplateFilters>(undefined as never);

type Props = {
  filters: InteractionTemplateFilters;
  children: ReactNode;
}

export function InteractionTemplateFiltersProvider(props: Props) {
  return (
    <Context.Provider value={props.filters}>
      {props.children}
    </Context.Provider>
  )
}

export function useOptionalInteractionTemplateFilters(): InteractionTemplateFilters | undefined {
  return useContext(Context);
}
