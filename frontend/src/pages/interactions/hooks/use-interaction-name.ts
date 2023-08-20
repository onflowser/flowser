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
      templates.find(
        (template) =>
          props.sourceCode &&
          template.code &&
          // Ignore imports for comparison,
          // since those can differ due to address replacement.
          // See: https://developers.flow.com/tooling/fcl-js/api#address-replacement
          stripImports(template.code) === stripImports(props.sourceCode)
      )?.name,
    [props.sourceCode, templates]
  );
}

function stripImports(code: string) {
  return code
    .split("\n")
    .filter((line) => !line.startsWith("import"))
    .join("\n");
}
