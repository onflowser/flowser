import {
  Controller,
  Get,
  Param,
  UseInterceptors, Query, ParseIntPipe
} from '@nestjs/common';
import { AccountsService } from '../services/accounts.service';
import { PollingResponseInterceptor } from "../../shared/interceptors/polling-response.interceptor";

@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  findAll() {
    return this.accountsService.findAll();
  }

  @Get('/polling')
  @UseInterceptors(PollingResponseInterceptor)
  findAllNew(@Query('timestamp', ParseIntPipe) timestamp) {
    return this.accountsService.findAllNewerThanTimestamp(timestamp);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.accountsService.findOne(id);
  }
}
