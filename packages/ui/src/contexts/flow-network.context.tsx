import { createContext, ReactNode, useContext } from "react";
import { FlowChainID, FlowNetworkId, FlowUtils } from "@onflowser/core/src/flow-utils";

type FlowNetworkProviderProps = {
  networkId: FlowNetworkId;
}

const Context = createContext<FlowNetworkProviderProps>(undefined as never);

export function FlowNetworkProvider(props: {
  children: ReactNode;
  config: FlowNetworkProviderProps;
}) {
  return (
    <Context.Provider value={props.config}>
      {props.children}
    </Context.Provider>
  )
}

export function useFlowNetworkId(): FlowNetworkId {
  const context = useContext(Context);

  if (context === undefined) {
    throw new Error("FlowNetworkProvider not found")
  }

  return context.networkId;
}

export function useChainId(): FlowChainID {
  const context = useContext(Context);

  if (context === undefined) {
    throw new Error("FlowNetworkProvider not found")
  }

  return FlowUtils.networkIdToChainId(context.networkId);
}
