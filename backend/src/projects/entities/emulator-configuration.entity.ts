import { Column, Entity } from "typeorm";

@Entity()
export class EmulatorConfigurationEntity {
  @Column({ nullable: true })
  verboseLogging: boolean;

  @Column({ nullable: true })
  httpServerPort: number;

  @Column({ nullable: true })
  rpcServerPort: number;

  @Column({ nullable: true })
  blockTime: number;

  @Column({ nullable: true })
  servicePrivateKey: string;

  @Column({ nullable: true })
  servicePublicKey: string;

  @Column({ nullable: true })
  databasePath: string;

  @Column({ nullable: true })
  tokenSupply: number;

  @Column({ nullable: true })
  transactionExpiry: number;

  @Column({ nullable: true })
  storagePerFlow: number;

  @Column({ nullable: true })
  minAccountBalance: number;

  @Column({ nullable: true })
  transactionMaxGasLimit: number;

  @Column({ nullable: true })
  scriptGasLimit: number;

  @Column({ nullable: true })
  serviceSignatureAlgorithm: string;

  @Column({ nullable: true })
  serviceHashAlgorithm: string;

  @Column({ nullable: true })
  storageLimit: boolean;

  @Column({ nullable: true })
  transactionFees: boolean;

  @Column({ nullable: true })
  persist: boolean;

  @Column({ nullable: true })
  simpleAddresses: boolean;

  @Column({ nullable: true })
  numberOfInitialAccounts: number;
}
