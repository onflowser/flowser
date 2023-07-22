package main

import (
	"testing"

	"github.com/onflow/cadence/runtime/parser"
)

func TestSimpleInteraction(t *testing.T) {
	interaction := parseAndBuildInteraction("transaction (addr: Address) {}")

	if interaction.Kind != InteractionKindTransaction {
		t.Error("Expected transaction kind")
	}

	if len(interaction.Parameters) != 1 {
		t.Error("Expected a single parameter")
	}

	if interaction.Parameters[0].Identifier != "addr" {
		t.Error("Expected 'addr' identifier")
	}

	if interaction.Parameters[0].Type.Kind != CadenceTypeAddress {
		t.Error("Expected Address parameter kind")
	}

	if interaction.Parameters[0].Type.Optional {
		t.Error("Expected required")
	}
}

func TestInteractionWithOptionalParameter(t *testing.T) {
	interaction := parseAndBuildInteraction("transaction (addr: [Address?]?) {}")

	if interaction.Parameters[0].Identifier != "addr" {
		t.Error("Expected 'addr' identifier")
	}

	if interaction.Parameters[0].Type.Kind != CadenceTypeArray {
		t.Error("Expected Array parameter kind")
	}

	if !interaction.Parameters[0].Type.Optional {
		t.Error("Expected optional")
	}

	if interaction.Parameters[0].Type.ArrayType.Element.Kind != CadenceTypeAddress {
		t.Error("Expected Address element kind")
	}

	if !interaction.Parameters[0].Type.ArrayType.Element.Optional {
		t.Error("Expected optional array element")
	}
}

func TestVariableArrayParameter(t *testing.T) {
	interaction := parseAndBuildInteraction("transaction (addresses: [Address]) {}")

	if interaction.Parameters[0].Identifier != "addresses" {
		t.Error("Expected 'addresses' identifier")
	}

	if interaction.Parameters[0].Type.Kind != CadenceTypeArray {
		t.Error("Expected Array parameter kind")
	}

	if interaction.Parameters[0].Type.ArrayType == nil {
		t.Error("Expected array sub-field to be set")
	}

	if interaction.Parameters[0].Type.ArrayType.Element.Kind != CadenceTypeAddress {
		t.Error("Expected Address parameter kind")
	}

	if interaction.Parameters[0].Type.ArrayType.Size != -1 {
		t.Error("Expected size -1")
	}
}

func TestConstantArrayParameter(t *testing.T) {
	interaction := parseAndBuildInteraction("transaction (addresses: [Address; 3]) {}")

	if interaction.Parameters[0].Identifier != "addresses" {
		t.Error("Expected 'addresses' identifier")
	}

	if interaction.Parameters[0].Type.Kind != CadenceTypeArray {
		t.Error("Expected Array parameter kind")
	}

	if interaction.Parameters[0].Type.ArrayType == nil {
		t.Error("Expected array sub-field to be set")
	}

	if interaction.Parameters[0].Type.ArrayType.Element.Kind != CadenceTypeAddress {
		t.Error("Expected Address element kind")
	}

	if interaction.Parameters[0].Type.ArrayType.Size != 3 {
		t.Error("Expected size 3")
	}
}

func TestDictionaryParameter(t *testing.T) {
	interaction := parseAndBuildInteraction("transaction (addressLookupById: {String: Address}) {}")

	if interaction.Parameters[0].Identifier != "addressLookupById" {
		t.Error("Expected 'addressLookupById' identifier")
	}

	if interaction.Parameters[0].Type.Kind != CadenceTypeDictionary {
		t.Error("Expected Dictionary parameter kind")
	}

	if interaction.Parameters[0].Type.DictionaryType == nil {
		t.Error("Expected dictionary sub-field to be set")
	}

	if interaction.Parameters[0].Type.DictionaryType.Key.Kind != CadenceTypeTextual {
		t.Error("Expected String key kind")
	}

	if interaction.Parameters[0].Type.DictionaryType.Value.Kind != CadenceTypeAddress {
		t.Error("Expected Address value kind")
	}
}

func parseAndBuildInteraction(code string) *Interaction {
	program, err := parser.ParseProgram(nil, []byte(code), parser.Config{})

	if err != nil {
		panic(err)
	}

	return buildInteraction(program)
}
