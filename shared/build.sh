rm -rf ./src/generated

mkdir -p ./src/generated

protoc -I=./proto \
  --plugin=./node_modules/.bin/protoc-gen-ts_proto \
  --ts_proto_opt=esModuleInterop=true \
  --ts_proto_opt=outputServices=grpc-js \
  --ts_proto_out=./src/generated \
  ./proto/entities/* \
  ./proto/responses/*
