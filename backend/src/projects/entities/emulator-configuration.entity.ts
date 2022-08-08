import { Emulator } from "@flowser/types/generated/entities/projects";

export class EmulatorConfigurationEntity {
  verboseLogging: boolean;

  httpServerPort: number;

  rpcServerPort: number;

  blockTime: number;

  servicePrivateKey: string;

  servicePublicKey: string;

  databasePath: string;

  tokenSupply: number;

  transactionExpiry: number;

  storagePerFlow: number;

  minAccountBalance: number;

  transactionMaxGasLimit: number;

  scriptGasLimit: number;

  serviceSignatureAlgorithm: string;

  serviceHashAlgorithm: string;

  storageLimit: boolean;

  transactionFees: boolean;

  persist: boolean;

  simpleAddresses: boolean;

  numberOfInitialAccounts: number;

  toProto() {
    return Emulator.fromPartial({
      verboseLogging: this.verboseLogging,
      httpServerPort: this.httpServerPort,
      rpcServerPort: this.rpcServerPort,
      blockTime: this.blockTime,
      servicePrivateKey: this.servicePrivateKey,
      servicePublicKey: this.servicePublicKey,
      databasePath: this.databasePath,
      tokenSupply: this.tokenSupply,
      transactionExpiry: this.transactionExpiry,
      storagePerFlow: this.storagePerFlow,
      minAccountBalance: this.minAccountBalance,
      transactionMaxGasLimit: this.transactionMaxGasLimit,
      scriptGasLimit: this.scriptGasLimit,
      serviceSignatureAlgorithm: this.serviceSignatureAlgorithm,
      serviceHashAlgorithm: this.serviceHashAlgorithm,
      storageLimit: this.storageLimit,
      transactionFees: this.transactionFees,
      persist: this.persist,
      simpleAddresses: this.simpleAddresses,
      numberOfInitialAccounts: this.numberOfInitialAccounts,
    });
  }
}
