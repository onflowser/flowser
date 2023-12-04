import useSWR, { SWRResponse } from "swr";

// https://github.com/onflow/flips/blob/main/application/20220503-interaction-templates.md#interaction-interfaces
export type FlixTemplate = {
  id: string;
  f_type: "InteractionTemplate";
  f_version: string;
  data: {
    messages: {
      title?: FlixMessage;
      description?: FlixMessage;
    };
    dependencies: Record<string, FlixDependency>;
    cadence: string;
    // TODO: Add other fields
  };
};

type FlixDependency = Record<
  string,
  {
    mainnet: FlixDependencyOnNetwork;
    testnet: FlixDependencyOnNetwork;
  }
>;

type FlixDependencyOnNetwork = {
  address: string;
  fq_address: string;
  pin: string;
  pin_block_height: number;
};

type FlixMessage = {
  i18n: {
    "en-US"?: string;
  };
};

export const FLOW_FLIX_URL = "https://flix.flow.com";
export const FLOWSER_FLIX_URL = "http://localhost:3333"

export function useListFlixTemplates(): SWRResponse<FlixTemplate[]> {
  return useSWR(`flix/templates`, () =>
    fetch(`${FLOWSER_FLIX_URL}/v1/templates`).then((res) => res.json()),
  );
}

export function useFlixSearch(sourceCode: string): SWRResponse<FlixTemplate | undefined> {
  return useSWR(`flix/templates/${sourceCode}`, () =>
    fetch(`${FLOWSER_FLIX_URL}/v1/templates/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        cadence_base64: btoa(sourceCode),
        network: "mainnet"
      })
    }).then((res) => res.json()),
  );
}
