import {
  GetSingleContractResponse,
  GetPollingContractsResponse,
  GetPollingContractsByAccountResponse,
  GetPollingContractsByAccountRequest,
  GetPollingContractsRequest,
} from "@flowser/shared";
import { TransportService } from "./transports/transport.service";

export class ContractsService {
  constructor(private readonly transport: TransportService) {}

  getAllWithPolling(data: {
    timestamp: number;
  }): Promise<GetPollingContractsResponse> {
    return this.transport.send({
      requestMethod: "POST",
      resourceIdentifier: `/api/contracts/polling`,
      requestData: data,
      requestProtobuf: GetPollingContractsRequest,
      responseProtobuf: GetPollingContractsResponse,
    });
  }

  getAllByAccountWithPolling({
    accountAddress,
    ...data
  }: {
    accountAddress: string;
    timestamp: number;
  }): Promise<GetPollingContractsResponse> {
    return this.transport.send({
      requestMethod: "POST",
      resourceIdentifier: `/api/accounts/${accountAddress}/contracts/polling`,
      requestData: data,
      requestProtobuf: GetPollingContractsByAccountRequest,
      responseProtobuf: GetPollingContractsByAccountResponse,
    });
  }

  getSingle(id: string): Promise<GetSingleContractResponse> {
    return this.transport.send({
      requestMethod: "GET",
      resourceIdentifier: `/api/contracts/${id}`,
      responseProtobuf: GetSingleContractResponse,
    });
  }
}
