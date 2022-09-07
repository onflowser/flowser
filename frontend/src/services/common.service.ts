import { GetFlowserVersionResponse } from "@flowser/shared";
import { GetFlowCliInfoResponse } from "@flowser/shared";
import { TransportService } from "./transports/transport.service";

export class CommonService {
  constructor(private readonly transport: TransportService) {}

  getFlowserVersion(): Promise<GetFlowserVersionResponse> {
    return this.transport.send({
      requestMethod: "GET",
      resourceIdentifier: "/api/version",
      responseProtobuf: GetFlowserVersionResponse,
    });
  }

  getFlowCliInfo(): Promise<GetFlowCliInfoResponse> {
    return this.transport.send({
      requestMethod: "GET",
      resourceIdentifier: "/api/flow/version",
      responseProtobuf: GetFlowCliInfoResponse,
    });
  }
}
