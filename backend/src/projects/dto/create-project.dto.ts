import { GatewayConfiguration } from './gateway-configuration';

export class CreateProjectDto {
    name: string;
    gateway: GatewayConfiguration
}
