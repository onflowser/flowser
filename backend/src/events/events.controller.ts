import { Controller, Get, Param, UseInterceptors, Query } from "@nestjs/common";
import { EventsService } from "./events.service";
import { PollingResponseInterceptor } from "../common/interceptors/polling-response.interceptor";
import { ApiParam } from "@nestjs/swagger";
import { ParseUnixTimestampPipe } from "../common/pipes/parse-unix-timestamp.pipe";

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
    @Query("timestamp", ParseUnixTimestampPipe) timestamp
  ) {
    return this.eventsService.findAllByTransactionNewerThanTimestamp(
      transactionId,
      timestamp
    );
  }

  @Get("/events/polling")
  @UseInterceptors(PollingResponseInterceptor)
  findAllNew(@Query("timestamp", ParseUnixTimestampPipe) timestamp) {
    return this.eventsService.findAllNewerThanTimestamp(timestamp);
  }
}
