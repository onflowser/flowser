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
	"os"
	"time"

	"log"
	"net/http"
	"strings"

	"github.com/dgraph-io/badger/v2"
	"github.com/onflow/cadence/runtime/interpreter"
)

var storageDb *badger.DB

type Config struct {
	DbPath string
	Port   string
}

func main() {
	config := getConfig()

	fmt.Printf("Running storage server (dbPath: %s, port: %s)\n", config.DbPath, config.Port)

	var err error
	storageDb, err = badger.Open(badger.DefaultOptions(config.DbPath).WithBypassLockGuard(true))
	if err != nil {
		panic(err)
	}
	defer storageDb.Close()

	http.HandleFunc("/storage", storageHandler)
	http.HandleFunc("/status", func(w http.ResponseWriter, r *http.Request) {
		statusHandler(w, r, config)
	})

	go listenOnServerStarted(config)
	if err := http.ListenAndServe(":"+config.Port, nil); err != nil {
		fmt.Println("Storage server error: ", err)
	}
}

func listenOnServerStarted(config Config) {
	for {
		time.Sleep(time.Millisecond * 50)

		log.Println("Checking if started...")
		resp, err := http.Get("http://localhost:" + config.Port + "/status")
		if err != nil {
			fmt.Println("Storage server error: ", err)
			continue
		}
		resp.Body.Close()
		if resp.StatusCode != http.StatusOK {
			fmt.Println("Checking storage server response:", resp.StatusCode)
			continue
		}

		// Reached this point: server is up and running!
		break
	}
	fmt.Println("Storage server started")
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

func statusHandler(w http.ResponseWriter, req *http.Request, config Config) {
	w.Header().Set("Content-Type", "application/json")
	jsonStorage, err := json.Marshal(config)
	if err != nil {
		log.Fatalf("Error happened in JSON marshal. Err: %s", err)
	}
	w.Write(jsonStorage)
	return
}

func getConfig() Config {
	config := Config{}

	dbPath, ok := os.LookupEnv("FLOW_DBPATH")
	if ok {
		config.DbPath = dbPath
	} else {
		config.DbPath = "./flowdb"
	}

	port, ok := os.LookupEnv("FLOW_STORAGE_SERVER_PORT")
	if ok {
		config.Port = port
	} else {
		config.Port = "8888"
	}

	return config
}
