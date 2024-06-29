import { useParams, useRouter, useSearchParams } from "next/navigation";
import { FlowNetworkId, FlowUtils } from "@onflowser/core/src/flow-utils";
import { InteractionsPageParams } from "@/common/interaction-page-params";
import {
  InteractionTemplateFilters
} from "@onflowser/ui/src/interactions/components/InteractionTemplates/interaction-templates-controller.provider";
import { ensurePrefixedAddress } from "@onflowser/core";

type UseInteractionPageParams = InteractionsPageParams & {
  setNetworkId: (network: FlowNetworkId) => void;
}

export function useInteractionsPageParams(): UseInteractionPageParams {
  const params = useParams();
  const search = useSearchParams();
  const router = useRouter();

  const interaction = params.interaction as string | undefined;
  const networkId = params.networkId;
  const templateFilters: InteractionTemplateFilters = {};

  const rawFlixDependency = search.get("flix-dependency");
  if (rawFlixDependency) {
    // Accepts format A.address.ContractName
    const [prefix, address, name] = rawFlixDependency.split(".");

    templateFilters.dependencies = {
      contractAddress: ensurePrefixedAddress(address),
      contractName: name
    }
  }

  if (!FlowUtils.isValidFlowNetwork(networkId)) {
    throw new Error(`Unknown Flow network: ${networkId}`)
  }

  function setNetworkId(network: FlowNetworkId) {
    let prefix = "";

    if (network === "previewnet") {
      prefix = "https://previewnet.flowser.dev"
    }

    if (interaction) {
      router.replace(`${prefix}/${network}/${interaction}`)
    } else {
      router.replace(`${prefix}/${network}`)
    }
  }

  return {
    templateFilters,
    networkId,
    interaction,
    setNetworkId
  }
}
