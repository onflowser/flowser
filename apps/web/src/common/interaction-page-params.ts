import { FlowNetworkId } from "@onflowser/core/src/flow-utils";

// Must be placed in separate (type-only) file,
// so that opengraph-image doesn't reach code size limit.
export type InteractionsPageParams = {
  networkId: FlowNetworkId;
  interaction?: string;
}
