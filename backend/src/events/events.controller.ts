import { Controller, Get, Param, UseInterceptors, Query } from "@nestjs/common";
import { EventsService } from "./events.service";
import { PollingResponseInterceptor } from "../common/interceptors/polling-response.interceptor";
import { ApiParam } from "@nestjs/swagger";
import { ParseUnixTimestampPipe } from "../common/pipes/parse-unix-timestamp.pipe";

import { GetAllEventsResponse, GetPollingEventsResponse } from "@flowser/types";

@Controller()
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get("/events")
  async findAll() {
    const events = await this.eventsService.findAll();
    return GetAllEventsResponse.fromPartial({
      events: events.map((event) => event.toProto()),
    });
  }

  @ApiParam({ name: "id", type: String })
  @Get("/transactions/:id/events")
  async findAllByTransaction(@Param("id") transactionId) {
    const events = await this.eventsService.findAllByTransaction(transactionId);
    return GetAllEventsResponse.fromPartial({
      events: events.map((event) => event.toProto()),
    });
  }

  @ApiParam({ name: "id", type: String })
  @Get("/transactions/:id/events/polling")
  @UseInterceptors(new PollingResponseInterceptor(GetPollingEventsResponse))
  async findAllNewByTransaction(
    @Param("id") transactionId,
    @Query("timestamp", ParseUnixTimestampPipe) timestamp
  ) {
    const events =
      await this.eventsService.findAllByTransactionNewerThanTimestamp(
        transactionId,
        timestamp
      );
    return events.map((event) => event.toProto());
  }

  @Get("/events/polling")
  @UseInterceptors(new PollingResponseInterceptor(GetPollingEventsResponse))
  async findAllNew(@Query("timestamp", ParseUnixTimestampPipe) timestamp) {
    const events = await this.eventsService.findAllNewerThanTimestamp(
      timestamp
    );
    return events.map((event) => event.toProto());
  }
}
