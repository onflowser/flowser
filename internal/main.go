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

	interaction := buildInteraction(program)

	if err != nil {
		response.Error = err.Error()
	} else {
		response.Program = program
	}

	err = json.NewEncoder(os.Stdout).Encode(interaction)
	if err != nil {
		panic(err)
	}
}

type InteractionKind uint

const (
	InteractionKindUnknown InteractionKind = iota
	InteractionKindScript
	InteractionKindTransaction
)

type Interaction struct {
	Kind InteractionKind
}

type ArgumentKind uint

const (
	ArgumentKindUnknown ArgumentKind = iota
	ArgumentKindNumeric
	ArgumentKindTextual
	ArgumentKindBoolean
)

type InteractionArgument struct {
	Kind        ArgumentKind
	CadenceType string
}

func buildInteraction(program *ast.Program) *Interaction {
	kind := InteractionKindUnknown

	transactionDeclaration := getTransactionDeclaration(program.Declarations())

	if transactionDeclaration != nil {
		kind = InteractionKindTransaction
	}

	mainFunctionDeclaration := getMainFunctionDeclaration(program.Declarations())

	if mainFunctionDeclaration != nil {
		kind = InteractionKindScript
	}

	return &Interaction{
		Kind: kind,
	}
}

func getTransactionDeclaration(declarations []ast.Declaration) *ast.TransactionDeclaration {
	var transactionDeclaration *ast.TransactionDeclaration
	for _, declaration := range declarations {
		if declaration.ElementType() == ast.ElementTypeTransactionDeclaration {
			transactionDeclaration = declaration.(*ast.TransactionDeclaration)
		}
	}
	return transactionDeclaration
}

func getMainFunctionDeclaration(declarations []ast.Declaration) *ast.FunctionDeclaration {
	var mainFunctionDeclaration *ast.FunctionDeclaration
	for _, declaration := range declarations {
		if declaration.ElementType() == ast.ElementTypeFunctionDeclaration {
			functionDeclaration := declaration.(*ast.FunctionDeclaration)
			if functionDeclaration.Identifier.Identifier == "main" {
				mainFunctionDeclaration = functionDeclaration
			}
		}
	}
	return mainFunctionDeclaration
}
