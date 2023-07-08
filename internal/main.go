package main

import (
	"bufio"
	"encoding/json"
	"os"

	"github.com/onflow/cadence/runtime/ast"
	"github.com/onflow/cadence/runtime/parser"
)

type Request struct {
	Code string `json:"code"`
}

type Response struct {
	Program *ast.Program `json:"program"`
	Error   string       `json:"error"`
}

func main() {
	reader := bufio.NewReader(os.Stdin)
	code, err := reader.ReadString('\n')
	if err != nil {
		panic(err)
	}

	var response Response
	program, err := parser.ParseProgram(nil, []byte(code), parser.Config{})
	if err != nil {
		response.Error = err.Error()
	} else {
		response.Program = program
	}

	err = json.NewEncoder(os.Stdout).Encode(response)
	if err != nil {
		panic(err)
	}
}
