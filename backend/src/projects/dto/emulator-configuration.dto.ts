import { IsNotEmpty } from "class-validator";

export class EmulatorConfigurationDto {
  verboseLogging: boolean;
  persist: boolean;

  @IsNotEmpty()
  httpServerPort: number;

  rpcServerPort: number;
}
