import { TransportService } from "./transports/transport.service";
import {
  GetParsedInteractionRequest,
  GetParsedInteractionResponse,
  GetAddressIndexRequest,
  GetAddressIndexResponse,
} from "@flowser/shared";

export class GoBindingsService {
  constructor(private readonly transport: TransportService) {}

  getParsedInteraction(
    request: GetParsedInteractionRequest
  ): Promise<GetParsedInteractionResponse> {
    return this.transport.send({
      requestMethod: "POST",
      resourceIdentifier: "/api/go-bindings/get-parsed-interaction",
      requestData: request,
      requestProtobuf: GetParsedInteractionRequest,
      responseProtobuf: GetParsedInteractionResponse,
    });
  }

  getAddressIndex(
    request: GetAddressIndexRequest
  ): Promise<GetAddressIndexResponse> {
    return this.transport.send({
      requestMethod: "POST",
      resourceIdentifier: "/api/go-bindings/get-address-index",
      requestData: request,
      requestProtobuf: GetAddressIndexRequest,
      responseProtobuf: GetAddressIndexResponse,
    });
  }
}
