import { SendRequestOptions, TransportService } from "./transport.service";
import axios, { AxiosInstance, AxiosResponse } from "axios";
import { FlowserError } from "@flowser/shared";

export class HttpTransportService implements TransportService {
  private axios: AxiosInstance;

  constructor() {
    this.axios = axios.create({
      baseURL: process.env.REACT_APP_API_HOST || "http://localhost:6061",
    });
    this.axios.interceptors.response.use(
      function (response) {
        // status codes within the 2xx range trigger this function
        return response;
      },
      function (error): FlowserError {
        // status codes outside the 2xx range trigger this function
        console.error("HTTP transport error");
        console.error(error);
        throw (
          error.response.data.error ??
          FlowserError.fromPartial({
            message: error.response.data.message ?? "Unknown error",
          })
        );
      }
    );
  }

  async send<ResponseData, RequestData>(
    options: SendRequestOptions<RequestData>
  ): Promise<ResponseData> {
    const response = await this.sendRequest<RequestData, ResponseData>(options);
    return options.responseProtobuf?.fromJSON(response.data);
  }

  private sendRequest<RequestData, ResponseData>(
    options: SendRequestOptions<RequestData>
  ): Promise<AxiosResponse<ResponseData>> {
    const { requestMethod, requestProtobuf, requestData, resourceIdentifier } =
      options;

    switch (requestMethod) {
      case "GET":
        return this.axios.get(resourceIdentifier);
      case "DELETE":
        return this.axios.delete(resourceIdentifier);
      case "POST":
        return this.axios.post(
          resourceIdentifier,
          requestProtobuf?.toJSON(requestData) ?? {}
        );
      case "PUT":
        return this.axios.put(
          resourceIdentifier,
          requestProtobuf?.toJSON(requestData) ?? {}
        );
      case "PATCH":
        return this.axios.patch(
          resourceIdentifier,
          requestProtobuf?.toJSON(requestData) ?? {}
        );
      default:
        throw new Error(`Unsupported request method: ${requestMethod}`);
    }
  }
}
