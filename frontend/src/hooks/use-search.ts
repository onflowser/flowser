import { useCallback } from "react";
import { UiState, useUiStateContext } from "../contexts/ui-state.context";

export interface UseSearchHook {
  setSearchTerm: (term: string) => void;
  setPlaceholder: (placeholder: string) => void;
  updateSearchBar: (placeholder: string, disabled: boolean) => void;
  searchTerm: string;
  placeholder: string;
}

export const useSearch = (context = "default"): UseSearchHook => {
  const [state, setState] = useUiStateContext();

  const setSearchTerm = (term: string) =>
    setState((state: UiState) => ({
      ...state,
      searchTerm: { ...state.searchTerm, [context]: term },
    }));

  const setPlaceholder = (placeholder: string) =>
    setState((state: UiState) => ({
      ...state,
      placeholder: { ...state.placeholder, [context]: placeholder },
    }));

  const updateSearchBar = useCallback((placeholder: string) => {
    setPlaceholder(placeholder);
  }, []);

  return {
    setSearchTerm,
    setPlaceholder,
    updateSearchBar,
    searchTerm: state.searchTerm[context] || "",
    placeholder: state.placeholder[context] || "",
  };
};
