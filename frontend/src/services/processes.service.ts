import {
  GetPollingLogsRequest,
  GetPollingLogsResponse,
  GetPollingManagedProcessesRequest,
  GetPollingManagedProcessesResponse,
} from "@flowser/shared";
import { TransportService } from "./transports/transport.service";

export class ProcessesService {
  constructor(private readonly transport: TransportService) {}

  getAllLogsByProcessWithPolling({
    processId,
    ...data
  }: {
    timestamp: number;
    processId: string;
  }): Promise<GetPollingLogsResponse> {
    return this.transport.send({
      requestMethod: "POST",
      resourceIdentifier: `/api/processes/${processId}/logs/polling`,
      requestData: data,
      requestProtobuf: GetPollingLogsRequest,
      responseProtobuf: GetPollingLogsResponse,
    });
  }

  getAllLogsWithPolling(data: {
    timestamp: number;
  }): Promise<GetPollingLogsResponse> {
    return this.transport.send({
      requestMethod: "POST",
      resourceIdentifier: `/api/processes/logs/polling`,
      requestData: data,
      requestProtobuf: GetPollingLogsRequest,
      responseProtobuf: GetPollingLogsResponse,
    });
  }

  getAllProcessesWithPolling(data: {
    timestamp: number;
  }): Promise<GetPollingManagedProcessesResponse> {
    return this.transport.send({
      requestMethod: "POST",
      resourceIdentifier: `/api/processes/polling`,
      requestData: data,
      requestProtobuf: GetPollingManagedProcessesRequest,
      responseProtobuf: GetPollingManagedProcessesResponse,
    });
  }
}
