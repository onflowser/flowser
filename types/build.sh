mkdir -p generated

protoc -I=./proto \
  --plugin=./node_modules/.bin/protoc-gen-ts_proto \
  --ts_proto_opt=esModuleInterop=true \
  --ts_proto_opt=outputServices=grpc-js \
  --ts_proto_out=generated \
  ./proto/*

tsc -p tsconfig.json
mv -v dist/generated/*.js generated/
mv -v dist/generated/google/protobuf/*.js generated/google/protobuf
rm -r dist
