import { GatewayConfigurationDto } from './gateway-configuration.dto';
import { IsNotEmpty, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { EmulatorConfigurationDto } from "./emulator-configuration.dto";

export class CreateProjectDto {
    @IsNotEmpty()
    name: string;

    startBlockHeight: number;
    isCustom: boolean

    @IsNotEmpty()
    @ValidateNested()
    @Type(() => GatewayConfigurationDto)
    gateway: GatewayConfigurationDto

    @IsNotEmpty()
    @ValidateNested()
    @Type(() => EmulatorConfigurationDto)
    emulator: EmulatorConfigurationDto
}
