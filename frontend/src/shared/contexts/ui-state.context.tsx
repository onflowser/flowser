import React from 'react';
import { createContext, FunctionComponent, useState } from 'react';

interface UiStateContextProps {
    children: any;
}

type Props = UiStateContextProps;

export const UiStateContext: any = createContext<any>([{}, () => undefined]);

export interface UiState {
    placeholder: string;
    searchTerm: string;

    [key: string]: any;
}

export const defaultUiState: UiState = {
    placeholder: 'Search',
    searchTerm: '',
};

export const UiStateContextProvider: FunctionComponent<Props> = ({ children }) => {
    const [state, setState] = useState<UiState>(defaultUiState);
    return <UiStateContext.Provider value={[state, setState]}>{children}</UiStateContext.Provider>;
};
