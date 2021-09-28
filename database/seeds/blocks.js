/**
 * Seeds blocks collection
 */
const blocks = [
    {
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
    {
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
    {
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
    {
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
    {
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
    }
]
try {
    db.blocks.insertMany(blocks);
} catch (e) {
    console.error('Can not seed blocks collection');
}
