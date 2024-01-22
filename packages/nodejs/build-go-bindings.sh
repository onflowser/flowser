OUT_PATH=bin
BIN_PREFIX=flowser-internal
SOURCE_PATH=../../internal/main.go
# This is added in case it's run on linux with newly installed go bin using `install-go.js`.
PATH=$PATH:/usr/local/go/bin

# Technically, only 64bit architectures are supported, since
# Cadence can't be built for 32bit arch due to constant overflows:

# This is the error you get when try building for 32bit arch:
# ../../../go/pkg/mod/github.com/onflow/cadence@v0.39.14/runtime/interpreter/decode.go:37:21: cannot use math.MaxInt64 (untyped int constant 9223372036854775807) as int value in struct literal (overflows)

# https://freshman.tech/snippets/go/cross-compile-go-programs

rm -rf $OUT_PATH
mkdir -p $OUT_PATH

function build() {
  GOOS=$1
  GOARCH=$2
  POSTFIX=$3
  GOOS=$GOOS GOARCH=$GOARCH go build -o "${OUT_PATH}/${BIN_PREFIX}-${GOARCH}-${GOOS}${POSTFIX}" "${SOURCE_PATH}"
}

# Windows
build windows amd64 .exe
build windows arm64 .exe

# MacOS
build darwin amd64
build darwin arm64

# Linux
build linux amd64
build linux arm64

