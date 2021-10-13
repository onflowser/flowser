import { IsNotEmpty } from "class-validator";

export class GatewayConfiguration {
    @IsNotEmpty()
    port: number;

    @IsNotEmpty()
    address: string;
}
