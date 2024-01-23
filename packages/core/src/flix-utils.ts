import { FlixTemplate } from "@onflowser/ui/src/hooks/use-flix";

// TODO: Consolidate with FlowNetworkId
type FlixNetworkId = "mainnet" | "testnet" | "emulator";

export class FlixUtils {

  static getDescription(template: FlixTemplate) {
    return template.data.messages.description?.i18n["en-US"];
  }

  static getName(template: FlixTemplate) {
    const englishTitle = template.data.messages?.title?.i18n?.["en-US"];
    if (englishTitle) {
      // Transactions generated with NFT catalog have this necessary prefix in titles.
      // https://github.com/onflow/nft-catalog
      return englishTitle.replace("This transaction ", "");
    } else {
      return "Unknown";
    }
  }

  static getCadenceSourceCode(template: FlixTemplate, networkId: FlixNetworkId) {
    if (networkId === "emulator") {
      return this.getCadenceWithNewImportSyntax(template);
    } else {
      return this.getCadenceWithNetworkDependencies(template, networkId)
    }
  }

  private static getCadenceWithNetworkDependencies(template: FlixTemplate, networkId: "mainnet" | "testnet") {
    let cadence = template.data.cadence;

    for (const replacementPattern in template.data.dependencies) {
      const dependency = template.data.dependencies[replacementPattern];
      const networkInfo = Object.values(dependency)[0]

      cadence = cadence.replace(replacementPattern, networkInfo[networkId].address)
    }

    return cadence;
  }

  // Transform imports with replacement patterns to the new import syntax,
  // since FLIX v1.0 doesn't support new import syntax yet.
  // https://github.com/onflow/flow-interaction-template-tools/issues/12
  private static getCadenceWithNewImportSyntax(template: FlixTemplate) {
    const replacementPatterns = Object.keys(template.data.dependencies);
    return replacementPatterns.reduce(
      (cadence, pattern) => {
        const contractName = Object.keys(template.data.dependencies[pattern])[0];

        return cadence
          .replace(new RegExp(`from\\s+${pattern}`), "")
          .replace(new RegExp(`import\\s+${contractName}`), `import "${contractName}"`)
      },
      template.data.cadence,
    );
  }
}
