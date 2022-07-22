import { Controller, Get, UseInterceptors, Query } from "@nestjs/common";
import { LogsService } from "./logs.service";
import { PollingResponseInterceptor } from "../common/interceptors/polling-response.interceptor";
import { ParseUnixTimestampPipe } from "../common/pipes/parse-unix-timestamp.pipe";

@Controller("logs")
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Get()
  findAll() {
    return this.logsService.findAll();
  }

  @Get("/polling")
  @UseInterceptors(PollingResponseInterceptor)
  findAllNew(@Query("timestamp", ParseUnixTimestampPipe) timestamp) {
    return this.logsService.findAllNewerThanTimestamp(timestamp);
  }
}
