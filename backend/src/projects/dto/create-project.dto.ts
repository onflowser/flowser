import { GatewayConfigurationDto } from './gateway-configuration.dto';
import { IsNotEmpty, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { EmulatorConfigurationDto } from "./emulator-configuration.dto";
import { ApiProperty } from "@nestjs/swagger";

export class CreateProjectDto {
    @ApiProperty()
    @IsNotEmpty()
    name: string;

    @ApiProperty({
        description: "Data will be fetched from this block height forward."
    })
    startBlockHeight: number;
    isCustom: boolean

    @ApiProperty()
    @IsNotEmpty()
    @ValidateNested()
    @Type(() => GatewayConfigurationDto)
    gateway: GatewayConfigurationDto

    @ApiProperty({
        description: "Custom emulator configuration, used to start a flowser managed emulator."
    })
    @IsNotEmpty()
    @ValidateNested()
    @Type(() => EmulatorConfigurationDto)
    emulator: EmulatorConfigurationDto
}
