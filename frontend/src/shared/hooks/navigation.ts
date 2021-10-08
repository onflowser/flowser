import { useContext } from 'react';
import { UiState, UiStateContext } from '../contexts/ui-state.context';

export interface Breadcrumb {
    to: string;
    label: string;
}

export interface NavigationUiState {
    breadcrumbs: Breadcrumb[];
    isNavigationDrawerVisible: boolean;
    isSubNavigationVisible: boolean;
    isShowBackButtonVisible: boolean;
}

export interface UseNavigationHook extends NavigationUiState {
    showNavigationDrawer: (show: boolean) => void;
    showSubNavigation: (show: boolean) => void;
    showBackButton: (show: boolean) => void;
    setBreadcrumbs: (breadcrumbs: Breadcrumb[]) => void;
}

export const useNavigation = (): UseNavigationHook => {
    const [state, setState] = useContext(UiStateContext);

    const showNavigationDrawer = (show: boolean) => {
        setState((state: UiState) => ({ ...state, isNavigationDrawerVisible: show }));
    };

    const showSubNavigation = (show: boolean) => {
        setState((state: UiState) => ({ ...state, isSubNavigationVisible: show }));
    };

    const showBackButton = (show: boolean) => {
        setState((state: UiState) => ({ ...state, isShowBackButtonVisible: show }));
    };

    const setBreadcrumbs = (breadcrumbs: Breadcrumb[]) => {
        setState((state: UiState) => ({ ...state, breadcrumbs }));
    };

    return {
        showNavigationDrawer,
        showSubNavigation,
        showBackButton,
        setBreadcrumbs,
        breadcrumbs: state.breadcrumbs,
        isNavigationDrawerVisible: state.isNavigationDrawerVisible,
        isSubNavigationVisible: state.isSubNavigationVisible,
        isShowBackButtonVisible: state.isShowBackButtonVisible,
    };
};
