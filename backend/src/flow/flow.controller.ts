import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  UseInterceptors,
} from "@nestjs/common";
import { FlowGatewayService } from "./services/gateway.service";
import { FlowEmulatorService } from "./services/emulator.service";
import { FlowCliService } from "./services/cli.service";
import { FlowSnapshotService } from "./services/snapshot.service";
import {
  GetFlowCliInfoResponse,
  GetPollingEmulatorSnapshotsResponse,
  CreateEmulatorSnapshotRequest,
  RevertToEmulatorSnapshotRequest,
  RevertToEmulatorSnapshotResponse,
  GetPollingEmulatorSnapshotsRequest,
  GetProjectObjectsResponse,
} from "@flowser/shared";
import { PollingResponseInterceptor } from "../core/interceptors/polling-response.interceptor";
import { FlowConfigService } from "./services/config.service";

@Controller("flow")
export class FlowController {
  constructor(
    private flowGatewayService: FlowGatewayService,
    private flowEmulatorService: FlowEmulatorService,
    private flowCliService: FlowCliService,
    private flowConfigService: FlowConfigService,
    private flowSnapshotService: FlowSnapshotService
  ) {}

  @Get("version")
  async getVersion() {
    const info = await this.flowCliService.getInfo();
    return GetFlowCliInfoResponse.toJSON(info);
  }

  @Get("objects")
  async findCurrentProjectObjects() {
    const [transactions, contracts] = await Promise.all([
      this.flowConfigService.getTransactionTemplates(),
      this.flowConfigService.getContractTemplates(),
    ]);
    return GetProjectObjectsResponse.toJSON(
      GetProjectObjectsResponse.fromPartial({
        transactions,
        contracts,
      })
    );
  }

  @Post("snapshots/polling")
  @UseInterceptors(
    new PollingResponseInterceptor(GetPollingEmulatorSnapshotsResponse)
  )
  async getSnapshotsWithPolling(@Body() data) {
    const request = GetPollingEmulatorSnapshotsRequest.fromJSON(data);
    const snapshots =
      await this.flowSnapshotService.findAllByProjectNewerThanTimestamp(
        request
      );
    return snapshots.map((snapshot) => snapshot.toProto());
  }

  @Post("snapshots")
  async createSnapshot(@Body() body) {
    const request = CreateEmulatorSnapshotRequest.fromJSON(body);
    const snapshot = await this.flowSnapshotService.create(request);
    return RevertToEmulatorSnapshotResponse.toJSON(
      RevertToEmulatorSnapshotResponse.fromPartial({
        snapshot: snapshot.toProto(),
      })
    );
  }

  @Put("snapshots")
  async revertToSnapshot(@Body() body) {
    const request = RevertToEmulatorSnapshotRequest.fromJSON(body);
    const snapshot = await this.flowSnapshotService.revertTo(request);
    return RevertToEmulatorSnapshotResponse.toJSON(
      RevertToEmulatorSnapshotResponse.fromPartial({
        snapshot: snapshot.toProto(),
      })
    );
  }
}
