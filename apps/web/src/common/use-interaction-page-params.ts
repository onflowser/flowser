import { useParams } from "next/navigation";
import { FlowUtils } from "@onflowser/core/src/flow-utils";
import { InteractionsPageParams } from "@/common/interaction-page-params";

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
