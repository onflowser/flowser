import {
  GetParsedInteractionRequest,
  GetParsedInteractionResponse,
  GetAddressIndexRequest,
  GetAddressIndexResponse,
} from "@flowser/shared";
import { Body, Controller, Post } from "@nestjs/common";
import { GoBindingsService } from "./go-bindings.service";

@Controller("go-bindings")
export class GoBindingsController {
  constructor(private readonly service: GoBindingsService) {}

  @Post("get-parsed-interaction")
  async getParsedInteraction(@Body() body: unknown) {
    const request = GetParsedInteractionRequest.fromJSON(body);
    const response = await this.service.getParsedInteraction(request);
    return GetParsedInteractionResponse.toJSON(response);
  }

  @Post("get-address-index")
  async getAddressIndex(@Body() body: unknown) {
    const request = GetAddressIndexRequest.fromJSON(body);
    const response = await this.service.getAddressIndex(request);
    return GetAddressIndexResponse.toJSON(response);
  }
}
