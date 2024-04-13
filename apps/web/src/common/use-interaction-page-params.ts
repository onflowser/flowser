import { useParams, useRouter } from "next/navigation";
import { FlowNetworkId, FlowUtils } from "@onflowser/core/src/flow-utils";
import { InteractionsPageParams } from "@/common/interaction-page-params";

type UseInteractionPageParams = InteractionsPageParams & {
  setNetworkId: (network: FlowNetworkId) => void;
}

export function useInteractionsPageParams(): UseInteractionPageParams {
  const params = useParams();
  const router = useRouter();

  const interaction = params.interaction as string | undefined;
  const networkId = params.networkId;

  if (!FlowUtils.isValidFlowNetwork(networkId)) {
    throw new Error(`Unknown Flow network: ${networkId}`)
  }

  function setNetworkId(network: FlowNetworkId) {
    if (interaction) {
      router.replace(`/${network}/${interaction}`)
    } else {
      router.replace(`/${network}`)
    }
  }

  return {
    networkId,
    interaction,
    setNetworkId
  }
}
