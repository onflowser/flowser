import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    UseInterceptors
} from '@nestjs/common';
import { BlocksService } from './blocks.service';
import { CreateBlockDto } from './dto/create-block.dto';
import { UpdateBlockDto } from './dto/update-block.dto';
import { PollingResponseInterceptor } from '../shared/interceptors/polling-response.interceptor';

@Controller('blocks')
export class BlocksController {
    constructor(private readonly blocksService: BlocksService) {
    }

    @Post()
    create(@Body() createBlockDto: CreateBlockDto) {
        return this.blocksService.create(createBlockDto);
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

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateBlockDto: UpdateBlockDto) {
        return this.blocksService.update(id, updateBlockDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.blocksService.remove(id);
    }
}
