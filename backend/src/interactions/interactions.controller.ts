import {
  GetParsedInteractionRequest,
  GetParsedInteractionResponse,
} from "@flowser/shared";
import { Body, Controller, Post } from "@nestjs/common";
import { InteractionsService } from "./interactions.service";

@Controller("interactions")
export class InteractionsController {
  constructor(private readonly service: InteractionsService) {}

  @Post("parse")
  async parse(@Body() body: unknown) {
    const request = GetParsedInteractionRequest.fromJSON(body);
    const response = await this.service.parse(request);
    return GetParsedInteractionResponse.toJSON(response);
  }
}
