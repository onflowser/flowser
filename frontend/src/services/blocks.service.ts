import {
  GetSingleBlockResponse,
  GetPollingBlocksResponse,
} from "@flowser/shared";
import axios from "../config/axios";
import { AxiosResponse } from "axios";

export class BlocksService {
  private static instance: BlocksService | undefined;

  static getInstance(): BlocksService {
    if (!BlocksService.instance) {
      BlocksService.instance = new BlocksService();
    }
    return BlocksService.instance;
  }

  getAllWithPolling({
    timestamp,
  }: {
    timestamp: number;
  }): Promise<AxiosResponse<GetPollingBlocksResponse>> {
    return axios.get("/api/blocks/polling", {
      params: {
        timestamp,
      },
      transformResponse: (data) =>
        GetPollingBlocksResponse.fromJSON(JSON.parse(data)),
    });
  }

  getSingle(id: string): Promise<AxiosResponse<GetSingleBlockResponse>> {
    return axios.get(`/api/blocks/${id}`, {
      transformResponse: (data) =>
        GetSingleBlockResponse.fromJSON(JSON.parse(data)),
    });
  }
}
