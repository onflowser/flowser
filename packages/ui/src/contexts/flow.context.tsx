import React, { createContext, ReactElement, useEffect } from "react";
import * as fcl from "@onflow/fcl";
import { useProjectManager } from "./workspace.context";
import { useGetFlowJson } from "../api";

const FlowConfigContext = createContext({});

/**
 * Manages FCL-JS configuration for the whole app.
 */
export function FlowConfigProvider({
  children,
}: {
  children: ReactElement;
}): ReactElement {
  const { currentWorkspace } = useProjectManager();
  const { data: flowJSON } = useGetFlowJson();

  useEffect(() => {
    if (currentWorkspace && flowJSON) {
      const accessNodePort = currentWorkspace.emulator?.restServerPort ?? 8888;
      fcl
        .config({
          "app.detail.icon": `http://localhost:6061/icon.png`,
          "app.detail.title": "Flowser",
          "accessNode.api": `http://localhost:${accessNodePort}`,
          "flow.network": "local",
        })
        .load({
          flowJSON: JSON.parse(flowJSON),
        });
    }
  }, [currentWorkspace, flowJSON]);

  return (
    <FlowConfigContext.Provider value={{}}>
      {children}
    </FlowConfigContext.Provider>
  );
}
