import React, { createContext, ReactElement, useContext } from "react";
import { MonitoringServiceInt } from "../services/monitoring.service";

export type PlatformAdapterState = {
  onPickProjectPath?: () => Promise<string | undefined>;
  monitoringService?: MonitoringServiceInt;
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
