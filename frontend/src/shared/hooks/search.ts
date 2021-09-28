import { useContext } from 'react';
import { UiState, UiStateContext } from '../contexts/ui-state.context';

export interface UseSearchHook {
    setSearchTerm: (term: string) => void;
    setPlaceholder: (placeholder: string) => void;
    searchTerm: string;
    placeholder: string;
}

export const useSearch = (): UseSearchHook => {
    const [state, setState] = useContext(UiStateContext);

    const setSearchTerm = (term: string): void => {
        setState((state: UiState) => ({ ...state, searchTerm: term }));
    };

    const setPlaceholder = (placeholder: string): void => {
        setState((state: UiState) => ({ ...state, placeholder: placeholder }));
    };

    return {
        setSearchTerm,
        setPlaceholder,
        searchTerm: state.searchTerm,
        placeholder: state.placeholder,
    };
};
