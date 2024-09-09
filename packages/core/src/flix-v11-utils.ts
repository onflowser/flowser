import type { FlowNetworkId } from "./flow-utils";
import type { FlixV11Template } from "./flix-v11";
import { ensurePrefixedAddress, isDefined } from "./utils";

type FlixDependencySummary = {
  name: string;
  address: string;
}

export class FlixV11Utils {

  static getDependencies(template: FlixV11Template, networkId: FlowNetworkId): FlixDependencySummary[] {
    return template.data.dependencies
      ?.map(e => e.contracts)
      .flat()
      .map((dependency): FlixDependencySummary | undefined => {
        const network = dependency.networks.find(network => network.network === networkId);

        if (!network) {
          return undefined;
        }

        return {
          name: dependency.contract,
          address: network.address
        }
      })
      .filter(isDefined) ?? [];
  }

  static getDescription(template: FlixV11Template): string | undefined {
    return template.data.messages
      ?.find(message => message.key === "description")?.i18n
      ?.find(i18n => i18n.tag === "en-US")?.translation;
  }

  static getName(template: FlixV11Template): string {
    const englishTitle =  template.data.messages
      ?.find(message => message.key === "title")?.i18n
      ?.find(i18n => i18n.tag === "en-US")?.translation;
    return englishTitle ?? "Unknown";
  }

  static getCadenceSourceCode(template: FlixV11Template, networkId: FlowNetworkId): string | undefined {
    let source = template.data.cadence.body;
    const contractDependency = template.data.dependencies?.flatMap(e => e.contracts) ?? [];
    for (const dependency of contractDependency) {
      const networkConfig = dependency.networks.find(network => network.network === networkId);
      if (!networkConfig) {
        return undefined;
      }

      source = source.replace(
        new RegExp(`import +"${dependency.contract}"`),
        `import ${dependency.contract} from ${ensurePrefixedAddress(networkConfig.address)}`
      );
    }
    return source;
  }

  static hasDependenciesForNetwork(template: FlixV11Template, networkId: FlowNetworkId): boolean {
    return template.data.dependencies
      ?.map(e => e.contracts)
      .flat()
      .some(dependency =>
        dependency.networks.some(network => network.network === networkId)
      ) ?? false;
  }

}
