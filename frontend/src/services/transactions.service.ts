import {
  GetSingleTransactionResponse,
  GetPollingTransactionsResponse,
  GetPollingTransactionsRequest,
  GetPollingTransactionsByBlockRequest,
  GetPollingTransactionsByBlockResponse,
  GetPollingTransactionsByAccountRequest,
  GetPollingTransactionsByAccountResponse,
  GetAllTransactionsResponse,
} from "@flowser/shared";
import { TransportService } from "./transports/transport.service";

export class TransactionsService {
  constructor(private readonly transport: TransportService) {}

  getAll(): Promise<GetAllTransactionsResponse> {
    return this.transport.send({
      requestMethod: "GET",
      resourceIdentifier: "/api/transactions",
      responseProtobuf: GetAllTransactionsResponse,
    });
  }

  getAllWithPolling(data: {
    timestamp: number;
  }): Promise<GetPollingTransactionsResponse> {
    return this.transport.send({
      requestMethod: "POST",
      resourceIdentifier: "/api/transactions/polling",
      requestData: data,
      requestProtobuf: GetPollingTransactionsRequest,
      responseProtobuf: GetPollingTransactionsResponse,
    });
  }

  getAllByBlockWithPolling({
    blockId,
    ...data
  }: {
    timestamp: number;
    blockId: string;
  }): Promise<GetPollingTransactionsResponse> {
    return this.transport.send({
      requestMethod: "POST",
      resourceIdentifier: `/api/blocks/${blockId}/transactions/polling`,
      requestData: data,
      requestProtobuf: GetPollingTransactionsByBlockRequest,
      responseProtobuf: GetPollingTransactionsByBlockResponse,
    });
  }

  getAllByAccountWithPolling({
    accountAddress,
    ...data
  }: {
    timestamp: number;
    accountAddress: string;
  }): Promise<GetPollingTransactionsResponse> {
    return this.transport.send({
      requestMethod: "POST",
      resourceIdentifier: `/api/accounts/${accountAddress}/transactions/polling`,
      requestData: data,
      requestProtobuf: GetPollingTransactionsByAccountRequest,
      responseProtobuf: GetPollingTransactionsByAccountResponse,
    });
  }

  getSingle(id: string): Promise<GetSingleTransactionResponse> {
    return this.transport.send({
      requestMethod: "GET",
      resourceIdentifier: `/api/transactions/${id}`,
      responseProtobuf: GetSingleTransactionResponse,
    });
  }
}
