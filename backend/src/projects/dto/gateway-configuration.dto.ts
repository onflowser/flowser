import { IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class GatewayConfigurationDto {
  @ApiProperty()
  @IsNotEmpty()
  port: number;

  @ApiProperty()
  @IsNotEmpty()
  address: string;
}
