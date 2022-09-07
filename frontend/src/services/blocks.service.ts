import {
  GetSingleBlockResponse,
  GetPollingBlocksResponse,
  GetPollingBlocksRequest,
} from "@flowser/shared";
import { TransportService } from "./transports/transport.service";

export class BlocksService {
  constructor(private readonly transport: TransportService) {}

  getAllWithPolling(data: {
    timestamp: number;
  }): Promise<GetPollingBlocksResponse> {
    return this.transport.send({
      requestMethod: "GET",
      resourceIdentifier: "/api/blocks/polling",
      requestData: data,
      requestProtobuf: GetPollingBlocksRequest,
      responseProtobuf: GetPollingBlocksResponse,
    });
  }

  getSingle(id: string): Promise<GetSingleBlockResponse> {
    return this.transport.send({
      requestMethod: "GET",
      resourceIdentifier: `/api/blocks/${id}`,
      responseProtobuf: GetSingleBlockResponse,
    });
  }
}
