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
  GetPollingStorageResponse,
} from "@flowser/types/generated/responses/accounts";
import { KeysService } from "../services/keys.service";
import { AccountStorageService } from "../services/storage.service";

@Controller("accounts")
export class AccountsController {
  constructor(
    private readonly accountsService: AccountsService,
    private readonly keysService: KeysService,
    private readonly storageService: AccountStorageService
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

  @ApiParam({ name: "address", type: String })
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
  @ApiQuery({ name: "timestamp", type: Number })
  @Get(":address/storage/polling")
  @UseInterceptors(new PollingResponseInterceptor(GetPollingStorageResponse))
  async findAllNewStorageByAccount(
    @Param("address") accountAddress,
    @Query("timestamp", ParseUnixTimestampPipe) timestamp
  ) {
    const storageItems =
      await this.storageService.findAllNewerThanTimestampByAccount(
        accountAddress,
        timestamp
      );
    return storageItems.map((storageItem) => storageItem.toProto());
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
