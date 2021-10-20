import {
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Query,
    UseInterceptors
} from '@nestjs/common';
import { BlocksService } from './blocks.service';
import { PollingResponseInterceptor } from '../shared/interceptors/polling-response.interceptor';

@Controller('blocks')
export class BlocksController {
    constructor(private readonly blocksService: BlocksService) {
    }

    @Get()
    findAll() {
        return this.blocksService.findAll();
    }

    @Get('/polling')
    @UseInterceptors(PollingResponseInterceptor)
    findAllNew(@Query('timestamp', ParseIntPipe) timestamp) {
        return this.blocksService.findAllNewerThanTimestamp(timestamp);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.blocksService.findOne(id);
    }
}
