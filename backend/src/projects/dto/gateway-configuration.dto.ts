import { IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Gateway, ServiceStatus } from "@flowser/shared";

export class GatewayConfigurationDto implements Gateway {
  @ApiProperty()
  @IsNotEmpty()
    // @ts-ignore As this is always set automatically by the framework.
  grpcServerAddress: string;

  @ApiProperty()
  @IsNotEmpty()
    // @ts-ignore As this is always set automatically by the framework.
  restServerAddress: string;

  @ApiProperty()
  @IsNotEmpty()
    // @ts-ignore As this is always set automatically by the framework.
  status: ServiceStatus;
}
