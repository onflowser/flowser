EXEC_PATH=bin/internal
SOURCE_PATH=../../internal/main.go

# Technically, only 64bit architectures are supported, since
# Cadence can't be built for 32bit arch due to constant overflows:

# This is the error you get when try building for 32bit arch:
# ../../../go/pkg/mod/github.com/onflow/cadence@v0.39.14/runtime/interpreter/decode.go:37:21: cannot use math.MaxInt64 (untyped int constant 9223372036854775807) as int value in struct literal (overflows)

# https://freshman.tech/snippets/go/cross-compile-go-programs

# Windows
GOOS=windows GOARCH=amd64 go build -o "${EXEC_PATH}-amd64.exe" "${SOURCE_PATH}"

# MacOS
GOOS=darwin GOARCH=amd64 go build -o "${EXEC_PATH}-amd64-darwin" "${SOURCE_PATH}"

# Linux
GOOS=linux GOARCH=amd64 go build -o "${EXEC_PATH}-amd64-linux" "${SOURCE_PATH}"

