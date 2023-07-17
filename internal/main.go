package main

import (
	"bufio"
	"encoding/json"
	"math/big"
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
	Parameters []*InteractionParameter
}

type ParameterKind uint

const (
	ParameterKindUnknown ParameterKind = iota
	ParameterKindNumeric
	ParameterKindTextual
	ParameterKindBoolean
	ParameterKindAddress
	ParameterKindArray
	ParameterKindDictionary
)

type InteractionParameter struct {
	Kind        ParameterKind
	CadenceType string
	Optional    bool

	ArrayParameter      *ArrayParameter
	DictionaryParameter *DictionaryParameter
}

type ArrayParameter struct {
	Element *InteractionParameter
	Size    *big.Int
}

type DictionaryParameter struct {
	Key   *InteractionParameter
	Value *InteractionParameter
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

func buildInteractionParameterList(parameterList *ast.ParameterList) []*InteractionParameter {
	var parameters []*InteractionParameter

	for _, parameter := range parameterList.Parameters {
		parameters = append(parameters, buildInteractionParameter(parameter.TypeAnnotation.Type))
	}

	return parameters
}

func buildInteractionParameter(uncastedType ast.Type) *InteractionParameter {
	cadenceType := uncastedType.String()

	switch castedType := uncastedType.(type) {
	case *ast.OptionalType:
		// TODO: Fix this
		return &InteractionParameter{
			Kind:        getDefaultParameterKind(castedType.Type),
			CadenceType: cadenceType,
			Optional:    true,
		}
	case *ast.VariableSizedType:
		return &InteractionParameter{
			Kind:        ParameterKindArray,
			CadenceType: cadenceType,
			Optional:    false,
			ArrayParameter: &ArrayParameter{
				Element: buildInteractionParameter(castedType.Type),
				Size:    big.NewInt(-1),
			},
		}
	case *ast.ConstantSizedType:
		return &InteractionParameter{
			Kind:        ParameterKindArray,
			CadenceType: cadenceType,
			Optional:    false,
			ArrayParameter: &ArrayParameter{
				Element: buildInteractionParameter(castedType.Type),
				Size:    castedType.Size.Value,
			},
		}
	case *ast.DictionaryType:
		return &InteractionParameter{
			Kind:        ParameterKindDictionary,
			CadenceType: cadenceType,
			Optional:    false,
			DictionaryParameter: &DictionaryParameter{
				Key:   buildInteractionParameter(castedType.KeyType),
				Value: buildInteractionParameter(castedType.ValueType),
			},
		}
	default:
		return &InteractionParameter{
			Kind:        getDefaultParameterKind(uncastedType),
			CadenceType: cadenceType,
			Optional:    false,
		}
	}
}

// TODO: Remove the need for this helper util and use type assertions instead
func getDefaultParameterKind(t ast.Type) ParameterKind {
	switch t.String() {
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
