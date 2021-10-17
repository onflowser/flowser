export class EmulatorConfigurationDto {
  verboseLogging: boolean;
  persist: boolean;
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
  numberOfInitialAccounts: number;
}
