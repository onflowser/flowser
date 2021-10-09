import React, { createContext, FunctionComponent, useState } from 'react';
import { LogDrawerUiState } from '../hooks/log-drawer';
import { NavigationUiState } from '../hooks/navigation';

interface UiStateContextProps {
    children: any;
}

type Props = UiStateContextProps;

export const UiStateContext: any = createContext<any>([{}, () => undefined]);

export interface UiState extends LogDrawerUiState, NavigationUiState {
    placeholder: string;
    searchTerm: string;

    [key: string]: any;
}

export const defaultUiState: UiState = {
    placeholder: 'Search',
    searchTerm: '',
    logDrawerSize: 'tiny',
    breadcrumbs: [],
    isNavigationDrawerVisible: false,
    isSubNavigationVisible: true,
    isShowBackButtonVisible: true,
    isSearchBarVisible: true,
};

export const UiStateContextProvider: FunctionComponent<Props> = ({ children }) => {
    const [state, setState] = useState<UiState>(defaultUiState);
    return <UiStateContext.Provider value={[state, setState]}>{children}</UiStateContext.Provider>;
};
