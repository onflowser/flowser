import { ProtobufLikeObject } from "@flowser/shared";

export type TransportRequestMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE";

export type SendRequestOptions<RequestData> = {
  requestMethod: TransportRequestMethod;
  resourceIdentifier: string;
  requestData?: RequestData;
  requestProtobuf?: ProtobufLikeObject;
  responseProtobuf?: ProtobufLikeObject;
};

export interface TransportService {
  send<ResponseData, RequestData>(
    options: SendRequestOptions<RequestData>
  ): Promise<ResponseData>;
}
