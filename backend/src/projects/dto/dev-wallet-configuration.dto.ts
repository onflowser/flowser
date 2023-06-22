import { IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { DevWallet } from "@flowser/shared";

export class DevWalletConfigurationDto implements DevWallet {
  @ApiProperty()
  @IsNotEmpty()
    // @ts-ignore As this is always set automatically by the framework.
  port: number;
}
