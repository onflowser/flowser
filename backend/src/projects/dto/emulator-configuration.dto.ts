import { ApiProperty } from "@nestjs/swagger";
import { Emulator } from "@flowser/shared";

export class EmulatorConfigurationDto implements Emulator {
  @ApiProperty()
  adminServerPort: number;
  @ApiProperty()
  blockTime: number;
  @ApiProperty()
  databasePath: string;
  @ApiProperty()
  enableGrpcDebug: boolean;
  @ApiProperty()
  enableRestDebug: boolean;
  @ApiProperty()
  grpcServerPort: number;
  @ApiProperty()
  logFormat: string;
  @ApiProperty()
  minAccountBalance: number;
  @ApiProperty()
  persist: boolean;
  @ApiProperty()
  snapshot: boolean;
  @ApiProperty()
  restServerPort: number;
  @ApiProperty()
  scriptGasLimit: number;
  @ApiProperty()
  serviceHashAlgorithm: number;
  @ApiProperty()
  servicePrivateKey: string;
  @ApiProperty()
  serviceSignatureAlgorithm: number;
  @ApiProperty()
  storageLimit: boolean;
  @ApiProperty()
  storagePerFlow: number;
  @ApiProperty()
  tokenSupply: number;
  @ApiProperty()
  transactionExpiry: number;
  @ApiProperty()
  transactionFees: boolean;
  @ApiProperty()
  transactionMaxGasLimit: number;
  @ApiProperty()
  useSimpleAddresses: boolean;
  @ApiProperty()
  verboseLogging: boolean;
  @ApiProperty()
  withContracts: boolean;
}
