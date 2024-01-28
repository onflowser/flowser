// Chain ID as defined in flow-go:
// https://github.com/onflow/flow-go/blob/02bb6369b07771a13e76da254042abf392a187fa/model/flow/chain.go#L18-L40
export type ChainID = "flow-mainnet" | "flow-testnet" | "flow-emulator"
// Just a shorter version of the Chain ID.
export type FlowNetworkId = "mainnet" | "testnet" | "emulator"

export class FlowUtils {

  static isValidFlowNetwork(value: unknown): value is FlowNetworkId {
    if (typeof value !== "string") {
      return false;
    }
    const validChainIds: Record<FlowNetworkId, true> = {
      "mainnet": true,
      "testnet": true,
      "emulator": true
    };

    return validChainIds[value as FlowNetworkId] ?? false
  }

  static flowNetworkIdToChainId(networkId: FlowNetworkId): ChainID {
    const lookup: Record<FlowNetworkId, ChainID> = {
      mainnet: "flow-mainnet",
      testnet: "flow-testnet",
      emulator: "flow-emulator"
    }

    return lookup[networkId];
  }
}
