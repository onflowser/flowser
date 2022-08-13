// TODO(milestone-3): remove seeds and the concept of "custom" project
export const defaultProjects = [
  {
    id: "emulator",
    name: "Emulator",
    isCustom: false,
    gateway: {
      address: "http://localhost",
      port: 8080,
    },
    emulator: null,
  },
  {
    id: "testnet",
    name: "Testnet",
    isCustom: false,
    startBlockHeight: null, // start data aggregation from last block
    gateway: {
      port: null,
      address: "https://access-testnet.onflow.org",
    },
    emulator: null,
  },
];
