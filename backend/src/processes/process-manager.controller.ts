import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseInterceptors,
} from "@nestjs/common";
import { ProcessManagerService } from "./process-manager.service";
import {
  GetPollingOutputsResponse,
  GetAllManagedProcessesResponse,
  GetPollingManagedProcessesResponse,
  GetPollingManagedProcessesRequest,
  GetPollingOutputsRequest,
} from "@flowser/shared";
import { PollingResponseInterceptor } from "../core/interceptors/polling-response.interceptor";

@Controller("processes")
export class ProcessManagerController {
  constructor(private processManagerService: ProcessManagerService) {}

  @Post(":id/start")
  async startProcess(@Param("id") processId) {
    return this.processManagerService.start(processId);
  }

  @Post(":id/stop")
  async stopProcess(@Param("id") processId) {
    return this.processManagerService.stop(processId);
  }

  @Post(":id/restart")
  async restartProcess(@Param("id") processId) {
    return this.processManagerService.restart(processId);
  }

  @Get("debug")
  async debugInfo() {
    return this.processManagerService.getAll();
  }

  @Post("/polling")
  @UseInterceptors(
    new PollingResponseInterceptor(GetPollingManagedProcessesResponse)
  )
  async getAllProcessesNewerThanTimestamp(@Body() body) {
    const request = GetPollingManagedProcessesRequest.fromJSON(body);
    const processes =
      this.processManagerService.findAllProcessesNewerThanTimestamp(
        new Date(request.timestamp)
      );
    return processes.map((process) => process.toProto());
  }

  @Get()
  async getAllProcesses() {
    const processes = this.processManagerService.getAll();
    return GetAllManagedProcessesResponse.toJSON({
      processes: processes.map((process) => process.toProto()),
    });
  }

  @Post(":outputs/polling")
  @UseInterceptors(new PollingResponseInterceptor(GetPollingOutputsResponse))
  async getAllOutputsNewerThanTimestamp(@Body() data) {
    const request = GetPollingOutputsRequest.fromJSON(data);
    return this.processManagerService.findAllLogsNewerThanTimestamp(
      new Date(request.timestamp)
    );
  }

  @Post(":processId/outputs/polling")
  @UseInterceptors(new PollingResponseInterceptor(GetPollingOutputsResponse))
  async getAllOutputsByProcessNewerThanTimestamp(
    @Param("processId") processId,
    @Body() data
  ) {
    const request = GetPollingOutputsRequest.fromJSON(data);
    return this.processManagerService.findAllLogsByProcessIdNewerThanTimestamp(
      processId,
      new Date(request.timestamp)
    );
  }
}
