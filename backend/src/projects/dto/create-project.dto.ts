import { GatewayConfiguration } from './gateway-configuration';
import { IsNotEmpty, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class CreateProjectDto {
    @IsNotEmpty()
    name: string;

    startBlockHeight: number;

    @IsNotEmpty()
    @ValidateNested()
    @Type(() => GatewayConfiguration)
    gateway: GatewayConfiguration
}
