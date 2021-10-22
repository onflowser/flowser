import { useContext } from 'react';
import { UiState, UiStateContext } from '../contexts/ui-state.context';

export interface UseSearchHook {
    setSearchTerm: (term: string) => void;
    setPlaceholder: (placeholder: string) => void;
    searchTerm: string;
    placeholder: string;
}

export const useSearch = (context = 'default'): UseSearchHook => {
    const [state, setState] = useContext(UiStateContext);

    const setSearchTerm = (term: string) =>
        setState((state: UiState) => ({ ...state, searchTerm: { ...state.searchTerm, [context]: term } }));

    const setPlaceholder = (placeholder: string) =>
        setState((state: UiState) => ({
            ...state,
            placeholder: { ...state.placeholder, [context]: placeholder },
        }));

    return {
        setSearchTerm,
        setPlaceholder,
        searchTerm: state.searchTerm[context] || '',
        placeholder: state.placeholder[context] || '',
    };
};
