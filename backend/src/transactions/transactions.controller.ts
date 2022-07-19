import { Controller, Get, Param, UseInterceptors, Query, ParseIntPipe } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { PollingResponseInterceptor } from '../shared/interceptors/polling-response.interceptor';
import { ApiParam, ApiQuery } from '@nestjs/swagger';

@Controller()
export class TransactionsController {
    constructor(private readonly transactionsService: TransactionsService) {}

    @Get('/transactions')
    findAll() {
        return this.transactionsService.findAll();
    }

    @Get('/transactions/polling')
    @UseInterceptors(PollingResponseInterceptor)
    findAllNew(@Query('timestamp', ParseIntPipe) timestamp) {
        return this.transactionsService.findAllNewerThanTimestamp(timestamp);
    }

    @ApiParam({ name: 'id', type: String })
    @Get('/blocks/:id/transactions')
    findAllByBlock(@Param('id') blockId) {
        return this.transactionsService.findAllByBlock(blockId);
    }

    @ApiParam({ name: 'id', type: String })
    @ApiQuery({ name: 'timestamp', type: Number })
    @Get('/blocks/:id/transactions/polling')
    @UseInterceptors(PollingResponseInterceptor)
    findAllNewByBlock(@Param('id') blockId, @Query('timestamp', ParseIntPipe) timestamp) {
        return this.transactionsService.findAllByBlockNewerThanTimestamp(blockId, timestamp);
    }

    @ApiParam({ name: 'id', type: String })
    @Get('/transactions/:id')
    findOne(@Param('id') id: string) {
        return this.transactionsService.findOne(id);
    }
}
