package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"os"
	"strings"

	"github.com/onflowser/flowser/v2/internal/misc"
)

func main() {
	userProvidedArgs := os.Args[1:]

	if len(userProvidedArgs) == 0 {
		panic("expected command name")
	}

	command := userProvidedArgs[0]
	commandArgs := userProvidedArgs[1:]

	switch command {
	case "get-address-index":
		execGetAddressIndex(commandArgs)
	case "get-parsed-interaction":
		execGetParsedInteraction(commandArgs)
	default:
		panic("unrecognised command")
	}
}

func execGetAddressIndex(args []string) {
	if len(args) != 2 {
		panic("invalid number of arguments, expected 2")
	}

	chainID := args[0]
	address := args[1]

	index, err := misc.GetAddressIndex(chainID, address)

	if err != nil {
		panic(err)
	}

	os.Stdout.Write([]byte(fmt.Sprint(index)))
}

func execGetParsedInteraction(args []string) {
	reader := bufio.NewReader(os.Stdin)
	nullTerminatedCode, err := reader.ReadString(byte(0))
	if err != nil {
		panic(err)
	}

	code := []byte(strings.TrimSuffix(nullTerminatedCode, "\x00"))

	response := misc.ParseInteraction(code)

	err = json.NewEncoder(os.Stdout).Encode(response)
	if err != nil {
		panic(err)
	}
}
