import { useInteractionRegistry } from "../contexts/interaction-registry.context";
import { useMemo } from "react";

type UseInteractionNameProps = {
  sourceCode: string | undefined;
};

export function useInteractionName(
  props: UseInteractionNameProps
): string | undefined {
  const { templates } = useInteractionRegistry();

  return useMemo(
    () =>
      templates.find((template) => template.code === props.sourceCode)?.name,
    [props.sourceCode, templates]
  );
}
