import { useContext } from 'react';
import { UiState, UiStateContext } from '../contexts/ui-state.context';

export interface Breadcrumb {
    link: string;
    label: string;
}

export interface NavigationUiState {
    breadcrumbs: Breadcrumb[];
    isNavigationDrawerVisible: boolean;
    isShowBackButtonVisible: boolean;
}

export interface UseNavigationHook extends NavigationUiState {
    showNavigationDrawer: (show: boolean) => void;
    showBackButton: (show: boolean) => void;
    setBreadcrumbs: (breadcrumbs: Breadcrumb[]) => void;
}

export const useNavigation = (): UseNavigationHook => {
    const [state, setState] = useContext(UiStateContext);

    const showNavigationDrawer = (show: boolean) => {
        setState((state: UiState) => ({ ...state, showNavigationDrawer: show }));
    };

    const showBackButton = (show: boolean) => {
        setState((state: UiState) => ({ ...state, showBackButton: show }));
    };

    const setBreadcrumbs = (breadcrumbs: Breadcrumb[]) => {
        setState((state: UiState) => ({ ...state, breadcrumbs }));
    };

    return {
        showNavigationDrawer,
        showBackButton,
        setBreadcrumbs,
        breadcrumbs: state.breadcrumbs,
        isNavigationDrawerVisible: state.isNavigationDrawerVisible,
        isShowBackButtonVisible: state.isShowBackButtonVisible,
    };
};
