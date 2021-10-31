import {
  Controller,
  Get,
  Param,
  UseInterceptors,
  Query,
  ParseIntPipe
} from '@nestjs/common';
import { EventsService } from './events.service';
import { PollingResponseInterceptor } from "../shared/interceptors/polling-response.interceptor";
import { ApiParam } from "@nestjs/swagger";

@Controller()
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get("/events")
  findAll() {
    return this.eventsService.findAll();
  }

  @ApiParam({ name: "id", type: String })
  @Get("/transactions/:id/events")
  findAllByTransaction(@Param("id") transactionId) {
    return this.eventsService.findAllByTransaction(transactionId);
  }

  @ApiParam({ name: "id", type: String })
  @Get("/transactions/:id/events/polling")
  @UseInterceptors(PollingResponseInterceptor)
  findAllNewByTransaction(
    @Param("id") transactionId,
    @Query('timestamp', ParseIntPipe) timestamp
  ) {
    return this.eventsService.findAllByTransactionNewerThanTimestamp(transactionId, timestamp);
  }

  @Get('/events/polling')
  @UseInterceptors(PollingResponseInterceptor)
  findAllNew(@Query('timestamp', ParseIntPipe) timestamp) {
    return this.eventsService.findAllNewerThanTimestamp(timestamp);
  }

  @ApiParam({ name: "id", type: String })
  @Get('/events/:id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }
}
