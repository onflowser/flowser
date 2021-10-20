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

@Controller()
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get("/events")
  findAll() {
    return this.eventsService.findAll();
  }

  @Get("/transactions/:transactionId/events")
  findAllByTransaction(@Param("transactionId") transactionId) {
    return this.eventsService.findAllByTransaction(transactionId);
  }

  @Get('/events/polling')
  @UseInterceptors(PollingResponseInterceptor)
  findAllNew(@Query('timestamp', ParseIntPipe) timestamp) {
    return this.eventsService.findAllNewerThanTimestamp(timestamp);
  }

  @Get('/events/:id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }
}
