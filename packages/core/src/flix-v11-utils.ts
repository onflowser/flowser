import type { FlowNetworkId } from "./flow-utils";
import type { FlixV11Template } from "./flix-v11";
import { isDefined } from "./utils";

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

  static getDescription(template: FlixV11Template) {
    return template.data.messages
      ?.find(message => message.key === "description")?.i18n
      ?.find(i18n => i18n.tag === "en-US")?.translation;
  }

  static getName(template: FlixV11Template) {
    const englishTitle =  template.data.messages
      ?.find(message => message.key === "title")?.i18n
      ?.find(i18n => i18n.tag === "en-US")?.translation;
    if (englishTitle) {
      return this.shortenTitle(englishTitle)
    } else {
      return "Unknown";
    }
  }

  private static shortenTitle(title: string) {
    // TODO(flix-v11): Do we need to shorten titles?
    return title;
  }

  static getCadenceSourceCode(template: FlixV11Template, networkId: FlowNetworkId) {
    // TODO(flix-v11): Insert contract addresses in code
    return template.data.cadence.body;
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
