import {
  Controller,
  Get,
  Param,
  UseInterceptors, Query, ParseIntPipe
} from '@nestjs/common';
import { ContractsService } from '../services/contracts.service';
import { PollingResponseInterceptor } from "../../shared/interceptors/polling-response.interceptor";

@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Get()
  findAll() {
    return this.contractsService._findAll();
  }

  @Get('/polling')
  @UseInterceptors(PollingResponseInterceptor)
  findAllNew(@Query('timestamp', ParseIntPipe) timestamp) {
    return this.contractsService.findAllNewerThanTimestamp(timestamp);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contractsService.findOne(id);
  }

}
