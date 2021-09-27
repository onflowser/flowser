# Flowser dev demos

To generate and fetch sample data from local emulator follow the bellow steps.

1. **Start your emulator in `/dev` directory**
    ```shell
   flow emulator
   ```
   
    Sample output:
    ```shell
INFO[0000] ⚙️   Using service account 0xf8d6e0586b0a20c7  serviceAddress=f8d6e0586b0a20c7 serviceHashAlgo=SHA3_256 servicePrivKey=feacb599c6070f0a5d32ff834d57467f83646908a68c17a1fb7aad918db873d2 servicePubKey=ee69a34c1a8c4fdc5d55bd1a78174ef1fd5f579243ecb032672cbb23845973d4b8c393078807b820dcf6a4573dbca61dcfffc2ceca1af3d2bc03eac31fdbe67c serviceSigAlgo=ECDSA_P256
INFO[0000] 📜  Flow contracts                             FlowFees=0xe5a8b7f23e8b548f FlowServiceAccount=0xf8d6e0586b0a20c7 FlowStorageFees=0xf8d6e0586b0a20c7 FlowToken=0x0ae53cb6e3f42a79 FungibleToken=0xee82856bf20e2aa6
INFO[0000] 🌱  Starting gRPC server on port 3569          port=3569
INFO[0000] 🌱  Starting HTTP server on port 8080          port=8080
    ```
2. **Deploy "HelloWorld" contract to test account**
    ```shell
   flow accounts add-contract HelloWorld transactions/HelloWorld.cdc
    ```
   
    Sample output:
    ```shell
Transaction ID: b7cfc706b4f554a5d0ade9bec06f6436e02f319f3c3f8a0c4da2a447cafb1661
Contract 'HelloWorld' deployed to the account 'f8d6e0586b0a20c7'.

Address	 0xf8d6e0586b0a20c7
Balance	 9999999999.99700000
Keys	 1

Key 0	Public Key		 ee69a34c1a8c4fdc5d55bd1a78174ef1fd5f579243ecb032672cbb23845973d4b8c393078807b820dcf6a4573dbca61dcfffc2ceca1af3d2bc03eac31fdbe67c
Weight			 1000
Signature Algorithm	 ECDSA_P256
Hash Algorithm		 SHA3_256
Revoked 		 false
Sequence Number 	 1
Index 			 0

Contracts Deployed: 3
Contract: 'FlowServiceAccount'
Contract: 'FlowStorageFees'
Contract: 'HelloWorld'


Contracts (hidden, use --include contracts)
    ```
3. **Execute "HelloWorld" transaction**

    ```shell
   flow transactions send transactions/HelloWorld.cdc HelloWorld
    ```
   
    Sample output:
    ```shell
Transaction ID: 71be5c54993af5104552f7d5bb6b2a9b5831480cf0ad29b00a5c8d3c6e39b342

❌ Transaction Error
execution error code 1101: [Error Code: 1101] cadence runtime error Execution failed:
error: [Error Code: 1054] location (f8d6e0586b0a20c7) is not a valid location: expecting an AddressLocation, but other location types are passed
--> f8d6e0586b0a20c7

error: cannot find variable in this scope: `HelloWorld`
--> 71be5c54993af5104552f7d5bb6b2a9b5831480cf0ad29b00a5c8d3c6e39b342:8:8
|
8 |     log(HelloWorld.hello())
|         ^^^^^^^^^^ not found in this scope



Status		✅ SEALED
ID		71be5c54993af5104552f7d5bb6b2a9b5831480cf0ad29b00a5c8d3c6e39b342
Payer		f8d6e0586b0a20c7
Authorizers	[f8d6e0586b0a20c7]

Proposal Key:
Address	f8d6e0586b0a20c7
Index	0
Sequence	2

No Payload Signatures

Envelope Signature 0: f8d6e0586b0a20c7
Signatures (minimized, use --include signatures)

Events:	 None


Code (hidden, use --include code)

Payload (hidden, use --include payload)
    ```

