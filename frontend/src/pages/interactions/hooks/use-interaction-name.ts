import { useInteractionRegistry } from "../contexts/interaction-registry.context";
import { useMemo } from "react";

type UseInteractionNameProps = {
  sourceCode: string | undefined;
};

export function useInteractionName(
  props: UseInteractionNameProps
): string | undefined {
  const { templates, definitions } = useInteractionRegistry();

  return useMemo(
    () =>
      templates.find((template) => template.sourceCode === props.sourceCode)
        ?.name ??
      definitions.find(
        (definition) => definition.sourceCode === props.sourceCode
      )?.name,
    [props.sourceCode, templates, definitions]
  );
}
