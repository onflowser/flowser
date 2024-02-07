// https://github.com/onflow/flips/blob/main/application/20220503-interaction-templates.md#interaction-interfaces
import { FlowNetworkId } from "./flow-utils";

export type FlixV1Template = {
  id: string;
  f_type: "InteractionTemplate";
  f_version: string;
  data: {
    messages: FlixV1Messages;
    dependencies: Record<string, FlixV1Dependency>;
    cadence: string;
    arguments: Record<string, FlixV1Argument>;
  };
};

export type FlixV1Auditor = {
  f_type: "FlowInteractionTemplateAuditor";
  f_version: string;
  address: string;
  name: string;
  twitter_url: string;
  website_url: string;
}

export type FlixV1Argument = {
  index: number;
  type: string;
  messages: FlixV1Messages;
}

type FlixV1Dependency = Record<
  string,
  // Only defined for `testnet` and `mainnet` networks.
  Record<FlowNetworkId, FlixV1DependencyOnNetwork>
>;

type FlixV1DependencyOnNetwork = {
  address: string;
  fq_address: string;
  pin: string;
  pin_block_height: number;
};

type FlixV1Messages = {
  title?: FlixV1I18nMessage;
  description?: FlixV1I18nMessage;
};

type FlixV1I18nMessage = {
  i18n: {
    "en-US"?: string;
  };
};
