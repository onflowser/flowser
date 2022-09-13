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
  GetPollingLogsResponse,
  GetAllManagedProcessesResponse,
  GetPollingManagedProcessesResponse,
  GetPollingManagedProcessesRequest,
  GetPollingLogsRequest,
} from "@flowser/shared";
import { PollingResponseInterceptor } from "../core/interceptors/polling-response.interceptor";

@Controller("processes")
export class ProcessManagerController {
  constructor(private processManagerService: ProcessManagerService) {}

  @Post(":id/restart")
  async restartProcess(@Param("id") processId) {
    return this.processManagerService.restart(processId);
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

  @Post(":logs/polling")
  @UseInterceptors(new PollingResponseInterceptor(GetPollingLogsResponse))
  async getAllLogsNewerThanTimestamp(@Body() data) {
    const request = GetPollingLogsRequest.fromJSON(data);
    return this.processManagerService.findAllLogsNewerThanTimestamp(
      new Date(request.timestamp)
    );
  }

  @Post(":processId/logs/polling")
  @UseInterceptors(new PollingResponseInterceptor(GetPollingLogsResponse))
  async getAllLogsByProcessNewerThanTimestamp(
    @Param("processId") processId,
    @Body() data
  ) {
    const request = GetPollingLogsRequest.fromJSON(data);
    return this.processManagerService.findAllLogsByProcessIdNewerThanTimestamp(
      processId,
      new Date(request.timestamp)
    );
  }
}
