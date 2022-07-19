import { Column, Entity } from 'typeorm';

@Entity()
export class EmulatorConfigurationEntity {
    @Column()
    verboseLogging: boolean;

    @Column()
    httpServerPort: number | string;

    @Column()
    rpcServerPort: number | string;

    @Column()
    blockTime: number;

    @Column()
    servicePrivateKey: string;

    @Column()
    servicePublicKey: string;

    @Column()
    databasePath: string;

    @Column()
    tokenSupply: number | string;

    @Column()
    transactionExpiry: number | string;

    @Column()
    storagePerFlow: number | string;

    @Column()
    minAccountBalance: number | string;

    @Column()
    transactionMaxGasLimit: number | string;

    @Column()
    scriptGasLimit: number | string;

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

    @Column()
    simpleAddresses: boolean;

    @Column()
    numberOfInitialAccounts: number | string;
}
