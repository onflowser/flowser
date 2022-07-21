import { Controller, Get, Param, UseInterceptors, Query } from "@nestjs/common";
import { AccountsService } from "../services/accounts.service";
import { PollingResponseInterceptor } from "../../shared/interceptors/polling-response.interceptor";
import { ApiParam } from "@nestjs/swagger";
import { ParseUnixTimestampPipe } from "../../shared/pipes/parse-unix-timestamp.pipe";

@Controller("accounts")
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  findAll() {
    return this.accountsService.findAll();
  }

  @Get("/polling")
  @UseInterceptors(PollingResponseInterceptor)
  async findAllNew(@Query("timestamp", ParseUnixTimestampPipe) timestamp) {
    return this.accountsService.findAllNewerThanTimestamp(timestamp);
  }

  @ApiParam({ name: "address", type: String })
  @Get(":address")
  findOne(@Param("address") address: string) {
    return this.accountsService.findOneByAddress(address);
  }
}
