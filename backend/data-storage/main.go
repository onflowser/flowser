/**
This Go script has been adapted from @bluesign script found here:
https://gist.github.com/bluesign/df24b31a61bf4cd11f88efb6edd78925
Credits go to him.
*/

package main

import (
	"bytes"
	"encoding/binary"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net"
	"os"

	"log"
	"net/http"
	"strings"

	"github.com/dgraph-io/badger/v2"
	"github.com/onflow/cadence/runtime/interpreter"
)

var storageDb *badger.DB

func main() {
	dbPath, ok := os.LookupEnv("FLOW_DBPATH")
	if !ok {
		dbPath = "./flowdb"
	}

	var err error
	storageDb, err = badger.Open(badger.DefaultOptions(dbPath).WithBypassLockGuard(true))
	if err != nil {
		panic(err)
	}
	defer storageDb.Close()

	// report error if port used
	if _, err := net.Listen("tcp", ":8888"); err != nil {
		log.Fatal("Storage server error: ", err)
	}

	done := make(chan bool)
	http.HandleFunc("/storage", storageHandler)
	// TODO: handle errors returned from ListenAndServe
	go http.ListenAndServe(":8888", nil)
	log.Println("Storage server started") // successfully started
	<-done
}

func analyseStorage(db *badger.DB) map[string][]interface{} {
	txn := db.NewTransaction(false)
	defer txn.Discard()

	iopt := badger.DefaultIteratorOptions
	iopt.Prefix = []byte("")
	iopt.PrefetchValues = false
	iopt.Reverse = true
	iopt.AllVersions = false
	it := txn.NewIterator(iopt)
	defer it.Close()

	seen := make(map[string]struct{})
	storage := make(map[string][]interface{})

	for it.Rewind(); it.Valid(); it.Next() {
		item := it.Item()
		key := item.Key()

		location := bytes.Index(key, []byte("ledger_value_by_block_height_register_id"))
		if location > -1 {

			addressBytes := key[location+41 : location+41+16]
			address := string(addressBytes)

			locationBytes := key[location+41+17:]
			location := string(locationBytes)

			parts := strings.Split(location, "/")
			if len(parts) < 2 {
				continue
			}
			ledgerValueKey := strings.Split(parts[1], "-")

			registerIdBytes, _ := hex.DecodeString(ledgerValueKey[0])
			blockHeightBytes, _ := hex.DecodeString(ledgerValueKey[1])
			blockHeight := binary.BigEndian.Uint64(blockHeightBytes[8:])
			sepLocation := bytes.Index(registerIdBytes, []byte{31})

			if sepLocation < 0 {
				continue
			}
			registerIdBytes[sepLocation] = '/'
			name := string(registerIdBytes)
			if !strings.Contains(name, "storage") {
				continue
			}

			_, ok := seen[fmt.Sprintf("%s_%s", address, name)]
			if ok {
				continue
			}
			seen[fmt.Sprintf("%s_%s", address, name)] = struct{}{}
			item.Value(func(val []byte) error {
				decoded, _ := interpreter.DecodeValue(val[5:], nil, nil, 4, nil)

				storage[address] = append(storage[address], map[string]interface{}{
					"name":        name,
					"value":       decoded.RecursiveString(interpreter.SeenReferences{}),
					"blockHeight": blockHeight,
				})

				return nil
			})
		}

	}

	return storage
}

func storageHandler(w http.ResponseWriter, req *http.Request) {
	storage := analyseStorage(storageDb)

	w.Header().Set("Content-Type", "application/json")
	jsonStorage, err := json.Marshal(storage)
	if err != nil {
		log.Fatalf("Error happened in JSON marshal. Err: %s", err)
	}
	w.Write(jsonStorage)
	return
}
