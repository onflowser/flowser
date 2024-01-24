import { useParams } from "next/navigation";
import { FlowNetworkId, isValidFlowNetwork } from "@onflowser/ui/src/contexts/flow-network.context";

export type InteractionsPageParams = {
  networkId: FlowNetworkId;
  interaction?: string;
}

export function useInteractionsPageParams(): InteractionsPageParams {
  const { networkId, interaction } = useParams();

  if (!isValidFlowNetwork(networkId)) {
    throw new Error(`Unknown Flow network: ${networkId}`)
  }

  return {
    networkId,
    interaction: interaction?.[0] as string | undefined
  }
}
