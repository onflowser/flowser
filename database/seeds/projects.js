/**
 * Seeds projects collection, add default 'Quick start' project
 */

const quickStartProject = [
    {
        id: "emulator", // special id
        name: 'Emulator',
        isCustom: false,
        gateway: {
            // gateway port is defined at run-time with USER_MANAGED_EMULATOR_PORT env variable
            address: 'http://host.docker.internal',
        },
        emulator: null
    },
    {
        id: "testnet",
        name: "Testnet",
        isCustom: false,
        startBlockHeight: null, // start data aggregation from last block
        gateway: {
            port: null,
            address: "https://access-testnet.onflow.org"
        },
        emulator: null
    }
];

try {
    db.projects.insertMany(quickStartProject);
} catch (e) {
    console.error('Can not seed projects collection');
}
