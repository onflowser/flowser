import { IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import {
  DevWallet,
  Gateway,
  GatewayStatus,
} from "@flowser/types/generated/entities/projects";

export class DevWalletConfigurationDto implements DevWallet {
  @ApiProperty()
  @IsNotEmpty()
  port: number;
  @ApiProperty()
  @IsNotEmpty()
  run: boolean;
}
