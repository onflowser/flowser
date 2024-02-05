import { HttpService } from "./http.service";
import { FlowNetworkId } from "./flow-utils";

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
  // Only defined for `testnet` and `mainnet` networks.
  Record<FlowNetworkId, FlixDependencyOnNetwork>
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

type FlowFlixServiceConfig = {
  flixServerUrl: string;
}

export class FlowFlixService {
  constructor(
    private readonly config: FlowFlixServiceConfig,
    private readonly httpService: HttpService
  ) {}

  async getById(id: string): Promise<FlixTemplate | undefined> {
    const response = await this.httpService.request<FlixTemplate>({
      url: `${this.config.flixServerUrl}/v1/templates/${id}`
    });

    if (response.status === 204) {
      return undefined;
    } else {
      return response.data;
    }
  }

  // TODO: Add other methods from use-flix.ts
}
