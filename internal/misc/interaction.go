package misc

import (
	"github.com/onflow/cadence/runtime/ast"
	"github.com/onflow/cadence/runtime/parser"
)

// InteractionResponse must match the messages specified in `shared/proto/api/interactions.proto`
type InteractionResponse struct {
	Interaction *Interaction `json:"interaction"`
	Program     *ast.Program `json:"program"`
	Error       string       `json:"error"`
}

func ParseInteraction(code []byte) InteractionResponse {
	var response InteractionResponse
	program, err := parser.ParseProgram(nil, code, parser.Config{})

	interaction := buildInteraction(program)

	if err != nil {
		response.Error = err.Error()
	} else {
		response.Program = program
		response.Interaction = interaction
	}

	return response
}

type InteractionKind uint

const (
	InteractionKindUnknown InteractionKind = iota
	InteractionKindScript
	InteractionKindTransaction
)

type Interaction struct {
	Kind        InteractionKind     `json:"kind"`
	Parameters  []*Parameter        `json:"parameters"`
	Transaction *TransactionDetails `json:"transaction"`
}

type TransactionDetails struct {
	AuthorizerCount int `json:"authorizerCount"`
}

type Parameter struct {
	Identifier string       `json:"identifier"`
	Type       *CadenceType `json:"type"`
}

type CadenceTypeKind uint

const (
	CadenceTypeUnknown CadenceTypeKind = iota
	CadenceTypeFixedPointNumber
	CadenceTypeIntegerNumber
	CadenceTypeTextual
	CadenceTypeBoolean
	CadenceTypeAddress
	CadenceTypeArray
	CadenceTypeDictionary
	CadenceTypePath
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
			Kind:        InteractionKindTransaction,
			Parameters:  buildInteractionParameterList(transactionDeclaration.ParameterList),
			Transaction: getTransactionDetails(transactionDeclaration),
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

func getTransactionDetails(transactionDeclaration *ast.TransactionDeclaration) *TransactionDetails {
	var authorizerCount int

	if transactionDeclaration.Prepare != nil {
		authorizerCount = len(transactionDeclaration.Prepare.FunctionDeclaration.ParameterList.Parameters)
	}

	return &TransactionDetails{
		AuthorizerCount: authorizerCount,
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

// TODO: Remove the need for this helper util and use type assertions instead?
// For a list of all available types, see:
// https://developers.flow.com/tooling/fcl-js/api#ftype
func getDefaultCadenceTypeKind(t ast.Type) CadenceTypeKind {
	switch t.String() {
	case "Address":
		return CadenceTypeAddress
	case "Bool":
		return CadenceTypeBoolean
	case "String",
		"Character",
		"Bytes":
		return CadenceTypeTextual
	case "Path",
		"CapabilityPath",
		"StoragePath",
		"PublicPath",
		"PrivatePath":
		return CadenceTypePath
	case
		// Bellow are number super-types.
		// https://developers.flow.com/cadence/language/values-and-types#integers
		"Number",
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
		"UInt256":
		return CadenceTypeIntegerNumber
	// We need to treat these ones seperatelly,
	// because their values are formatted differently ƒrom integers.
	// See: https://developers.flow.com/tooling/fcl-js/api#ftype
	case "Fix64",
		"UFix64":
		return CadenceTypeFixedPointNumber
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