4. **Query blockchain data with `data-aggregator.js`**
    
    ```shell
   node data-aggregator.js <from-block-height> <to-block-height>
    ```
   
   or
    
     ```shell
   node data-aggregator.js <block-height>
    ```
   
    > TIP: You can get the latest block height with `flow blocks get latest` command

    Sample output:
    ```json
    [
    {
        "block": {
            "id": "86674c24865aa6be9c2e77c23099703cdb74a76348d400c6422c239331539fbd",
            "parentId": "789b8969c0f03b85037297ee49e05a96fe15ec35e5b7f73aa72e9cc825155d8e",
            "height": 2,
            "timestamp": "2021-09-27T22:09:22.732Z",
            "collectionGuarantees": [
                {
                    "collectionId": "18b34f06516c83f5655e6f1961635ba55d6278c6d9cdb90ed2bff9df37d2cf4c",
                    "signatures": [
                        ""
                    ]
                }
            ],
            "blockSeals": [],
            "signatures": [
                ""
            ]
        },
        "collections": [
            {
                "id": "18b34f06516c83f5655e6f1961635ba55d6278c6d9cdb90ed2bff9df37d2cf4c",
                "transactionIds": [
                    "8cf04984291824f6567b6cdb252a2d1d37369ff6c38d7ac1e992c879d966d3ee"
                ]
            }
        ],
        "transactions": [
            [
                {
                    "data": {
                        "script": "\n\ttransaction(name: String, code: String ) {\n\t\tprepare(signer: AuthAccount) {\n\t\t\tsigner.contracts.add(name: name, code: code.decodeHex() )\n\t\t}\n\t}",
                        "args": [
                            {
                                "type": "String",
                                "value": "HelloWorld"
                            },
                            {
                                "type": "String",
                                "value": "696d706f72742048656c6c6f576f726c642066726f6d20307830310a0a7472616e73616374696f6e207b0a0a20207072657061726528616363743a20417574684163636f756e7429207b7d0a0a202065786563757465207b0a202020206c6f672848656c6c6f576f726c642e68656c6c6f2829290a20207d0a7d0a0a"
                            }
                        ],
                        "referenceBlockId": "789b8969c0f03b85037297ee49e05a96fe15ec35e5b7f73aa72e9cc825155d8e",
                        "gasLimit": 9999,
                        "proposalKey": {
                            "address": "f8d6e0586b0a20c7",
                            "keyId": 0,
                            "sequenceNumber": 0
                        },
                        "payer": "f8d6e0586b0a20c7",
                        "authorizers": [
                            "f8d6e0586b0a20c7"
                        ],
                        "payloadSignatures": [],
                        "envelopeSignatures": [
                            {
                                "address": "f8d6e0586b0a20c7",
                                "keyId": 0,
                                "signature": "017c6a35cea5fe166b331f45635a705c972f33046594befbf65bef6d21f13ca1af4b071b065f6b7dc0236dc7a90b9cc8844175c79296daaff0213750871f1473"
                            }
                        ]
                    },
                    "status": {
                        "status": 4,
                        "statusCode": 1,
                        "errorMessage": "execution error code 1101: [Error Code: 1101] cadence runtime error Execution failed:\nerror: cannot deploy invalid contract\n --> 8cf04984291824f6567b6cdb252a2d1d37369ff6c38d7ac1e992c879d966d3ee:4:3\n  |\n4 | \t\t\tsigner.contracts.add(name: name, code: code.decodeHex() )\n  |    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^\n\nerror: cannot find declaration `HelloWorld` in `0000000000000001.HelloWorld`\n --> f8d6e0586b0a20c7.HelloWorld:1:7\n  |\n1 | import HelloWorld from 0x01\n  |        ^^^^^^^^^^ available exported declarations are:\n\n\nerror: transaction declarations are not valid at the top-level\n --> f8d6e0586b0a20c7.HelloWorld:3:0\n  |\n3 | transaction {\n  | ^\n",
                        "events": []
                    }
                }
            ]
        ]
    }
]
    ```
