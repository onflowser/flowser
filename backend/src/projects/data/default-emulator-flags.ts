import { Emulator, Project } from "@flowser/types/generated/entities/projects";
import {
  HashAlgorithm,
  SignatureAlgorithm,
} from "@flowser/types/generated/entities/common";

export const defaultEmulatorFlags = Project.fromPartial({
  name: "New Project",
  emulator: Emulator.fromPartial({
    verboseLogging: true,
    restServerPort: 8888,
    adminServerPort: 8080,
    persist: false,
    performInit: false,
    withContracts: false,
    grpcServerPort: 3569,
    blockTime: 0,
    servicePrivateKey: undefined,
    servicePublicKey: undefined,
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
  }),
});
