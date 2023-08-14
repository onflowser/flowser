import { GatewayConfigurationDto } from "./gateway-configuration.dto";
import { IsNotEmpty, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { EmulatorConfigurationDto } from "./emulator-configuration.dto";
import { ApiProperty } from "@nestjs/swagger";
import { Project } from "@flowser/shared";

export class CreateProjectDto implements Partial<Project> {
  @ApiProperty()
  @IsNotEmpty()
  // @ts-ignore As this is always set automatically by the framework.
  name: string;

  @ApiProperty()
  @IsNotEmpty()
    // @ts-ignore As this is always set automatically by the framework.
  filesystemPath: string;

  @ApiProperty({
    description: "Data will be fetched from this block height forward.",
  })
    // @ts-ignore As this is always set automatically by the framework.
  startBlockHeight: number;

  @ApiProperty()
  @ValidateNested()
  @Type(() => GatewayConfigurationDto)
  gateway: GatewayConfigurationDto | undefined;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => EmulatorConfigurationDto)
    // @ts-ignore As this is always set automatically by the framework.
  emulator: EmulatorConfigurationDto;
}
