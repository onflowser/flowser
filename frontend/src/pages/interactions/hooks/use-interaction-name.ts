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
          sanitizeCadenceSource(template.code) ===
            sanitizeCadenceSource(props.sourceCode)
      )?.name,
    [props.sourceCode, templates]
  );
}

function sanitizeCadenceSource(code: string) {
  // Ignore imports for comparison,
  // since those can differ due to address replacement.
  // See: https://developers.flow.com/tooling/fcl-js/api#address-replacement
  const strippedImports = code
    .split("\n")
    .filter((line) => !line.startsWith("import"))
    .join("\n");

  // Replace all whitespace and newlines
  return strippedImports.replaceAll(/[\n\t ]/g, "");
}
