import { CadenceParser } from "@onflow/cadence-parser";
import React, { createContext, ReactElement, useContext } from "react";
import { MonitoringServiceInt } from "../services/monitoring.service";

export type PlatformAdapterState = {
  onPickProjectPath?: () => Promise<string | undefined>;
  monitoringService?: MonitoringServiceInt;
  cadenceParser: CadenceParser;
};

const PlatformAdapterContext = createContext<PlatformAdapterState>(
  undefined as never
);

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

export function usePlatformAdapter(): PlatformAdapterState {
  const context = useContext(PlatformAdapterContext);
  if (!context) {
    throw new Error("Platform adapter context not found");
  }
  return context;
}
