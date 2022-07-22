import { env } from "../../config";

export const defaultEmulatorFlags = {
  name: "New Emulator Configuration",
  verboseLogging: true,
  httpServerPort: env.FLOW_EMULATOR_HTTP_PORT,
  persist: false,
  rpcServerPort: 3569,
  blockTime: 0,
  serviceAddress: env.FLOW_ACCOUNT_ADDRESS, // this is the same for all emulators
  servicePrivateKey: env.FLOW_ACCOUNT_PRIVATE_KEY,
  servicePublicKey: env.FLOW_ACCOUNT_PUBLIC_KEY,
  databasePath: "./flowdb",
  tokenSupply: "1000000000.0",
  transactionExpiry: 10,
  storagePerFlow: "",
  minAccountBalance: "",
  transactionMaxGasLimit: 9999,
  scriptGasLimit: 100000,
  serviceSignatureAlgorithm: "ECDSA_P256",
  serviceHashAlgorithm: "SHA3_256",
  storageLimit: true,
  transactionFees: false,
  simpleAddresses: false,
  numberOfInitialAccounts: 0,
};
