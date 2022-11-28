import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";
import { Emulator } from "@flowser/shared";

export class EmulatorConfigurationDto implements Emulator {
  @ApiProperty()
  @IsNotEmpty()
  adminServerPort!: number;
  @ApiProperty()
  @IsNotEmpty()
  blockTime!: number;
  @ApiProperty()
  @IsNotEmpty()
  databasePath!: string;
  @ApiProperty()
  @IsNotEmpty()
  enableGrpcDebug!: boolean;
  @ApiProperty()
  @IsNotEmpty()
  enableRestDebug!: boolean;
  @ApiProperty()
  @IsNotEmpty()
  grpcServerPort!: number;
  @ApiProperty()
  @IsNotEmpty()
  logFormat!: string;
  @ApiProperty()
  @IsNotEmpty()
  minAccountBalance!: number;
  @ApiProperty()
  @IsNotEmpty()
  persist!: boolean;
  @ApiProperty()
  @IsNotEmpty()
  snapshot!: boolean;
  @ApiProperty()
  @IsNotEmpty()
  restServerPort!: number;
  @ApiProperty()
  @IsNotEmpty()
  scriptGasLimit!: number;
  @ApiProperty()
  @IsNotEmpty()
  serviceHashAlgorithm!: number;
  @ApiProperty()
  @IsNotEmpty()
  servicePrivateKey!: string;
  @ApiProperty()
  @IsNotEmpty()
  serviceSignatureAlgorithm!: number;
  @ApiProperty()
  @IsNotEmpty()
  simpleAddresses!: boolean;
  @ApiProperty()
  @IsNotEmpty()
  storageLimit!: boolean;
  @ApiProperty()
  @IsNotEmpty()
  storagePerFlow!: number;
  @ApiProperty()
  @IsNotEmpty()
  tokenSupply!: number;
  @ApiProperty()
  @IsNotEmpty()
  transactionExpiry!: number;
  @ApiProperty()
  @IsNotEmpty()
  transactionFees!: boolean;
  @ApiProperty()
  @IsNotEmpty()
  transactionMaxGasLimit!: number;
  @ApiProperty()
  @IsNotEmpty()
  useSimpleAddresses!: boolean;
  @ApiProperty()
  @IsNotEmpty()
  verboseLogging!: boolean;
  @ApiProperty()
  @IsNotEmpty()
  withContracts!: boolean;
}
