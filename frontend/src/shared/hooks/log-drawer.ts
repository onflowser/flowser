import { useContext } from "react";
import { UiState, UiStateContext } from "../contexts/ui-state.context";

export type LogDrawerSize = "tiny" | "small" | "big" | "custom";

export interface LogDrawerUiState {
  logDrawerSize: LogDrawerSize;
}

export interface UseLogDrawerHook extends LogDrawerUiState {
  setSize: (size: LogDrawerSize) => void;
}

export const useLogDrawer = (): UseLogDrawerHook => {
  const [state, setState] = useContext(UiStateContext);

  const setSize = (size: LogDrawerSize): void => {
    setState((state: UiState) => ({ ...state, logDrawerSize: size }));
  };

  return {
    setSize,
    logDrawerSize: state.logDrawerSize,
  };
};
