import { Controller, Get } from "@nestjs/common";
import { FlowGatewayService } from "./services/gateway.service";
import { FlowEmulatorService } from "./services/emulator.service";
import { FlowCliService } from "./services/cli.service";
import { GetFlowCliInfoResponse } from "@flowser/types/generated/responses/flow";

@Controller("flow")
export class FlowController {
  constructor(
    private flowGatewayService: FlowGatewayService,
    private flowEmulatorService: FlowEmulatorService,
    private flowCliService: FlowCliService
  ) {}

  @Get("version")
  async getVersion() {
    const info = await this.flowCliService.getVersion();
    return GetFlowCliInfoResponse.toJSON(info);
  }

  /**
   * Bellow are undocumented endpoints that are used only for debugging purposes.
   * TODO: These endpoints should be removed in the future.
   */

  @Get("debug/gateway")
  async getGateway() {
    const isConnected = await this.flowGatewayService.isConnectedToGateway();
    return {
      isConnected,
    };
  }

  @Get("debug/emulator/logs")
  async getLogs() {
    return this.flowEmulatorService.logs;
  }
}
