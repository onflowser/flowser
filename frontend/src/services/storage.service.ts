import {
  GetPollingStorageRequest,
  GetPollingStorageResponse,
} from "@flowser/shared";
import { TransportService } from "./transports/transport.service";

export class StorageService {
  constructor(private readonly transport: TransportService) {}

  getAllByAccountWithPolling({
    accountAddress,
    ...data
  }: {
    accountAddress: string;
    timestamp: number;
  }): Promise<GetPollingStorageResponse> {
    return this.transport.send({
      requestMethod: "GET",
      resourceIdentifier: `/api/accounts/${accountAddress}/storage/polling`,
      requestData: data,
      requestProtobuf: GetPollingStorageRequest,
      responseProtobuf: GetPollingStorageResponse,
    });
  }
}
