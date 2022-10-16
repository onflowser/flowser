import { IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Gateway, GatewayStatus } from "@flowser/shared";

export class GatewayConfigurationDto implements Gateway {
  @ApiProperty()
  @IsNotEmpty()
  grpcServerAddress: string;

  @ApiProperty()
  @IsNotEmpty()
  restServerAddress: string;

  @ApiProperty()
  @IsNotEmpty()
  status: GatewayStatus;
}
