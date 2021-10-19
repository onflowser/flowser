/**
 * Seeds projects collection, add default 'Quick start' project
 */

const emulator = [
    {
        id: "emulator",
        name: 'Emulator',
        pingable: false,
        gateway: {
            port: 8080,
            address: 'http://host.docker.internal',
        },
        emulator: {
            verboseLogging: true,
            httpServerPort: '8080',
            persist: false,
            rpcServerPort: '3569',
            blockTime: '0',
            servicePrivateKey: '',
            servicePublicKey: '',
            databasePath: './flowdb',
            tokenSupply: 1000000000.0,
            transactionExpiry: '10',
            storagePerFlow: '',
            minAccountBalance: '',
            transactionMaxGasLimit: '9999',
            scriptGasLimit: '100000',
            serviceSignatureAlgorithm: 'ECDSA_P256',
            serviceHashAlgorithm: 'SHA3_256',
            storageLimit: true,
            transactionFees: false,
            simpleAddresses: false,
            numberOfInitialAccounts: '',
        }
    }
];

try {
    db.projects.insertMany(emulator);
} catch (e) {
    console.error('Can not seed projects collection');
}
