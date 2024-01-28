import { useParams } from "next/navigation";
import { FlowNetworkId, FlowUtils } from "@onflowser/core/src/flow-utils";

export type InteractionsPageParams = {
  networkId: FlowNetworkId;
  interaction?: string;
}

export function useInteractionsPageParams(): InteractionsPageParams {
  const { networkId, interaction } = useParams();

  if (!FlowUtils.isValidFlowNetwork(networkId)) {
    throw new Error(`Unknown Flow network: ${networkId}`)
  }

  return {
    networkId,
    interaction: interaction as string | undefined
  }
}
