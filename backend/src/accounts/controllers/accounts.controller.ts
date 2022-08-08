import { Controller, Get, Param, UseInterceptors, Query } from "@nestjs/common";
import { AccountsService } from "../services/accounts.service";
import { PollingResponseInterceptor } from "../../common/interceptors/polling-response.interceptor";
import { ApiParam } from "@nestjs/swagger";
import { ParseUnixTimestampPipe } from "../../common/pipes/parse-unix-timestamp.pipe";

import {
  GetPollingAccountsResponse,
  GetAllAccountsResponse,
  GetSingleAccountResponse,
} from "@flowser/types/generated/responses/accounts";

@Controller("accounts")
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  async findAll() {
    const accounts = await this.accountsService.findAll();
    return GetAllAccountsResponse.toJSON({
      accounts: accounts.map((account) => account.toProto()),
    });
  }

  @Get("/polling")
  @UseInterceptors(new PollingResponseInterceptor(GetPollingAccountsResponse))
  async findAllNew(@Query("timestamp", ParseUnixTimestampPipe) timestamp) {
    const accounts = await this.accountsService.findAllNewerThanTimestamp(
      timestamp
    );
    return accounts.map((account) => account.toProto());
  }

  @ApiParam({ name: "address", type: String })
  @Get(":address")
  async findOne(@Param("address") address: string) {
    const account = await this.accountsService.findOneByAddress(address);
    return GetSingleAccountResponse.toJSON({
      account: account.toProto(),
    });
  }
}
