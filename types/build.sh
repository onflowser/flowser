mkdir -p generated

protoc -I=./proto \
  --plugin=./node_modules/.bin/protoc-gen-ts_proto \
  --ts_proto_opt=esModuleInterop=true \
  --ts_proto_opt=outputServices=grpc-js \
  --ts_proto_out=generated \
  ./proto/entities/* \
  ./proto/responses/*

cp shared/*.ts generated/

tsc -p tsconfig.json

mv -v dist/shared/*.js generated
mv -v dist/generated/entities/*.js generated/entities
mv -v dist/generated/responses/*.js generated/responses
mv -v dist/generated/google/protobuf/*.js generated/google/protobuf

rm -r dist
