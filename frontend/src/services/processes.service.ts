import {
  GetPollingOutputsRequest,
  GetPollingOutputsResponse,
  GetPollingManagedProcessesRequest,
  GetPollingManagedProcessesResponse,
} from "@flowser/shared";
import { TransportService } from "./transports/transport.service";

export class ProcessesService {
  constructor(private readonly transport: TransportService) {}

  restart({ processId }: { processId: string }): Promise<void> {
    return this.transport.send({
      requestMethod: "POST",
      resourceIdentifier: `/api/processes/${processId}/restart`,
    });
  }

  getAllOutputsByProcessWithPolling({
    processId,
    ...data
  }: {
    timestamp: number;
    processId: string;
  }): Promise<GetPollingOutputsResponse> {
    return this.transport.send({
      requestMethod: "POST",
      resourceIdentifier: `/api/processes/${processId}/logs/polling`,
      requestData: data,
      requestProtobuf: GetPollingOutputsRequest,
      responseProtobuf: GetPollingOutputsResponse,
    });
  }

  getAllOutputsWithPolling(data: {
    timestamp: number;
  }): Promise<GetPollingOutputsResponse> {
    return this.transport.send({
      requestMethod: "POST",
      resourceIdentifier: `/api/processes/logs/polling`,
      requestData: data,
      requestProtobuf: GetPollingOutputsRequest,
      responseProtobuf: GetPollingOutputsResponse,
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
