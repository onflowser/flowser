export interface ProtobufLikeObject {
  toJSON: (value: any) => any;
  fromJSON: (value: any) => any;
  fromPartial: (value: any) => any;
}
