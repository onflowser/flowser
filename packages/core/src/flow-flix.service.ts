import { HttpService } from "./http.service";
import { FlixTemplateV1, FlowFlixServiceConfig } from "./flix-v1";

export class FlowFlixService {
  constructor(
    private readonly config: FlowFlixServiceConfig,
    private readonly httpService: HttpService
  ) {}

  async getById(id: string): Promise<FlixTemplateV1 | undefined> {
    const response = await this.httpService.request<FlixTemplateV1>({
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
