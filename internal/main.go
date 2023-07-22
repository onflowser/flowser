package main

import (
	"bufio"
	"encoding/json"
	"os"
	"strings"

	"github.com/onflow/cadence/runtime/ast"
	"github.com/onflow/cadence/runtime/parser"
)

// Response must match the messages specified in `shared/proto/api/interactions.proto`
type Response struct {
	Interaction *Interaction `json:"interaction"`
	Program     *ast.Program `json:"program"`
	Error       string       `json:"error"`
}

func main() {
	reader := bufio.NewReader(os.Stdin)
	nullTerminatedCode, err := reader.ReadString(byte(0))
	if err != nil {
		panic(err)
	}

	code := strings.TrimSuffix(nullTerminatedCode, "\x00")

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
	Kind       InteractionKind `json:"kind"`
	Parameters []*Parameter    `json:"parameters"`
}

type Parameter struct {
	Identifier string       `json:"identifier"`
	Type       *CadenceType `json:"type"`
}

type CadenceTypeKind uint

const (
	CadenceTypeUnknown CadenceTypeKind = iota
	CadenceTypeNumeric
	CadenceTypeTextual
	CadenceTypeBoolean
	CadenceTypeAddress
	CadenceTypeArray
	CadenceTypeDictionary
)

type CadenceType struct {
	Kind     CadenceTypeKind `json:"kind"`
	RawType  string          `json:"rawType"`
	Optional bool            `json:"optional"`

	// sub-type specific fields
	ArrayType      *Array      `json:"array"`
	DictionaryType *Dictionary `json:"dictionary"`
}

type Array struct {
	Element *CadenceType `json:"element"`
	Size    int64        `json:"size"`
}

type Dictionary struct {
	Key   *CadenceType `json:"key"`
	Value *CadenceType `json:"value"`
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

func buildInteractionParameterList(parameterList *ast.ParameterList) []*Parameter {
	var parameters []*Parameter

	if parameterList == nil {
		return parameters
	}

	for _, parameter := range parameterList.Parameters {
		parameters = append(parameters, &Parameter{
			Identifier: parameter.Identifier.Identifier,
			Type:       buildCadenceType(parameter.TypeAnnotation.Type),
		})
	}

	return parameters
}

func buildCadenceType(uncastedType ast.Type) *CadenceType {
	cadenceType := uncastedType.String()

	switch castedType := uncastedType.(type) {
	case *ast.OptionalType:
		nestedInteraction := buildCadenceType(castedType.Type)
		nestedInteraction.Optional = true
		return nestedInteraction
	case *ast.VariableSizedType:
		return &CadenceType{
			Kind:     CadenceTypeArray,
			RawType:  cadenceType,
			Optional: false,
			ArrayType: &Array{
				Element: buildCadenceType(castedType.Type),
				Size:    -1,
			},
		}
	case *ast.ConstantSizedType:
		return &CadenceType{
			Kind:     CadenceTypeArray,
			RawType:  cadenceType,
			Optional: false,
			ArrayType: &Array{
				Element: buildCadenceType(castedType.Type),
				Size:    castedType.Size.Value.Int64(),
			},
		}
	case *ast.DictionaryType:
		return &CadenceType{
			Kind:     CadenceTypeDictionary,
			RawType:  cadenceType,
			Optional: false,
			DictionaryType: &Dictionary{
				Key:   buildCadenceType(castedType.KeyType),
				Value: buildCadenceType(castedType.ValueType),
			},
		}
	default:
		return &CadenceType{
			Kind:     getDefaultCadenceTypeKind(uncastedType),
			RawType:  cadenceType,
			Optional: false,
		}
	}
}

// TODO: Remove the need for this helper util and use type assertions instead
func getDefaultCadenceTypeKind(t ast.Type) CadenceTypeKind {
	switch t.String() {
	case "Address":
		return CadenceTypeAddress
	case "Bool":
		return CadenceTypeBoolean
	case "String",
		"Character",
		"Bytes",
		"Path",
		"CapabilityPath",
		"StoragePath",
		"PublicPath",
		"PrivatePath":
		return CadenceTypeTextual
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
		return CadenceTypeNumeric
	default:
		return CadenceTypeUnknown
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
