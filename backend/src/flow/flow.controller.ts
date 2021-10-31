import { Controller, Get } from "@nestjs/common";
import { FlowGatewayService } from "./services/flow-gateway.service";
import { FlowEmulatorService } from "./services/flow-emulator.service";

@Controller("flow")
export class FlowController {
  constructor (
    private flowGatewayService: FlowGatewayService,
    private flowEmulatorService: FlowEmulatorService,
  ) {}

  @Get("status")
  async getStatus() {
    const isConnected = await this.flowGatewayService.isConnectedToGateway();
    return {
      gateway: {
        isConnected
      },
      emulator: {
        status: this.flowEmulatorService.state
      }
    };
  }
}
