import { Controller, Get, Param } from "@nestjs/common";
import { FlowGatewayService } from "./services/gateway.service";
import { FlowEmulatorService } from "./services/emulator.service";
import { FlowCliService } from "./services/cli.service";
import { GetFlowCliInfoResponse } from "@flowser/types/generated/responses/flow";
import { FlowAccountStorageService } from "./services/storage.service";

@Controller("flow")
export class FlowController {
  constructor(
    private flowGatewayService: FlowGatewayService,
    private flowEmulatorService: FlowEmulatorService,
    private flowCliService: FlowCliService,
    private flowAccountStorageService: FlowAccountStorageService
  ) {}

  @Get("version")
  async getVersion() {
    const info = await this.flowCliService.version();
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

  @Get("debug/emulator")
  getEmulator() {
    return {
      status: this.flowEmulatorService.state,
      config: this.flowEmulatorService.projectContext?.emulator,
      process: this.flowEmulatorService.emulatorProcess,
    };
  }

  @Get("debug/emulator/logs")
  async getLogs() {
    return this.flowEmulatorService.logs;
  }

  @Get("storage/:address")
  async getAccountStorage(@Param("address") address) {
    return this.flowAccountStorageService.getAccountStorage(address);
  }
}
