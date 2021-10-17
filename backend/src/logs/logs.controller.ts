import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors, Query, ParseIntPipe
} from '@nestjs/common';
import { LogsService } from './logs.service';
import { CreateLogDto } from './dto/create-log.dto';
import { UpdateLogDto } from './dto/update-log.dto';
import { PollingResponseInterceptor } from "../shared/interceptors/polling-response.interceptor";

@Controller('logs')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Post()
  create(@Body() createLogDto: CreateLogDto) {
    return this.logsService.create(createLogDto);
  }

  @Get()
  findAll() {
    return this.logsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.logsService.findOne(+id);
  }

  @Get('/polling')
  @UseInterceptors(PollingResponseInterceptor)
  findAllNew(@Query('timestamp', ParseIntPipe) timestamp) {
    return this.logsService.findAllNewerThanTimestamp(timestamp);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLogDto: UpdateLogDto) {
    return this.logsService.update(+id, updateLogDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.logsService.remove(+id);
  }
}
