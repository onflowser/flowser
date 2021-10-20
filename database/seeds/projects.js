/**
 * Seeds projects collection, add default 'Quick start' project
 */

const quickStartProject = [
    {
        id: "emulator",
        name: 'Emulator',
        isCustom: false,
        gateway: {
            port: 8080,
            address: 'http://host.docker.internal',
        },
        emulator: null
    },
    {
        id: "testnet",
        name: "Testnet",
        gateway: {
            port: 443,
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
