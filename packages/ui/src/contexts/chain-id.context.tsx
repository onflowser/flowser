import { createContext, ReactNode, useContext } from "react";

// Chain ID as defined in flow-go:
// https://github.com/onflow/flow-go/blob/02bb6369b07771a13e76da254042abf392a187fa/model/flow/chain.go#L18-L40
export type ChainID = "flow-mainnet" | "flow-testnet" | "flow-emulator"

type ChainIdConfig = {
  chainId: ChainID;
}

const Context = createContext<ChainIdConfig>(undefined as never);

export function ChainIdProvider(props: {
  children: ReactNode;
  config: ChainIdConfig;
}) {
  return (
    <Context.Provider value={props.config}>
      {props.children}
    </Context.Provider>
  )
}

export function useChainId(): ChainID {
  const context = useContext(Context);

  if (context === undefined) {
    throw new Error("ChainIdProvider not found")
  }

  return context.chainId;
}

export function isValidChainID(value: unknown): value is ChainID {
  if (typeof value !== "string") {
    return false;
  }
  const validChainIds: Record<ChainID, true> = {
    "flow-mainnet": true,
    "flow-testnet": true,
    "flow-emulator": true
  };

  return validChainIds[value as ChainID] ?? false
}
