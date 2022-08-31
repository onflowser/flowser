import { Controller, Get, UseInterceptors, Query } from "@nestjs/common";
import { LogsService } from "./logs.service";
import { PollingResponseInterceptor } from "../common/interceptors/polling-response.interceptor";
import { ParseUnixTimestampPipe } from "../common/pipes/parse-unix-timestamp.pipe";
import { GetAllLogsResponse, GetPollingLogsResponse } from "@flowser/shared";

@Controller("logs")
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Get()
  async findAll() {
    const logs = await this.logsService.findAll();
    return GetAllLogsResponse.toJSON({
      logs: logs.map((log) => log.toProto()),
    });
  }

  @Get("/polling")
  @UseInterceptors(new PollingResponseInterceptor(GetPollingLogsResponse))
  async findAllNew(@Query("timestamp", ParseUnixTimestampPipe) timestamp) {
    const logs = await this.logsService.findAllNewerThanTimestamp(timestamp);
    return logs.map((log) => log.toProto());
  }
}
