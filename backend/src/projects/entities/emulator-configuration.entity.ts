import { Column, Entity } from "typeorm";

@Entity()
export class EmulatorConfigurationEntity {
  @Column()
  verboseLogging: boolean;

  @Column()
  httpServerPort: number;

  @Column()
  rpcServerPort: number;

  @Column()
  blockTime: number;

  @Column()
  servicePrivateKey: string;

  @Column()
  servicePublicKey: string;

  @Column()
  databasePath: string;

  @Column()
  tokenSupply: number;

  @Column()
  transactionExpiry: number;

  @Column()
  storagePerFlow: number;

  @Column()
  minAccountBalance: number;

  @Column()
  transactionMaxGasLimit: number;

  @Column()
  scriptGasLimit: number;

  @Column()
  serviceSignatureAlgorithm: string;

  @Column()
  serviceHashAlgorithm: string;

  @Column()
  storageLimit: boolean;

  @Column()
  transactionFees: boolean;

  @Column()
  persist: boolean;
}
