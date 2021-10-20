import {
  Controller,
  Get,
  Param,
  UseInterceptors, Query, ParseIntPipe
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { PollingResponseInterceptor } from "../shared/interceptors/polling-response.interceptor";

@Controller()
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get("/transactions")
  findAll() {
    return this.transactionsService.findAll();
  }

  @Get("/transactions/polling")
  @UseInterceptors(PollingResponseInterceptor)
  findAllNew(@Query('timestamp', ParseIntPipe) timestamp) {
    return this.transactionsService.findAllNewerThanTimestamp(timestamp);
  }

  @Get("/blocks/:blockId/transactions")
  findAllByBlock(@Param("blockId") blockId) {
    return this.transactionsService.findAllByBlock(blockId);
  }

  @Get("/blocks/:blockId/transactions/polling")
  @UseInterceptors(PollingResponseInterceptor)
  findAllNewByBlock(
    @Param("blockId") blockId,
    @Query('timestamp', ParseIntPipe) timestamp
  ) {
    return this.transactionsService.findAllByBlockNewerThanTimestamp(blockId, timestamp);
  }

  @Get('/transactions/:id')
  findOne(@Param('id') id: string) {
    return this.transactionsService.findOne(id);
  }
}
