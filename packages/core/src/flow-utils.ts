// Chain ID as defined in flow-go:
// https://github.com/onflow/flow-go/blob/02bb6369b07771a13e76da254042abf392a187fa/model/flow/chain.go#L18-L40
export type FlowChainID = "flow-mainnet" | "flow-testnet" | "flow-emulator"
// Just a shorter version of the Chain ID.
export type FlowNetworkId = "mainnet" | "testnet" | "emulator"

export class FlowUtils {

  static getValidFlowNetworks(): FlowNetworkId[] {
    const validNetworkIds: Record<FlowNetworkId, true> = {
      "mainnet": true,
      "testnet": true,
      "emulator": true
    };

    return Object.keys(validNetworkIds) as FlowNetworkId[];
  }

  static isValidFlowNetwork(value: unknown): value is FlowNetworkId {
    if (typeof value !== "string") {
      return false;
    }

    return this.getValidFlowNetworks().includes(value as FlowNetworkId);
  }

  static networkIdToChainId(networkId: FlowNetworkId): FlowChainID {
    const lookup: Record<FlowNetworkId, FlowChainID> = {
      mainnet: "flow-mainnet",
      testnet: "flow-testnet",
      emulator: "flow-emulator"
    }

    return lookup[networkId];
  }

  static getFlowViewAccountUrl(networkId: FlowNetworkId, address: string) {
    switch (networkId) {
      case "emulator":
        return `https://www.emulator.flowview.app/account/${address}`
      case "mainnet":
        return `https://www.flowview.app/account/${address}`
      case "testnet":
        return `https://www.testnet.flowview.app/account/${address}`
    }
  }

  static getContractBrowserAccountUrl(networkId: FlowNetworkId, address: string) {
    if (networkId === "emulator") {
      return undefined;
    } else {
      // Contract browser doesn't have separate URLs for each network for now
      return `https://contractbrowser.com/account/${address}`
    }
  }

  static getFlowDiverAccountUrl(networkId: FlowNetworkId, address: string) {
    switch (networkId) {
      case "emulator":
        return undefined;
      case "mainnet":
        return `https://www.flowdiver.io/account/${address}`
      case "testnet":
        return `https://testnet.flowdiver.io/account/${address}`
    }
  }
}
