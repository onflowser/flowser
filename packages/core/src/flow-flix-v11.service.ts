import { HttpService } from "./http.service";
import { FlixV11Template } from "./flix-v11";

type FlowFlixV11ServiceConfig = {
  flixServerUrl: string;
}

type ListRequest = {
  cadenceBase64?: string;
}

export class FlowFlixV11Service {
  constructor(
    private readonly config: FlowFlixV11ServiceConfig,
    private readonly httpService: HttpService
  ) {}

  async list(request?: ListRequest): Promise<FlixV11Template[]> {
    const url = new URL(`${this.config.flixServerUrl}/v1.1/templates`);
    if (request?.cadenceBase64) {
      url.searchParams.set("cadence_base64", request.cadenceBase64);
    }
    const response = await this.httpService.request({
      url: url.toString(),
    });

    if (response.status === 200) {
      return (response.data as any).data as FlixV11Template[];
    } else {
      throw new Error(`HTTP error ${response.status}`)
    }
  }

  async getById(id: string): Promise<FlixV11Template | undefined> {
    const response = await this.httpService.request({
      url: `${this.config.flixServerUrl}/v1.1/templates/${id}`
    });

    if (response.status === 404) {
      return undefined;
    } else if (response.status === 200) {
      return (response.data as any).data as FlixV11Template;
    } else {
      throw new Error(`HTTP error ${response.status}`)
    }
  }

}
