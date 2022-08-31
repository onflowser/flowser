import { Controller, Get, Param, UseInterceptors, Query } from "@nestjs/common";
import { TransactionsService } from "./transactions.service";
import { PollingResponseInterceptor } from "../common/interceptors/polling-response.interceptor";
import { ApiParam, ApiQuery } from "@nestjs/swagger";
import { ParseUnixTimestampPipe } from "../common/pipes/parse-unix-timestamp.pipe";

import {
  GetAllTransactionsResponse,
  GetPollingTransactionsResponse,
  GetSingleTransactionResponse,
} from "@flowser/shared";

@Controller()
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get("/transactions")
  async findAll() {
    const transactions = await this.transactionsService.findAll();
    return GetAllTransactionsResponse.fromPartial({
      transactions: transactions.map((transaction) => transaction.toProto()),
    });
  }

  @Get("/transactions/polling")
  @UseInterceptors(
    new PollingResponseInterceptor(GetPollingTransactionsResponse)
  )
  async findAllNew(@Query("timestamp", ParseUnixTimestampPipe) timestamp) {
    const transactions =
      await this.transactionsService.findAllNewerThanTimestamp(timestamp);
    return transactions.map((transaction) => transaction.toProto());
  }

  @ApiParam({ name: "id", type: String })
  @Get("/blocks/:id/transactions")
  async findAllByBlock(@Param("id") blockId) {
    const transactions = await this.transactionsService.findAllByBlock(blockId);
    return GetAllTransactionsResponse.fromPartial({
      transactions: transactions.map((transaction) => transaction.toProto()),
    });
  }

  @ApiParam({ name: "id", type: String })
  @ApiQuery({ name: "timestamp", type: Number })
  @Get("/blocks/:id/transactions/polling")
  @UseInterceptors(
    new PollingResponseInterceptor(GetPollingTransactionsResponse)
  )
  async findAllNewByBlock(
    @Param("id") blockId,
    @Query("timestamp", ParseUnixTimestampPipe) timestamp
  ) {
    const transactions =
      await this.transactionsService.findAllNewerThanTimestampByBlock(
        blockId,
        timestamp
      );
    return transactions.map((transaction) => transaction.toProto());
  }

  @ApiParam({ name: "id", type: String })
  @ApiQuery({ name: "timestamp", type: Number })
  @Get("/accounts/:address/transactions/polling")
  @UseInterceptors(
    new PollingResponseInterceptor(GetPollingTransactionsResponse)
  )
  async findAllNewByAccount(
    @Param("address") accountAddress,
    @Query("timestamp", ParseUnixTimestampPipe) timestamp
  ) {
    const transactions =
      await this.transactionsService.findAllNewerThanTimestampByAccount(
        accountAddress,
        timestamp
      );
    return transactions.map((transaction) => transaction.toProto());
  }

  @ApiParam({ name: "id", type: String })
  @Get("/transactions/:id")
  async findOne(@Param("id") id: string) {
    const transaction = await this.transactionsService.findOne(id);
    return GetSingleTransactionResponse.fromPartial({
      transaction: transaction.toProto(),
    });
  }
}
