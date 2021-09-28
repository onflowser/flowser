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
   flow accounts add-contract HelloWorld contracts/HelloWorld.cdc
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
    Transaction ID: b4cd56e49c47800fea06866126a09abc5fb2c3c27f26850363b06c4f82e37124

   Status		✅ SEALED
   ID		b4cd56e49c47800fea06866126a09abc5fb2c3c27f26850363b06c4f82e37124
   Payer		f8d6e0586b0a20c7
   Authorizers	[f8d6e0586b0a20c7]

   Proposal Key:
   Address	f8d6e0586b0a20c7
   Index	0
   Sequence	1

   No Payload Signatures

   Envelope Signature 0: f8d6e0586b0a20c7
   Signatures (minimized, use --include signatures)

   Events:		 
   Index	0
   Type	A.f8d6e0586b0a20c7.HelloWorld.Greet
   Tx ID	b4cd56e49c47800fea06866126a09abc5fb2c3c27f26850363b06c4f82e37124
   Values
   - x (String): "Hello, World!"



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
    {
      "block":{
        "id":"4943cf52542ee6788eee40002d258eee0691357e6ea418dacc647a0070a175e1",
        "parentId":"5f7c8cd9d64271418f5be1b18a7746cab083e051262527935854c06b93e772cc",
        "height":3,
        "timestamp":"2021-09-28T21:14:05.839Z",
        "collectionGuarantees":[
          {
            "collectionId":"3f36bf9be61008c11a5508fb5e0e295d8d57c2845d04c5af53393cb6c6ee2516",
            "signatures":[
              ""
            ]
          }
        ],
        "blockSeals":[
          
        ],
        "signatures":[
          ""
        ]
      },
      "collections":[
        {
          "blockId":"4943cf52542ee6788eee40002d258eee0691357e6ea418dacc647a0070a175e1",
          "id":"3f36bf9be61008c11a5508fb5e0e295d8d57c2845d04c5af53393cb6c6ee2516",
          "transactionIds":[
            "b4cd56e49c47800fea06866126a09abc5fb2c3c27f26850363b06c4f82e37124"
          ]
        }
      ],
      "transactions":[
        {
          "collectionId":"3f36bf9be61008c11a5508fb5e0e295d8d57c2845d04c5af53393cb6c6ee2516",
          "data":{
            "script":"import HelloWorld from 0xf8d6e0586b0a20c7\n\ntransaction {\n\n  prepare(acct: AuthAccount) {}\n\n  execute {\n    log(HelloWorld.hello())\n  }\n}\n",
            "args":[
              
            ],
            "referenceBlockId":"5f7c8cd9d64271418f5be1b18a7746cab083e051262527935854c06b93e772cc",
            "gasLimit":1000,
            "proposalKey":{
              "address":"f8d6e0586b0a20c7",
              "keyId":0,
              "sequenceNumber":1
            },
            "payer":"f8d6e0586b0a20c7",
            "authorizers":[
              "f8d6e0586b0a20c7"
            ],
            "payloadSignatures":[
              
            ],
            "envelopeSignatures":[
              {
                "address":"f8d6e0586b0a20c7",
                "keyId":0,
                "signature":"bf61780e52946b692e3854760c9dcb281fca052bf285b7431a0e6de9f25bcd5bbc146a8c5ca8ec01221f7b35794607adf5649a2152bed1783b70362aff62ad8d"
              }
            ]
          },
          "status":{
            "status":4,
            "statusCode":0,
            "errorMessage":"",
            "events":[
              {
                "type":"A.f8d6e0586b0a20c7.HelloWorld.Greet",
                "transactionId":"b4cd56e49c47800fea06866126a09abc5fb2c3c27f26850363b06c4f82e37124",
                "transactionIndex":1,
                "eventIndex":0,
                "data":{
                  "x":"Hello, World!"
                }
              }
            ]
          }
        }
      ]
    }
    ```
