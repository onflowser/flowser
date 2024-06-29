import { FlowNetworkId } from "@onflowser/core/src/flow-utils";
import {
  InteractionTemplateFilters
} from "@onflowser/ui/src/interactions/components/InteractionTemplates/interaction-templates-controller.provider";

// Must be placed in separate (type-only) file,
// so that opengraph-image doesn't reach code size limit.
export type InteractionsPageParams = {
  networkId: FlowNetworkId;
  interaction?: string;
  templateFilters: InteractionTemplateFilters;
}
