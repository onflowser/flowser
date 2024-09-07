import { HttpService } from "./http.service";
import { FlixV1Template } from "./flix-v1";

type FlowFlixV1ServiceConfig = {
  flixServerUrl: string;
}

export class FlowFlixV1Service {
  constructor(
    private readonly config: FlowFlixV1ServiceConfig,
    private readonly httpService: HttpService
  ) {}

  async getById(id: string): Promise<FlixV1Template | undefined> {
    const response = await this.httpService.request<FlixV1Template>({
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
