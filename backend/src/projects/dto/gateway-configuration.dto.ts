import { IsNotEmpty } from "class-validator";

export class GatewayConfigurationDto {
    @IsNotEmpty()
    port: number;

    @IsNotEmpty()
    address: string;
}
