import { useCallback } from "react";
import { UiState, useUiStateContext } from "../contexts/ui-state.context";

export interface UseSearchHook {
  setSearchTerm: (term: string) => void;
  setPlaceholder: (placeholder: string) => void;
  disableSearchBar: (disabled: boolean) => void;
  updateSearchBar: (placeholder: string, disabled: boolean) => void;
  searchTerm: string;
  placeholder: string;
  searchDisabled: boolean;
}

export const useSearch = (context = "default"): UseSearchHook => {
  const [state, setState] = useUiStateContext();

  const setSearchTerm = (term: string) =>
    setState((state: UiState) => ({
      ...state,
      searchTerm: { ...state.searchTerm, [context]: term },
    }));

  const disableSearchBar = (disabled: boolean) => {
    setState((state: UiState) => ({ ...state, searchDisabled: disabled }));
  };

  const setPlaceholder = (placeholder: string) =>
    setState((state: UiState) => ({
      ...state,
      placeholder: { ...state.placeholder, [context]: placeholder },
    }));

  const updateSearchBar = useCallback(
    (placeholder: string, disabled = false) => {
      setPlaceholder(placeholder);
      disableSearchBar(disabled);
    },
    []
  );

  return {
    setSearchTerm,
    setPlaceholder,
    updateSearchBar,
    searchTerm: state.searchTerm[context] || "",
    placeholder: state.placeholder[context] || "",
    disableSearchBar,
    searchDisabled: state.searchDisabled,
  };
};
