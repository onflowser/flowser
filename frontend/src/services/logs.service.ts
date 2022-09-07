import { GetPollingLogsRequest, GetPollingLogsResponse } from "@flowser/shared";
import { TransportService } from "./transports/transport.service";

export class LogsService {
  constructor(private readonly transport: TransportService) {}

  getAllWithPolling(data: {
    timestamp: number;
  }): Promise<GetPollingLogsResponse> {
    return this.transport.send({
      requestMethod: "POST",
      resourceIdentifier: `/api/logs/polling`,
      requestData: data,
      requestProtobuf: GetPollingLogsRequest,
      responseProtobuf: GetPollingLogsResponse,
    });
  }
}
