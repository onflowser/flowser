export const defaultProjects = [
  {
    id: "emulator", // special id
    name: "Emulator",
    isCustom: false,
    gateway: {
      // TODO: extract this to env variable to support docker/non-docker environments
      // gateway port is defined at run-time with USER_MANAGED_EMULATOR_PORT env variable
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
