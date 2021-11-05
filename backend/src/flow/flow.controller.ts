import { Controller, Get } from "@nestjs/common";
import { FlowGatewayService } from "./services/flow-gateway.service";
import { FlowEmulatorService } from "./services/flow-emulator.service";
import { FlowCliService } from "./services/flow-cli.service";

@Controller("flow")
export class FlowController {
  constructor (
    private flowGatewayService: FlowGatewayService,
    private flowEmulatorService: FlowEmulatorService,
    private flowCliService: FlowCliService,
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

  @Get("version")
  async getVersion() {
    return this.flowCliService.version();
  }
}
