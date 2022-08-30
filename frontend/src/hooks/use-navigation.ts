import { UiState, useUiStateContext } from "../contexts/ui-state.context";

export interface Breadcrumb {
  to?: string;
  label: string;
}

export interface NavigationUiState {
  breadcrumbs: Breadcrumb[];
  isNavigationDrawerVisible: boolean;
  isSubNavigationVisible: boolean;
  isShowBackButtonVisible: boolean;
  isSearchBarVisible: boolean;
}

export interface UseNavigationHook extends NavigationUiState {
  showNavigationDrawer: (show: boolean) => void;
  showSubNavigation: (show: boolean) => void;
  showBackButton: (show: boolean) => void;
  showSearchBar: (show: boolean) => void;
  setBreadcrumbs: (breadcrumbs: Breadcrumb[]) => void;
}

export const useNavigation = (): UseNavigationHook => {
  const [state, setState] = useUiStateContext();

  const showNavigationDrawer = (show: boolean) => {
    setState((state: UiState) => ({
      ...state,
      isNavigationDrawerVisible: show,
    }));
  };

  const showSubNavigation = (show: boolean) => {
    setState((state: UiState) => ({ ...state, isSubNavigationVisible: show }));
  };

  const showBackButton = (show: boolean) => {
    setState((state: UiState) => ({ ...state, isShowBackButtonVisible: show }));
  };

  const showSearchBar = (show: boolean) => {
    setState((state: UiState) => ({ ...state, isSearchBarVisible: show }));
  };

  const setBreadcrumbs = (breadcrumbs: Breadcrumb[]) => {
    setState((state: UiState) => ({ ...state, breadcrumbs }));
  };

  return {
    showNavigationDrawer,
    showSubNavigation,
    showBackButton,
    showSearchBar,
    setBreadcrumbs,
    breadcrumbs: state.breadcrumbs,
    isNavigationDrawerVisible: state.isNavigationDrawerVisible,
    isSubNavigationVisible: state.isSubNavigationVisible,
    isShowBackButtonVisible: state.isShowBackButtonVisible,
    isSearchBarVisible: state.isSearchBarVisible,
  };
};
