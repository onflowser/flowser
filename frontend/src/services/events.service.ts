import {
  GetPollingEventsByTransactionRequest,
  GetPollingEventsByTransactionResponse,
  GetPollingEventsRequest,
  GetPollingEventsResponse,
} from "@flowser/shared";
import { TransportService } from "./transports/transport.service";

export class EventsService {
  constructor(private readonly transport: TransportService) {}

  getAllWithPolling(data: {
    timestamp: number;
  }): Promise<GetPollingEventsResponse> {
    return this.transport.send({
      requestMethod: "POST",
      resourceIdentifier: `/api/events/polling`,
      requestData: data,
      requestProtobuf: GetPollingEventsRequest,
      responseProtobuf: GetPollingEventsResponse,
    });
  }

  getAllWithPollingByTransaction({
    transactionId,
    ...data
  }: {
    timestamp: number;
    transactionId: string;
  }): Promise<GetPollingEventsResponse> {
    return this.transport.send({
      requestMethod: "POST",
      resourceIdentifier: `/api/transactions/${transactionId}/events/polling`,
      requestData: data,
      requestProtobuf: GetPollingEventsByTransactionRequest,
      responseProtobuf: GetPollingEventsByTransactionResponse,
    });
  }
}
