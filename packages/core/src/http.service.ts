import axios, { Method } from "axios";
import axiosRetry from 'axios-retry';
import { IFlowserLogger } from "./logger";

type RequestConfig = {
  url: string;
  method?: Method;
}

export class HttpService {
  constructor(private readonly logger: IFlowserLogger) {}

  public async isReachable(url: string) {
    try {
      await axios.request({
        method: "GET",
        url,
        // Prevent axios from throwing on certain http response codes
        // https://github.com/axios/axios/issues/41
        validateStatus: () => true,
      });
      // Assume that if response is received, the HTTP server is online.
      return true;
    } catch (error) {
      return false;
    }
  }

  public async request<Response>(config: RequestConfig) {
    const client = axios.create({
      // Prevent axios from throwing on certain http response codes
      // https://github.com/axios/axios/issues/41
      validateStatus: () => true,
    });

    axiosRetry(client, {
      retries: 4,
      retryDelay: axiosRetry.exponentialDelay,
      onRetry: retryCount => {
        this.logger.debug(`Retrying ${config.url} (${retryCount})`);
      }
    });

    return client.request<Response>(config);
  }
}
