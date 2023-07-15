package main

import (
	"bufio"
	"encoding/json"
	"os"

	"github.com/onflow/cadence/runtime/ast"
	"github.com/onflow/cadence/runtime/parser"
)

type Response struct {
	Interaction *Interaction `json:"interaction"`
	Program     *ast.Program `json:"program"`
	Error       string       `json:"error"`
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
		response.Interaction = interaction
	}

	err = json.NewEncoder(os.Stdout).Encode(response)
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
	Kind       InteractionKind
	Parameters []InteractionParameter
}

type ParameterKind uint

const (
	ParameterKindUnknown ParameterKind = iota
	ParameterKindNumeric
	ParameterKindTextual
	ParameterKindBoolean
	ParameterKindAddress
)

type InteractionParameter struct {
	Kind        ParameterKind
	CadenceType string
	// TODO: Add support for optional types (e.g. `optional` flag)
}

func buildInteraction(program *ast.Program) *Interaction {
	transactionDeclaration := getTransactionDeclaration(program.Declarations())

	if transactionDeclaration != nil {
		return &Interaction{
			Kind:       InteractionKindTransaction,
			Parameters: buildInteractionParameterList(transactionDeclaration.ParameterList),
		}
	}

	mainFunctionDeclaration := getMainFunctionDeclaration(program.Declarations())

	if mainFunctionDeclaration != nil {
		return &Interaction{
			Kind:       InteractionKindScript,
			Parameters: buildInteractionParameterList(mainFunctionDeclaration.ParameterList),
		}
	}

	return &Interaction{
		Kind: InteractionKindUnknown,
	}
}

func buildInteractionParameterList(parameterList *ast.ParameterList) []InteractionParameter {
	var parameters []InteractionParameter

	for _, parameter := range parameterList.Parameters {
		parameters = append(parameters, buildInteractionParameter(parameter))
	}

	return parameters
}

func buildInteractionParameter(parameter *ast.Parameter) InteractionParameter {
	cadenceType := parameter.TypeAnnotation.Type.String()

	return InteractionParameter{
		Kind:        getInteractionParameterKind(parameter.TypeAnnotation),
		CadenceType: cadenceType,
	}
}

func getInteractionParameterKind(typeAnnotation *ast.TypeAnnotation) ParameterKind {
	switch typeAnnotation.Type.String() {
	case "Address":
		return ParameterKindAddress
	case "Bool":
		return ParameterKindBoolean
	case "String",
		"Character",
		"Bytes",
		"Path",
		"CapabilityPath",
		"StoragePath",
		"PublicPath",
		"PrivatePath":
		return ParameterKindTextual
	case "Number",
		"SignedNumber",
		"Integer",
		"SignedInteger",
		"FixedPoint",
		"SignedFixedPoint",
		"Int",
		"Int8",
		"Int16",
		"Int32",
		"Int64",
		"Int128",
		"Int256",
		"UInt",
		"UInt8",
		"UInt16",
		"UInt32",
		"UInt64",
		"UInt128",
		"UInt256",
		"Fix64",
		"UFIx64":
		return ParameterKindNumeric
	default:
		return ParameterKindUnknown
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
