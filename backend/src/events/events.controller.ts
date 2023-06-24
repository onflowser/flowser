import {
  Controller,
  Get,
  Param,
  UseInterceptors,
  Body,
  Post,
} from "@nestjs/common";
import { EventsService } from "./events.service";
import { PollingResponseInterceptor } from "../core/interceptors/polling-response.interceptor";
import { ApiParam } from "@nestjs/swagger";
import {
  GetAllEventsResponse,
  GetPollingEventsRequest,
  GetPollingEventsByTransactionRequest,
  GetPollingEventsResponse,
} from "@flowser/shared";

@Controller()
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get("/events")
  async findAll() {
    const events = await this.eventsService.findAll();
    return GetAllEventsResponse.toJSON({
      events: events.map((event) => event.toProto()),
    });
  }

  @ApiParam({ name: "id", type: String })
  @Get("/transactions/:id/events")
  async findAllByTransaction(@Param("id") transactionId: string) {
    const events = await this.eventsService.findAllByTransaction(transactionId);
    return GetAllEventsResponse.toJSON({
      events: events.map((event) => event.toProto()),
    });
  }

  @ApiParam({ name: "id", type: String })
  @Post("/transactions/:id/events/polling")
  @UseInterceptors(new PollingResponseInterceptor(GetPollingEventsResponse))
  async findAllNewByTransaction(@Param("id") transactionId: string, @Body() data: unknown) {
    const request = GetPollingEventsByTransactionRequest.fromJSON(data);
    const events =
      await this.eventsService.findAllByTransactionNewerThanTimestamp(
        transactionId,
        new Date(request.timestamp)
      );
    return events.map((event) => event.toProto());
  }

  @Post("/events/polling")
  @UseInterceptors(new PollingResponseInterceptor(GetPollingEventsResponse))
  async findAllNew(@Body() data: unknown) {
    const request = GetPollingEventsRequest.fromJSON(data);
    const events = await this.eventsService.findAllNewerThanTimestamp(
      new Date(request.timestamp)
    );
    return events.map((event) => event.toProto());
  }
}
