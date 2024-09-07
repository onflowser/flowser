import useSWR, { SWRResponse } from "swr";
import { InteractionDefinition } from "../interactions/core/core-types";
import { useEffect } from "react";
import { useServiceRegistry } from "../contexts/service-registry.context";
import { FlixV11Template } from "@onflowser/core/src/flix-v11";

export const FLOWSER_FLIX_URL = "https://flix-indexer.fly.dev";

export function useListFlixTemplates(): SWRResponse<FlixV11Template[]> {
  const { flixService } = useServiceRegistry();

  if (flixService === undefined) {
    throw new Error("Flix service not found")
  }

  return useSWR(`flix/templates`, () => flixService.list(),
    { refreshInterval: 0 }
  );
}

// We are forced to use `null` as value for "not found",
// as `undefined` is already used by SWR to represent "no data".
export const FLIX_TEMPLATE_NOT_FOUND = null;

export function useFlixSearch(options: {
  interaction: InteractionDefinition;
}): SWRResponse<FlixV11Template | null> {
  const { flixService } = useServiceRegistry();

  if (flixService === undefined) {
    throw new Error("Flix service not found")
  }

  console.log(options.interaction.code);

  const cadenceBase64 = btoa(options.interaction.code);

  // We are not using `sourceCode` as the cache key,
  // to avoid the flickering UI effect that's caused
  // by undefined parsed interaction every time the source code changes.
  const state = useSWR<FlixV11Template | null>(`flix/templates/${options.interaction.id}`, () =>
    flixService.list({ cadenceBase64 }).then(res => res[0] ?? null),
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
}): SWRResponse<any[]> {
  // TODO(flix-v11): Add support for auditors?
  return useSWR(`flix/${options.network}/templates/${options.templateId}/auditors`, () => [] as any[],
    {
      refreshInterval: 0,
      shouldRetryOnError: false
    }
  );
}
