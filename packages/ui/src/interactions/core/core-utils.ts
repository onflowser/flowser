import { InteractionDefinition } from "./core-types";

type IdentifiableInteractionDefinition = Pick<InteractionDefinition, "code">;

export class InteractionUtils {
  // Interaction structures that represent the same logical interaction,
  // should be treated as the same entity.
  // See how this is handled within FLIX standard:
  // https://github.com/onflow/flips/blob/main/application/20220503-interaction-templates.md#data-structure-serialization--identifier-generation
  static areSemanticallyEquivalent(
    a: IdentifiableInteractionDefinition,
    b: IdentifiableInteractionDefinition
  ): boolean {
    return (
      this.normalizeCadenceCode(a.code) === this.normalizeCadenceCode(b.code)
    );
  }

  static normalizeCadenceCode(code: string): string {
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
}
