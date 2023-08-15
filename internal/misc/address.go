package misc

import (
	"errors"

	"github.com/onflow/flow-go/model/flow"
)

func GetAddressIndex(targetChainID string, hexAddress string) (uint64, error) {
	chainID, err := getChainID(targetChainID)

	if err != nil {
		return 0, err
	}

	flowAddress := flow.HexToAddress(hexAddress)

	index, err := chainID.Chain().IndexFromAddress(flowAddress)

	if err != nil {
		return 0, err
	}

	return index, nil
}

func getChainID(targetChainID string) (flow.ChainID, error) {
	chainIDs := []flow.ChainID{
		flow.Mainnet,
		flow.Testnet,
		flow.Emulator,
		flow.Sandboxnet,
	}

	for _, chainID := range chainIDs {
		if chainID.String() == targetChainID {
			return chainID, nil
		}
	}

	return "", errors.New("chain ID not found")
}
