import { Controller, Get, Param, Query, UseInterceptors } from "@nestjs/common";
import { BlocksService } from "./blocks.service";
import { PollingResponseInterceptor } from "../shared/interceptors/polling-response.interceptor";
import { ApiParam } from "@nestjs/swagger";
import { ParseUnixTimestampPipe } from "../shared/pipes/parse-unix-timestamp.pipe";

@Controller("blocks")
export class BlocksController {
  constructor(private readonly blocksService: BlocksService) {}

  @Get()
  findAll() {
    return this.blocksService.findAll();
  }

  @Get("/polling")
  @UseInterceptors(PollingResponseInterceptor)
  findAllNew(@Query("timestamp", ParseUnixTimestampPipe) timestamp) {
    return this.blocksService.findAllNewerThanTimestamp(timestamp);
  }

  @ApiParam({ name: "id", type: String })
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.blocksService.findOne(id);
  }
}
