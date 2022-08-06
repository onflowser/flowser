import { Controller, Get, Param, UseInterceptors, Query } from "@nestjs/common";
import { TransactionsService } from "./transactions.service";
import { PollingResponseInterceptor } from "../common/interceptors/polling-response.interceptor";
import { ApiParam, ApiQuery } from "@nestjs/swagger";
import { ParseUnixTimestampPipe } from "../common/pipes/parse-unix-timestamp.pipe";

@Controller()
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get("/transactions")
  async findAll() {
    const c = await this.transactionsService.findAll();
    console.log(c[0].args);
    return c;
  }

  @Get("/transactions/polling")
  @UseInterceptors(PollingResponseInterceptor)
  findAllNew(@Query("timestamp", ParseUnixTimestampPipe) timestamp) {
    return this.transactionsService.findAllNewerThanTimestamp(timestamp);
  }

  @ApiParam({ name: "id", type: String })
  @Get("/blocks/:id/transactions")
  findAllByBlock(@Param("id") blockId) {
    return this.transactionsService.findAllByBlock(blockId);
  }

  @ApiParam({ name: "id", type: String })
  @ApiQuery({ name: "timestamp", type: Number })
  @Get("/blocks/:id/transactions/polling")
  @UseInterceptors(PollingResponseInterceptor)
  findAllNewByBlock(
    @Param("id") blockId,
    @Query("timestamp", ParseUnixTimestampPipe) timestamp
  ) {
    return this.transactionsService.findAllByBlockNewerThanTimestamp(
      blockId,
      timestamp
    );
  }

  @ApiParam({ name: "id", type: String })
  @Get("/transactions/:id")
  findOne(@Param("id") id: string) {
    return this.transactionsService.findOne(id);
  }
}
