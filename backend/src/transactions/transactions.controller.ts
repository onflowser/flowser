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
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { PollingResponseInterceptor } from "../shared/interceptors/polling-response.interceptor";

@Controller()
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post("/transactions")
  create(@Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionsService.create(createTransactionDto);
  }

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

  @Get('/transactions/:id')
  findOne(@Param('id') id: string) {
    return this.transactionsService.findOne(id);
  }

  @Patch('/transactions/:id')
  update(@Param('id') id: string, @Body() updateTransactionDto: UpdateTransactionDto) {
    return this.transactionsService.update(id, updateTransactionDto);
  }

  @Delete('/transactions/:id')
  remove(@Param('id') id: string) {
    return this.transactionsService.remove(id);
  }
}
