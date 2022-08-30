import { Controller, Get, Param, Post, Put } from "@nestjs/common";
import { FlowGatewayService } from "./services/gateway.service";
import { FlowEmulatorService } from "./services/emulator.service";
import { FlowCliService } from "./services/cli.service";
import { GetFlowCliInfoResponse } from "@flowser/shared";
import { FlowSnapshotService } from "./services/snapshot.service";

@Controller("flow")
export class FlowController {
  constructor(
    private flowGatewayService: FlowGatewayService,
    private flowEmulatorService: FlowEmulatorService,
    private flowCliService: FlowCliService,
    private flowSnapshotService: FlowSnapshotService
  ) {}

  @Get("version")
  async getVersion() {
    const info = await this.flowCliService.getVersion();
    return GetFlowCliInfoResponse.toJSON(info);
  }

  @Get("snapshot")
  async getSnapshots() {
    return this.flowSnapshotService.findAll();
  }

  @Post("snapshot")
  async createSnapshot() {
    return this.flowSnapshotService.create("Test");
  }

  @Put("snapshot/:blockId")
  async revertToSnapshot(@Param("blockId") blockId) {
    return this.flowSnapshotService.revertTo(blockId);
  }
}
