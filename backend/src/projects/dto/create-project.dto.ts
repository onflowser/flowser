import { GatewayConfigurationDto } from "./gateway-configuration.dto";
import { IsNotEmpty, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { EmulatorConfigurationDto } from "./emulator-configuration.dto";
import { ApiProperty } from "@nestjs/swagger";
import { Project } from "@flowser/shared";
import { DevWalletConfigurationDto } from "./dev-wallet-configuration.dto";

export class CreateProjectDto
  implements Omit<Project, "id" | "createdAt" | "updatedAt">
{
  @ApiProperty()
  @IsNotEmpty()
  name!: string;

  @ApiProperty()
  @IsNotEmpty()
  filesystemPath!: string;

  @ApiProperty({
    description: "Data will be fetched from this block height forward.",
  })
  startBlockHeight!: number;

  @ApiProperty()
  @ValidateNested()
  @Type(() => GatewayConfigurationDto)
  gateway!: GatewayConfigurationDto | undefined;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => EmulatorConfigurationDto)
  emulator!: EmulatorConfigurationDto;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => DevWalletConfigurationDto)
  devWallet!: DevWalletConfigurationDto;
}
