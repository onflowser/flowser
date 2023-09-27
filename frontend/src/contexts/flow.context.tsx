import React, { createContext, ReactElement, useEffect } from "react";
import { useGetFlowConfig } from "../hooks/use-api";
import * as fcl from "@onflow/fcl";
import { useProjectManager } from "./projects.context";

const FlowConfigContext = createContext({});

/**
 * Manages FCL-JS configuration for the whole app.
 */
export function FlowConfigProvider({
  children,
}: {
  children: ReactElement;
}): ReactElement {
  const { currentProject } = useProjectManager();
  const { data: flowConfigData } = useGetFlowConfig();

  useEffect(() => {
    if (currentProject && flowConfigData?.flowJson) {
      const accessNodePort = currentProject.emulator?.restServerPort ?? 8888;
      fcl
        .config({
          "app.detail.icon": `http://localhost:6061/icon.png`,
          "app.detail.title": "Flowser",
          "accessNode.api": `http://localhost:${accessNodePort}`,
          "flow.network": "local",
        })
        .load({
          flowJSON: JSON.parse(flowConfigData.flowJson),
        });
    }
  }, [currentProject, flowConfigData]);

  return (
    <FlowConfigContext.Provider value={{}}>
      {children}
    </FlowConfigContext.Provider>
  );
}
