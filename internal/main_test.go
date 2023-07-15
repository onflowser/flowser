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

	if interaction.Parameters[0].Kind != ParameterKindAddress {
		t.Error("Expected Address parameter kind")
	}

	if interaction.Parameters[0].Optional {
		t.Error("Expected required")
	}
}

func TestSimpleInteractionWithOptionalParameter(t *testing.T) {
	interaction := parseAndBuildInteraction("transaction (addr: Address?) {}")

	if interaction.Parameters[0].Kind != ParameterKindAddress {
		t.Error("Expected Address parameter kind")
	}

	if !interaction.Parameters[0].Optional {
		t.Error("Expected optional")
	}
}

func TestComplexParameter(t *testing.T) {
	interaction := parseAndBuildInteraction("transaction (addresses: [Address]) {}")

	if interaction.Parameters[0].Kind != ParameterKindArray {
		t.Error("Expected Array parameter kind")
	}

	if interaction.Parameters[0].ArrayParameter == nil {
		t.Error("Expected array element")
	}

	if interaction.Parameters[0].ArrayParameter.Kind != ParameterKindAddress {
		t.Error("Expected Address parameter kind")
	}
}

func parseAndBuildInteraction(code string) *Interaction {
	program, err := parser.ParseProgram(nil, []byte(code), parser.Config{})

	if err != nil {
		panic(err)
	}

	return buildInteraction(program)
}
