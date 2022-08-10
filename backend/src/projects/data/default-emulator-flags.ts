import { env } from "../../config";
import {
  Emulator,
  HashAlgorithm,
  Project,
  SignatureAlgorithm,
} from "@flowser/types/generated/entities/projects";

export const defaultEmulatorFlags = Project.fromPartial({
  name: "New Project",
  emulator: Emulator.fromPartial({
    verboseLogging: true,
    httpServerPort: env.FLOW_EMULATOR_HTTP_PORT,
    persist: false,
    rpcServerPort: 3569,
    blockTime: 0,
    servicePrivateKey: env.FLOW_ACCOUNT_PRIVATE_KEY,
    servicePublicKey: env.FLOW_ACCOUNT_PUBLIC_KEY,
    databasePath: "./flowdb",
    tokenSupply: 1000000000,
    transactionExpiry: 10,
    storagePerFlow: undefined,
    minAccountBalance: undefined,
    transactionMaxGasLimit: 9999,
    scriptGasLimit: 100000,
    serviceSignatureAlgorithm: SignatureAlgorithm.ECDSA_P256,
    serviceHashAlgorithm: HashAlgorithm.SHA3_256,
    storageLimit: true,
    transactionFees: false,
    simpleAddresses: false,
    numberOfInitialAccounts: 0,
  }),
});
