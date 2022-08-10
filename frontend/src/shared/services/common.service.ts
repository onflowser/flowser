import axios from "../config/axios";
import { AxiosResponse } from "axios";
import { GetFlowserVersionResponse } from "@flowser/types/generated/responses/common";

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
}
