import { Controller, Get, Param, UseInterceptors, Query } from "@nestjs/common";
import { AccountsService } from "../services/accounts.service";
import { PollingResponseInterceptor } from "../../common/interceptors/polling-response.interceptor";
import { ApiParam, ApiQuery } from "@nestjs/swagger";
import { ParseUnixTimestampPipe } from "../../common/pipes/parse-unix-timestamp.pipe";
import {
  GetPollingAccountsResponse,
  GetAllAccountsResponse,
  GetSingleAccountResponse,
  GetPollingKeysResponse,
} from "@flowser/types/generated/responses/accounts";
import { KeysService } from "../services/keys.service";

@Controller("accounts")
export class AccountsController {
  constructor(
    private readonly accountsService: AccountsService,
    private readonly keysService: KeysService
  ) {}

  @Get()
  async findAll() {
    const accounts = await this.accountsService.findAll();
    return GetAllAccountsResponse.toJSON({
      accounts: accounts.map((account) => account.toProto()),
    });
  }

  @ApiQuery({ name: "timestamp", type: Number })
  @Get("/polling")
  @UseInterceptors(new PollingResponseInterceptor(GetPollingAccountsResponse))
  async findAllNew(@Query("timestamp", ParseUnixTimestampPipe) timestamp) {
    const accounts = await this.accountsService.findAllNewerThanTimestamp(
      timestamp
    );
    return accounts.map((account) => account.toProto());
  }

  @ApiParam({ name: "id", type: String })
  @ApiQuery({ name: "timestamp", type: Number })
  @Get(":address/keys/polling")
  @UseInterceptors(new PollingResponseInterceptor(GetPollingKeysResponse))
  async findAllNewKeysByAccount(
    @Param("address") accountAddress,
    @Query("timestamp", ParseUnixTimestampPipe) timestamp
  ) {
    const keys = await this.keysService.findAllNewerThanTimestampByAccount(
      accountAddress,
      timestamp
    );
    return keys.map((key) => key.toProto());
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
