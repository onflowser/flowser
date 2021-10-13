import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  Query,
  ParseIntPipe
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { PollingResponseInterceptor } from "../shared/interceptors/polling-response.interceptor";

@Controller()
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post("/events")
  create(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(createEventDto);
  }

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

  @Patch('/events/:id')
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.update(id, updateEventDto);
  }

  @Delete('/events:id')
  remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }
}
