import {
  GetSingleContractResponse,
  GetPollingContractsResponse,
} from "@flowser/shared";
import axios from "../config/axios";
import { AxiosResponse } from "axios";
import { TransportService } from "./transports/transport.service";

export class ContractsService {
  constructor(private readonly transport: TransportService) {}

  getAllWithPolling({
    timestamp,
  }: {
    timestamp: number;
  }): Promise<AxiosResponse<GetPollingContractsResponse>> {
    return axios.get("/api/contracts/polling", {
      params: {
        timestamp,
      },
      transformResponse: (data) =>
        GetPollingContractsResponse.fromJSON(JSON.parse(data)),
    });
  }

  getAllByAccountWithPolling({
    accountAddress,
    timestamp,
  }: {
    accountAddress: string;
    timestamp: number;
  }): Promise<AxiosResponse<GetPollingContractsResponse>> {
    return axios.get(`/api/accounts/${accountAddress}/contracts/polling`, {
      params: {
        timestamp,
      },
      transformResponse: (data) =>
        GetPollingContractsResponse.fromJSON(JSON.parse(data)),
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
