import {
  Controller,
  Get,
  UseInterceptors, Query, ParseIntPipe
} from '@nestjs/common';
import { LogsService } from './logs.service';
import { PollingResponseInterceptor } from "../shared/interceptors/polling-response.interceptor";

@Controller('logs')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Get()
  findAll() {
    return this.logsService.findAll();
  }

  @Get('/polling')
  @UseInterceptors(PollingResponseInterceptor)
  findAllNew(@Query('timestamp', ParseIntPipe) timestamp) {
    return this.logsService.findAllNewerThanTimestamp(timestamp);
  }
}
