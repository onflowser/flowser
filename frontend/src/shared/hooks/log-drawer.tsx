import { useContext } from 'react';
import { UiState, UiStateContext } from '../contexts/ui-state.context';

export type LogDrawerSize = 'tiny' | 'small' | 'big';
export interface UseLogDrawerHook {
    setSize: (size: LogDrawerSize) => void;
    size: LogDrawerSize;
}

export const useLogDrawer = (): UseLogDrawerHook => {
    const [state, setState] = useContext(UiStateContext);

    const setSize = (size: LogDrawerSize): void => {
        setState((state: UiState) => ({ ...state, logDrawerSize: size }));
    };

    return {
        setSize,
        size: state.logDrawerSize,
    };
};
