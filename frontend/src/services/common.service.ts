import axios from "../config/axios";
import { AxiosResponse } from "axios";
import {
  GetAllObjectsCountsResponse,
  GetFlowserVersionResponse,
} from "@flowser/types/generated/responses/common";
import { GetFlowCliInfoResponse } from "@flowser/types/generated/responses/flow";

export class CommonService {
  private static instance: CommonService | undefined;

  static getInstance(): CommonService {
    if (!CommonService.instance) {
      CommonService.instance = new CommonService();
    }
    return CommonService.instance;
  }

  getFlowserVersion(): Promise<AxiosResponse<GetFlowserVersionResponse>> {
    return axios.get("/api/version", {
      transformResponse: (data) =>
        GetFlowserVersionResponse.fromJSON(JSON.parse(data)),
    });
  }

  getFlowCliInfo(): Promise<AxiosResponse<GetFlowCliInfoResponse>> {
    return axios.get("/api/flow/version", {
      transformResponse: (data) =>
        GetFlowCliInfoResponse.fromJSON(JSON.parse(data)),
    });
  }

  getAllObjectsCounts(): Promise<AxiosResponse<GetAllObjectsCountsResponse>> {
    return axios.get("/api/common/counters", {
      transformResponse: (data) =>
        GetAllObjectsCountsResponse.fromJSON(JSON.parse(data)),
    });
  }
}
