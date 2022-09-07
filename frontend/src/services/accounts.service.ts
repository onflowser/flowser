import {
  GetSingleAccountResponse,
  GetPollingAccountsResponse,
  GetPollingKeysResponse,
  GetPollingAccountsRequest,
  GetPollingKeysRequest,
} from "@flowser/shared";
import { TransportService } from "./transports/transport.service";

export class AccountsService {
  constructor(private readonly transport: TransportService) {}

  getAllWithPolling(data: {
    timestamp: number;
  }): Promise<GetPollingAccountsResponse> {
    return this.transport.send({
      requestMethod: "POST",
      resourceIdentifier: "/api/accounts/polling",
      requestData: data,
      requestProtobuf: GetPollingAccountsRequest,
      responseProtobuf: GetPollingAccountsResponse,
    });
  }

  getAllKeysByAccountWithPolling({
    accountAddress,
    ...data
  }: {
    accountAddress: string;
    timestamp: number;
  }): Promise<GetPollingKeysResponse> {
    return this.transport.send({
      requestMethod: "POST",
      resourceIdentifier: `/api/accounts/${accountAddress}/keys/polling`,
      requestData: data,
      requestProtobuf: GetPollingKeysRequest,
      responseProtobuf: GetPollingKeysResponse,
    });
  }

  getSingle(id: string): Promise<GetSingleAccountResponse> {
    return this.transport.send({
      requestMethod: "GET",
      resourceIdentifier: `/api/accounts/${id}`,
      responseProtobuf: GetSingleAccountResponse,
    });
  }
}
