/**
 * Seeds transactions collection
 */
const transactions = [
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
        },
        "createdAt": 1632857534571
    },
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
        },
        "createdAt" : 1632857534571
    },
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
        },
        "createdAt" : 1632857534571
    },
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
        },
    "createdAt" : 1632857534571
    },
];

try {
    db.transactions.insertMany(transactions);
} catch (e) {
    console.error('Can not seed transactions collection');
}
