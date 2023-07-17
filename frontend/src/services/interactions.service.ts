import { TransportService } from "./transports/transport.service";
import {
  GetParsedInteractionRequest,
  GetParsedInteractionResponse,
} from "@flowser/shared";

export class InteractionsService {
  constructor(private readonly transport: TransportService) {}

  parseInteraction(
    request: GetParsedInteractionRequest
  ): Promise<GetParsedInteractionResponse> {
    return this.transport.send({
      requestMethod: "POST",
      resourceIdentifier: "/api/interactions/parse",
      requestData: request,
      requestProtobuf: GetParsedInteractionRequest,
      responseProtobuf: GetParsedInteractionResponse,
    });
  }
}
