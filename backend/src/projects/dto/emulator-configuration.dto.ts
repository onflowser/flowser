import { ApiProperty } from "@nestjs/swagger";
import { Emulator } from "@flowser/shared";

export class EmulatorConfigurationDto implements Emulator {
  @ApiProperty()
  // @ts-ignore As this is always set automatically by the framework.
  adminServerPort: number;
  @ApiProperty()
  // @ts-ignore As this is always set automatically by the framework.
  blockTime: number;
  @ApiProperty()
  // @ts-ignore As this is always set automatically by the framework.
  databasePath: string;
  @ApiProperty()
  // @ts-ignore As this is always set automatically by the framework.
  enableGrpcDebug: boolean;
  @ApiProperty()
  // @ts-ignore As this is always set automatically by the framework.
  enableRestDebug: boolean;
  @ApiProperty()
  // @ts-ignore As this is always set automatically by the framework.
  grpcServerPort: number;
  @ApiProperty()
  // @ts-ignore As this is always set automatically by the framework.
  logFormat: string;
  @ApiProperty()
  // @ts-ignore As this is always set automatically by the framework.
  minAccountBalance: number;
  @ApiProperty()
  // @ts-ignore As this is always set automatically by the framework.
  persist: boolean;
  @ApiProperty()
  // @ts-ignore As this is always set automatically by the framework.
  snapshot: boolean;
  @ApiProperty()
  // @ts-ignore As this is always set automatically by the framework.
  restServerPort: number;
  @ApiProperty()
  // @ts-ignore As this is always set automatically by the framework.
  scriptGasLimit: number;
  @ApiProperty()
  // @ts-ignore As this is always set automatically by the framework.
  serviceHashAlgorithm: number;
  @ApiProperty()
  // @ts-ignore As this is always set automatically by the framework.
  servicePrivateKey: string;
  @ApiProperty()
  // @ts-ignore As this is always set automatically by the framework.
  serviceSignatureAlgorithm: number;
  @ApiProperty()
  // @ts-ignore As this is always set automatically by the framework.
  storageLimit: boolean;
  @ApiProperty()
  // @ts-ignore As this is always set automatically by the framework.
  storagePerFlow: number;
  @ApiProperty()
  // @ts-ignore As this is always set automatically by the framework.
  tokenSupply: number;
  @ApiProperty()
  // @ts-ignore As this is always set automatically by the framework.
  transactionExpiry: number;
  @ApiProperty()
  // @ts-ignore As this is always set automatically by the framework.
  transactionFees: boolean;
  @ApiProperty()
  // @ts-ignore As this is always set automatically by the framework.
  transactionMaxGasLimit: number;
  @ApiProperty()
  // @ts-ignore As this is always set automatically by the framework.
  useSimpleAddresses: boolean;
  @ApiProperty()
  // @ts-ignore As this is always set automatically by the framework.
  verboseLogging: boolean;
  @ApiProperty()
  // @ts-ignore As this is always set automatically by the framework.
  withContracts: boolean;
}
