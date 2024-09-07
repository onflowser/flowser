// https://github.com/onflow/flips/blob/main/application/20220503-interaction-templates.md#interaction-interfaces
import { FlowNetworkId } from "./flow-utils";

export type FlixV11Template = {
  id: string;
  f_type: "InteractionTemplate";
  f_version: "1.1.0";
  data: {
    messages: FlixV11Message[] | null;
    cadence: {
      body: string;
      network_pins: FlixV11NetworkPin[];
    };
    parameters: FlixV11Parameter[];
    dependencies: { contracts: FlixV11ContractDependency[] }[] | null;
  };
};

export type FlixV11ContractDependency = {
  // Name of the contract (e.g. "EVM")
  contract: string;
  networks: FlixV11ContractNetwork[];
}

export type FlixV11ContractNetwork = {
  network: FlowNetworkId;
  address: string;
}

export type FlixV11NetworkPin = {
  network: FlowNetworkId;
  pin_self: string;
}

export type FlixV11Message = {
  // Standard keys: "title", "description",..
  key: string;
  i18n: FlixV11MessageI18n[];
}

export type FlixV11MessageI18n = {
  // Language key (e.g. "en-US")
  tag: string;
  translation: string;
}

export type FlixV11Parameter = {
  label: string;
  index: 0;
  type: string;
  messages: unknown[];
}
