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
      address: 'http://localhost',
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
  // TODO: add support for mainnet
];

try {
  db.projects.insertMany(quickStartProject);
} catch (e) {
  console.error('Can not seed projects collection');
}
