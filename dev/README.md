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
        "block": {
            "id": "300f74117e6af5d7f6ef247fab36532761f91cc1b1b1c298d094a2cb53ff1bf1",
            "parentId": "af48e16955fe543a6828646d8eb5f38fc48eb7584ba97a158bd29a2390e2cbf1",
            "height": 2,
            "timestamp": "2021-10-01T17:05:28.245Z",
            "collectionGuarantees": [
                {
                    "collectionId": "26189696381e501925e3e76140cf03e2f38db213eb01d3db1963ac71106d8c53",
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
                "blockId": "300f74117e6af5d7f6ef247fab36532761f91cc1b1b1c298d094a2cb53ff1bf1",
                "id": "26189696381e501925e3e76140cf03e2f38db213eb01d3db1963ac71106d8c53",
                "transactionIds": [
                    "d6b543cd5ae4307c741a4ed87ce5077cd23075d633b3732ad843ccd29dd516bf"
                ]
            }
        ],
        "transactions": [
            {
                "id": "d6b543cd5ae4307c741a4ed87ce5077cd23075d633b3732ad843ccd29dd516bf",
                "script": "import HelloWorld from 0xf8d6e0586b0a20c7\n\ntransaction {\n\n  prepare(acct: AuthAccount) {}\n\n  execute {\n    log(HelloWorld.hello())\n  }\n}\n",
                "args": [],
                "referenceBlockId": "af48e16955fe543a6828646d8eb5f38fc48eb7584ba97a158bd29a2390e2cbf1",
                "gasLimit": 1000,
                "proposalKey": {
                    "address": "f8d6e0586b0a20c7",
                    "keyId": 0,
                    "sequenceNumber": 1
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
                        "signature": "b03d848445f1ba652c79bd8f411d5e1c54019bf3893dc02a25f649dae24027c152d97cfde2568ae96dde9eea0e89f5c81972d1e307d7379077e3933219d43b4e"
                    }
                ],
                "status": {
                    "status": 4,
                    "statusCode": 0,
                    "errorMessage": "",
                    "eventsCount": 1
                }
            }
        ],
        "accounts": [
            {
                "address": "0xf8d6e0586b0a20c7",
                "balance": 999999999999400000,
                "code": "",
                "contracts": {
                    "FlowServiceAccount": "import FungibleToken from 0xee82856bf20e2aa6\nimport FlowToken from 0x0ae53cb6e3f42a79\nimport FlowFees from 0xe5a8b7f23e8b548f\nimport FlowStorageFees from 0xf8d6e0586b0a20c7\n\npub contract FlowServiceAccount {\n\n    pub event TransactionFeeUpdated(newFee: UFix64)\n\n    pub event AccountCreationFeeUpdated(newFee: UFix64)\n\n    pub event AccountCreatorAdded(accountCreator: Address)\n\n    pub event AccountCreatorRemoved(accountCreator: Address)\n\n    pub event IsAccountCreationRestrictedUpdated(isRestricted: Bool)\n\n    /// A fixed-rate fee charged to execute a transaction\n    pub var transactionFee: UFix64\n\n    /// A fixed-rate fee charged to create a new account\n    pub var accountCreationFee: UFix64\n\n    /// The list of account addresses that have permission to create accounts\n    access(contract) var accountCreators: {Address: Bool}\n\n    /// Initialize an account with a FlowToken Vault and publish capabilities.\n    pub fun initDefaultToken(_ acct: AuthAccount) {\n        // Create a new FlowToken Vault and save it in storage\n        acct.save(<-FlowToken.createEmptyVault(), to: /storage/flowTokenVault)\n\n        // Create a public capability to the Vault that only exposes\n        // the deposit function through the Receiver interface\n        acct.link<&FlowToken.Vault{FungibleToken.Receiver}>(\n            /public/flowTokenReceiver,\n            target: /storage/flowTokenVault\n        )\n\n        // Create a public capability to the Vault that only exposes\n        // the balance field through the Balance interface\n        acct.link<&FlowToken.Vault{FungibleToken.Balance}>(\n            /public/flowTokenBalance,\n            target: /storage/flowTokenVault\n        )\n    }\n\n    /// Get the default token balance on an account\n    pub fun defaultTokenBalance(_ acct: PublicAccount): UFix64 {\n        let balanceRef = acct\n            .getCapability(/public/flowTokenBalance)\n            .borrow<&FlowToken.Vault{FungibleToken.Balance}>()!\n\n        return balanceRef.balance\n    }\n\n    /// Return a reference to the default token vault on an account\n    pub fun defaultTokenVault(_ acct: AuthAccount): &FlowToken.Vault {\n        return acct.borrow<&FlowToken.Vault>(from: /storage/flowTokenVault)\n            ?? panic(\"Unable to borrow reference to the default token vault\")\n    }\n\n    /// Called when a transaction is submitted to deduct the fee\n    /// from the AuthAccount that submitted it\n    pub fun deductTransactionFee(_ acct: AuthAccount) {\n        if self.transactionFee == UFix64(0) {\n            return\n        }\n\n        let tokenVault = self.defaultTokenVault(acct)\n        let feeVault <- tokenVault.withdraw(amount: self.transactionFee)\n\n        FlowFees.deposit(from: <-feeVault)\n    }\n\n    /// - Deducts the account creation fee from a payer account.\n    /// - Inits the default token.\n    /// - Inits account storage capacity.\n    pub fun setupNewAccount(newAccount: AuthAccount, payer: AuthAccount) {\n        if !FlowServiceAccount.isAccountCreator(payer.address) {\n            panic(\"Account not authorized to create accounts\")\n        }\n\n\n        if self.accountCreationFee < FlowStorageFees.minimumStorageReservation {\n            panic(\"Account creation fees setup incorrectly\")\n        }\n\n        let tokenVault = self.defaultTokenVault(payer)\n        let feeVault <- tokenVault.withdraw(amount: self.accountCreationFee)\n        let storageFeeVault <- (feeVault.withdraw(amount: FlowStorageFees.minimumStorageReservation) as! @FlowToken.Vault)\n        FlowFees.deposit(from: <-feeVault)\n\n        FlowServiceAccount.initDefaultToken(newAccount)\n\n        let vaultRef = FlowServiceAccount.defaultTokenVault(newAccount)\n\n        vaultRef.deposit(from: <-storageFeeVault)\n    }\n\n    /// Returns true if the given address is permitted to create accounts, false otherwise\n    pub fun isAccountCreator(_ address: Address): Bool {\n        // If account creation is not restricted, then anyone can create an account\n        if !self.isAccountCreationRestricted() {\n            return true\n        }\n        return self.accountCreators[address] ?? false\n    }\n\n    /// Is true if new acconts can only be created by approved accounts `self.accountCreators`\n    pub fun isAccountCreationRestricted(): Bool {\n        return self.account.copy<Bool>(from: /storage/isAccountCreationRestricted) ?? false\n    }\n\n    // Authorization resource to change the fields of the contract\n    /// Returns all addresses permitted to create accounts\n    pub fun getAccountCreators(): [Address] {\n        return self.accountCreators.keys\n    }\n\n    /// Authorization resource to change the fields of the contract\n    pub resource Administrator {\n\n        /// Sets the transaction fee\n        pub fun setTransactionFee(_ newFee: UFix64) {\n            FlowServiceAccount.transactionFee = newFee\n            emit TransactionFeeUpdated(newFee: newFee)\n        }\n\n        /// Sets the account creation fee\n        pub fun setAccountCreationFee(_ newFee: UFix64) {\n            FlowServiceAccount.accountCreationFee = newFee\n            emit AccountCreationFeeUpdated(newFee: newFee)\n        }\n\n        /// Adds an account address as an authorized account creator\n        pub fun addAccountCreator(_ accountCreator: Address) {\n            FlowServiceAccount.accountCreators[accountCreator] = true\n            emit AccountCreatorAdded(accountCreator: accountCreator)\n        }\n\n        /// Removes an account address as an authorized account creator\n        pub fun removeAccountCreator(_ accountCreator: Address) {\n            FlowServiceAccount.accountCreators.remove(key: accountCreator)\n            emit AccountCreatorRemoved(accountCreator: accountCreator)\n        }\n\n         pub fun setIsAccountCreationRestricted(_ enabled: Bool) {\n            let path = /storage/isAccountCreationRestricted\n            let oldValue = FlowServiceAccount.account.load<Bool>(from: path)\n            FlowServiceAccount.account.save<Bool>(enabled, to: path)\n            if enabled != oldValue {\n                emit IsAccountCreationRestrictedUpdated(isRestricted: enabled)\n            }\n        }\n    }\n\n    init() {\n        self.transactionFee = 0.0\n        self.accountCreationFee = 0.0\n\n        self.accountCreators = {}\n\n        let admin <- create Administrator()\n        admin.addAccountCreator(self.account.address)\n\n        self.account.save(<-admin, to: /storage/flowServiceAdmin)\n    }\n}\n",
                    "FlowStorageFees": "/*\n * The FlowStorageFees smart contract\n *\n * An account's storage capacity determines up to how much storage on chain it can use. \n * A storage capacity is calculated by multiplying the amount of reserved flow with `StorageFee.storageMegaBytesPerReservedFLOW`\n * The minimum amount of flow tokens reserved for storage capacity is `FlowStorageFees.minimumStorageReservation` this is paid during account creation, by the creator.\n * \n * At the end of all transactions, any account that had any value changed in their storage \n * has their storage capacity checked against their storage used and their main flow token vault against the minimum reservation.\n * If any account fails this check the transaction wil fail.\n * \n * An account moving/deleting its `FlowToken.Vault` resource will result \n * in the transaction failing because the account will have no storage capacity.\n * \n */\n\nimport FungibleToken from 0xee82856bf20e2aa6\nimport FlowToken from 0x0ae53cb6e3f42a79\n\npub contract FlowStorageFees {\n\n    // Emitted when the amount of storage capacity an account has per reserved Flow token changes\n    pub event StorageMegaBytesPerReservedFLOWChanged(_ storageMegaBytesPerReservedFLOW: UFix64)\n\n    // Emitted when the minimum amount of Flow tokens that an account needs to have reserved for storage capacity changes.\n    pub event MinimumStorageReservationChanged(_ minimumStorageReservation: UFix64)\n\n    // Defines how much storage capacity every account has per reserved Flow token.\n    // definition is written per unit of flow instead of the inverse, \n    // so there is no loss of precision calculating storage from flow, \n    // but there is loss of precision when calculating flow per storage.\n    pub var storageMegaBytesPerReservedFLOW: UFix64\n\n    // Defines the minimum amount of Flow tokens that every account needs to have reserved for storage capacity.\n    // If an account has less then this amount reserved by the end of any transaction it participated in, the transaction will fail.\n    pub var minimumStorageReservation: UFix64\n\n    // An administrator resource that can change the parameters of the FlowStorageFees smart contract.\n    pub resource Administrator {\n\n        // Changes the amount of storage capacity an account has per accounts' reserved storage FLOW.\n        pub fun setStorageMegaBytesPerReservedFLOW(_ storageMegaBytesPerReservedFLOW: UFix64) {\n            if FlowStorageFees.storageMegaBytesPerReservedFLOW == storageMegaBytesPerReservedFLOW {\n              return\n            }\n            FlowStorageFees.storageMegaBytesPerReservedFLOW = storageMegaBytesPerReservedFLOW\n            emit StorageMegaBytesPerReservedFLOWChanged(storageMegaBytesPerReservedFLOW)\n        }\n\n        // Changes the minimum amount of FLOW an account has to have reserved.\n        pub fun setMinimumStorageReservation(_ minimumStorageReservation: UFix64) {\n            if FlowStorageFees.minimumStorageReservation == minimumStorageReservation {\n              return\n            }\n            FlowStorageFees.minimumStorageReservation = minimumStorageReservation\n            emit MinimumStorageReservationChanged(minimumStorageReservation)\n        }\n\n        access(contract) init(){}\n    }\n\n    // Returns megabytes\n    pub fun calculateAccountCapacity(_ accountAddress: Address): UFix64 {\n        let balanceRef = getAccount(accountAddress)\n            .getCapability<&FlowToken.Vault{FungibleToken.Balance}>(/public/flowTokenBalance)!\n            .borrow() ?? panic(\"Could not borrow FLOW balance capability\")\n\n        // get address token balance\n        if balanceRef.balance < self.minimumStorageReservation {\n            // if < then minimum return 0\n            return 0.0\n        } else {\n            // return balance multiplied with megabytes per flow \n            return balanceRef.balance * self.storageMegaBytesPerReservedFLOW\n        }\n    }\n\n    // Amount in Flow tokens\n    // Returns megabytes\n    pub fun flowToStorageCapacity(_ amount: UFix64): UFix64 {\n        return amount * FlowStorageFees.storageMegaBytesPerReservedFLOW\n    }\n\n    // Amount in megabytes\n    // Returns Flow tokens\n    pub fun storageCapacityToFlow(_ amount: UFix64): UFix64 {\n        if FlowStorageFees.storageMegaBytesPerReservedFLOW == 0.0 as UFix64 {\n            return 0.0 as UFix64\n        }\n        // possible loss of precision\n        // putting the result back into `flowToStorageCapacity` might not yield the same result\n        return amount / FlowStorageFees.storageMegaBytesPerReservedFLOW\n    }\n\n    // converts storage used from UInt64 Bytes to UFix64 Megabytes.\n    pub fun convertUInt64StorageBytesToUFix64Megabytes(_ storage: UInt64): UFix64 {\n        // safe convert UInt64 to UFix64 (without overflow)\n        let f = UFix64(storage % 100000000 as UInt64) * 0.00000001 as UFix64 + UFix64(storage / 100000000 as UInt64)\n        // decimal point correction. Megabytes to bytes have a conversion of 10^-6 while UFix64 minimum value is 10^-8\n        let storageMb = f * 100.0 as UFix64\n        return storageMb\n    }\n\n    // Gets \"available\" balance of an account\n    // The available balance is its default token balance minus what is reserved for storage.\n    pub fun defaultTokenAvailableBalance(_ accountAddress: Address): UFix64 {\n        //get balance of account\n        let acct = getAccount(accountAddress)\n        let balanceRef = acct\n            .getCapability(/public/flowTokenBalance)\n            .borrow<&FlowToken.Vault{FungibleToken.Balance}>()!\n        let balance = balanceRef.balance\n\n        // get how much should be reserved for storage\n        var reserved = self.storageCapacityToFlow(self.convertUInt64StorageBytesToUFix64Megabytes(acct.storageUsed))\n        // at least self.minimumStorageReservation should be reserved\n        if reserved < self.minimumStorageReservation {\n            reserved = self.minimumStorageReservation\n        }\n\n        // balance could be less that what the account needs to have reserved for storage. In that case return 0.\n        if reserved > balance {\n            return 0.0\n        }\n        \n        return balance - reserved\n    }\n\n    init() {\n        self.storageMegaBytesPerReservedFLOW = 1.0 // 1 Mb per 1 Flow token\n        self.minimumStorageReservation = 0.0 // or 0 kb of minimum storage reservation\n\n        let admin <- create Administrator()\n        self.account.save(<-admin, to: /storage/storageFeesAdmin)\n    }\n}",
                    "HelloWorld": "// HelloWorld.cdc\n//\n// Welcome to Cadence! This is one of the simplest programs you can deploy on Flow.\n//\n// The HelloWorld contract contains a single string field and a public getter function.\n//\n// Follow the \"Hello, World!\" tutorial to learn more: https://docs.onflow.org/docs/hello-world\n\npub contract HelloWorld {\n\n    // Declare a public field of type String.\n    //\n    // All fields must be initialized in the init() function.\n    pub let greeting: String\n\n    pub event Greet(x: String)\n\n    // The init() function is required if the contract contains any fields.\n    init() {\n        self.greeting = \"Hello, World!\"\n    }\n\n    // Public function that returns our friendly greeting!\n    pub fun hello(): String {\n        emit Greet(x: self.greeting)\n        return self.greeting\n    }\n}\n"
                },
                "keys": [
                    {
                        "index": 0,
                        "publicKey": "ee69a34c1a8c4fdc5d55bd1a78174ef1fd5f579243ecb032672cbb23845973d4b8c393078807b820dcf6a4573dbca61dcfffc2ceca1af3d2bc03eac31fdbe67c",
                        "signAlgo": 2,
                        "hashAlgo": 3,
                        "weight": 1000,
                        "sequenceNumber": 8,
                        "revoked": false
                    }
                ]
            }
        ],
        "events": [
            [
                {
                    "transactionId": "d6b543cd5ae4307c741a4ed87ce5077cd23075d633b3732ad843ccd29dd516bf",
                    "type": "A.f8d6e0586b0a20c7.HelloWorld.Greet",
                    "transactionIndex": 1,
                    "eventIndex": 0,
                    "data": {
                        "x": "Hello, World!"
                    }
                }
            ]
        ]
    }
    ```
