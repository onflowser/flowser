import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Query,
  UseInterceptors,
} from "@nestjs/common";
import { FlowGatewayService } from "./services/gateway.service";
import { FlowEmulatorService } from "./services/emulator.service";
import { FlowCliService } from "./services/cli.service";
import { FlowSnapshotService } from "./services/snapshot.service";
import {
  GetFlowCliInfoResponse,
  GetAllEmulatorSnapshotsResponse,
  GetPollingEmulatorSnapshotsResponse,
  CreateEmulatorSnapshotRequest,
  RevertToEmulatorSnapshotRequest,
  RevertToEmulatorSnapshotResponse,
  CreateEmulatorSnapshotResponse,
} from "@flowser/shared";
import { PollingResponseInterceptor } from "../common/interceptors/polling-response.interceptor";
import { ParseUnixTimestampPipe } from "../common/pipes/parse-unix-timestamp.pipe";

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

  @Get("snapshots")
  async getSnapshots() {
    const snapshots = await this.flowSnapshotService.findAll();
    return GetAllEmulatorSnapshotsResponse.toJSON({
      snapshots: snapshots.map((snapshot) => snapshot.toProto()),
    });
  }

  @Get("snapshots/polling")
  @UseInterceptors(
    new PollingResponseInterceptor(GetPollingEmulatorSnapshotsResponse)
  )
  async getSnapshotsWithPolling(
    @Query("timestamp", ParseUnixTimestampPipe) timestamp
  ) {
    const snapshots = await this.flowSnapshotService.findAllNewerThanTimestamp(
      timestamp
    );
    return snapshots.map((snapshot) => snapshot.toProto());
  }

  @Post("snapshots")
  async createSnapshot(@Body() body) {
    const request = CreateEmulatorSnapshotRequest.fromJSON(body);
    const snapshot = await this.flowSnapshotService.create(request.description);
    return CreateEmulatorSnapshotResponse.toJSON({
      snapshot: snapshot.toProto(),
    });
  }

  @Put("snapshots")
  async revertToSnapshot(@Body() body) {
    const request = RevertToEmulatorSnapshotRequest.fromJSON(body);
    const snapshot = await this.flowSnapshotService.revertTo(request.blockId);
    return RevertToEmulatorSnapshotResponse.toJSON({
      snapshot: snapshot.toProto(),
    });
  }
}
