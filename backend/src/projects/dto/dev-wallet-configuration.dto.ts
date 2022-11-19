import { IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { DevWallet, Gateway, ServiceStatus } from "@flowser/shared";

export class DevWalletConfigurationDto implements DevWallet {
  @ApiProperty()
  @IsNotEmpty()
  port: number;
  @ApiProperty()
  @IsNotEmpty()
  run: boolean;
}
