import {
  Controller,
  Get,
  Param,
  UseInterceptors,
  Body,
  Post,
} from "@nestjs/common";
import { TransactionsService } from "./transactions.service";
import { PollingResponseInterceptor } from "../core/interceptors/polling-response.interceptor";
import { ApiParam, ApiQuery } from "@nestjs/swagger";

import {
  GetAllTransactionsResponse,
  GetPollingTransactionsByAccountRequest,
  GetPollingTransactionsByBlockRequest,
  GetPollingTransactionsRequest,
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

  @Post("/transactions/polling")
  @UseInterceptors(
    new PollingResponseInterceptor(GetPollingTransactionsResponse)
  )
  async findAllNew(@Body() data: unknown) {
    const request = GetPollingTransactionsRequest.fromJSON(data);
    const transactions =
      await this.transactionsService.findAllNewerThanTimestamp(
        new Date(request.timestamp)
      );
    return transactions.map((transaction) => transaction.toProto());
  }

  @ApiParam({ name: "id", type: String })
  @Get("/blocks/:id/transactions")
  async findAllByBlock(@Param("id") blockId: string) {
    const transactions = await this.transactionsService.findAllByBlock(blockId);
    return GetAllTransactionsResponse.fromPartial({
      transactions: transactions.map((transaction) => transaction.toProto()),
    });
  }

  @ApiParam({ name: "id", type: String })
  @Post("/blocks/:id/transactions/polling")
  @UseInterceptors(
    new PollingResponseInterceptor(GetPollingTransactionsResponse)
  )
  async findAllNewByBlock(@Param("id") blockId: string, @Body() data: unknown) {
    const request = GetPollingTransactionsByBlockRequest.fromJSON(data);
    const transactions =
      await this.transactionsService.findAllNewerThanTimestampByBlock(
        blockId,
        new Date(request.timestamp)
      );
    return transactions.map((transaction) => transaction.toProto());
  }

  @ApiParam({ name: "id", type: String })
  @ApiQuery({ name: "timestamp", type: Number })
  @Post("/accounts/:address/transactions/polling")
  @UseInterceptors(
    new PollingResponseInterceptor(GetPollingTransactionsResponse)
  )
  async findAllNewByAccount(
    @Param("address") accountAddress: string,
    @Body() data: unknown
  ) {
    const request = GetPollingTransactionsByAccountRequest.fromJSON(data);
    const transactions =
      await this.transactionsService.findAllNewerThanTimestampByAccount(
        accountAddress,
        new Date(request.timestamp)
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
