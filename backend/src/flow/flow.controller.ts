import { Controller, Get } from "@nestjs/common";
import { FlowGatewayService } from "./services/flow-gateway.service";

@Controller("flow")
export class FlowController {
  constructor (private flowGatewayService: FlowGatewayService) {}

  @Get("status")
  async getStatus() {
    const isConnected = await this.flowGatewayService.isConnectedToGateway();
    return {
      isConnected
    };
  }
}
