import { ApiProperty } from '@nestjs/swagger';

export class EmulatorConfigurationDto {
    @ApiProperty()
    verboseLogging: boolean;
    @ApiProperty()
    persist: boolean;
    @ApiProperty()
    httpServerPort: number;
    @ApiProperty()
    rpcServerPort: number;
    @ApiProperty()
    blockTime: number;
    @ApiProperty()
    servicePrivateKey: string;
    @ApiProperty()
    servicePublicKey: string;
    @ApiProperty()
    databasePath: string;
    @ApiProperty()
    tokenSupply: number;
    @ApiProperty()
    transactionExpiry: number;
    @ApiProperty()
    storagePerFlow: number;
    @ApiProperty()
    minAccountBalance: number;
    @ApiProperty()
    transactionMaxGasLimit: number;
    @ApiProperty()
    scriptGasLimit: number;
    @ApiProperty()
    serviceSignatureAlgorithm: string;
    @ApiProperty()
    serviceHashAlgorithm: string;
    @ApiProperty()
    storageLimit: boolean;
    @ApiProperty()
    transactionFees: boolean;
    @ApiProperty()
    numberOfInitialAccounts: number;
}
