import React, { createContext, ReactElement, useContext } from "react";

export type PlatformAdapterState = {
  onPickProjectPath?: () => Promise<string | undefined>;
};

const PlatformAdapterContext = createContext<PlatformAdapterState>({});

export function usePlatformAdapter(): PlatformAdapterState {
  return useContext(PlatformAdapterContext);
}

export type PlatformAdapterProviderProps = PlatformAdapterState & {
  children: ReactElement;
};

export function PlatformAdapterProvider({
  children,
  ...values
}: PlatformAdapterProviderProps): ReactElement {
  return (
    <PlatformAdapterContext.Provider value={values}>
      {children}
    </PlatformAdapterContext.Provider>
  );
}
