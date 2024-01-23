import useSWR, { SWRResponse } from "swr";
import { InteractionDefinition } from "../interactions/core/core-types";
import { useEffect } from "react";

// https://github.com/onflow/flips/blob/main/application/20220503-interaction-templates.md#interaction-interfaces
export type FlixTemplate = {
  id: string;
  f_type: "InteractionTemplate";
  f_version: string;
  data: {
    messages: FlixMessages;
    dependencies: Record<string, FlixDependency>;
    cadence: string;
    arguments: Record<string, FlixArgument>;
  };
};

export type FlixAuditor = {
  f_type: "FlowInteractionTemplateAuditor";
  f_version: string;
  address: string;
  name: string;
  twitter_url: string;
  website_url: string;
}


export type FlixArgument = {
  index: number;
  type: string;
  messages: FlixMessages;
}

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

type FlixMessages = {
  title?: FlixI18nMessage;
  description?: FlixI18nMessage;
};

type FlixI18nMessage = {
  i18n: {
    "en-US"?: string;
  };
};

export const FLOW_FLIX_URL = "https://flix.flow.com";
export const FLOWSER_FLIX_URL = "https://flowser-flix-368a32c94da2.herokuapp.com";

export function useListFlixTemplates(): SWRResponse<FlixTemplate[]> {
  return useSWR(`flix/templates`, () =>
    fetch(`${FLOWSER_FLIX_URL}/v1/templates`).then((res) => res.json()),
  );
}

export function useGetFlixTemplate(id: string): SWRResponse<FlixTemplate> {
  return useSWR(`flix/templates/${id}`, () =>
    fetch(`${FLOWSER_FLIX_URL}/v1/templates/${id}`).then((res) => res.json()),
  );
}

// We are forced to use `null` as value for "not found",
// as `undefined` is already used by SWR to represent "no data".
export const FLIX_TEMPLATE_NOT_FOUND = null;

export function useFlixSearch(options: {
  interaction: InteractionDefinition;
  // Supports "any" network as of:
  // https://github.com/onflowser/flow-interaction-template-service/pull/4
  network: "any" | "testnet" | "mainnet";
}): SWRResponse<FlixTemplate | null> {

  // We are not using `sourceCode` as the cache key,
  // to avoid the flickering UI effect that's caused
  // by undefined parsed interaction every time the source code changes.
  const state = useSWR(`flix/templates/${options.interaction.id}`, () =>
    fetch(`${FLOWSER_FLIX_URL}/v1/templates/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        cadence_base64: btoa(options.interaction.code),
        network: options.network
      })
    }).then((res) => res.status === 200 ? res.json() : null),
    {
      refreshInterval: 0,
      shouldRetryOnError: false,
    }
  );

  useEffect(() => {
    state.mutate();
  }, [options.interaction.code]);

  return state;
}

export function useFlixTemplateAuditors(options: {
  templateId: string;
  network: "testnet" | "mainnet";
}): SWRResponse<FlixAuditor[]> {
  return useSWR(`flix/${options.network}/templates/${options.templateId}/auditors`, () =>
      fetch(`${FLOWSER_FLIX_URL}/v1/templates/${options.templateId}/auditors?network=${options.network}`)
        .then((res) => res.json()),
    {
      refreshInterval: 0,
      shouldRetryOnError: false
    }
  );
}
