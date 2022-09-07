import {
  Controller,
  Get,
  UseInterceptors,
  Query,
  Body,
  Post,
} from "@nestjs/common";
import { LogsService } from "./logs.service";
import { PollingResponseInterceptor } from "../common/interceptors/polling-response.interceptor";
import {
  GetAllLogsResponse,
  GetPollingLogsRequest,
  GetPollingLogsResponse,
} from "@flowser/shared";

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

  @Post("/polling")
  @UseInterceptors(new PollingResponseInterceptor(GetPollingLogsResponse))
  async findAllNew(@Body() data) {
    const request = GetPollingLogsRequest.fromJSON(data);
    const logs = await this.logsService.findAllNewerThanTimestamp(
      new Date(request.timestamp)
    );
    return logs.map((log) => log.toProto());
  }
}
