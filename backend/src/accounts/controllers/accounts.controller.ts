import {
  Controller,
  Get,
  Param,
  UseInterceptors,
  Body,
  Post,
} from "@nestjs/common";
import { AccountsService } from "../services/accounts.service";
import { PollingResponseInterceptor } from "../../core/interceptors/polling-response.interceptor";
import { ApiParam, ApiQuery } from "@nestjs/swagger";
import {
  GetPollingAccountsResponse,
  GetAllAccountsResponse,
  GetSingleAccountResponse,
  GetPollingKeysResponse,
  GetPollingStorageResponse,
  GetPollingStorageRequest,
  GetPollingAccountsRequest,
  GetPollingKeysRequest,
} from "@flowser/shared";
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
  @Post("/polling")
  @UseInterceptors(new PollingResponseInterceptor(GetPollingAccountsResponse))
  async findAllNew(@Body() data) {
    const request = GetPollingAccountsRequest.fromJSON(data);
    const accounts = await this.accountsService.findAllNewerThanTimestamp(
      new Date(request.timestamp)
    );
    return accounts.map((account) => account.toProto());
  }

  @ApiParam({ name: "address", type: String })
  @Post(":address/keys/polling")
  @UseInterceptors(new PollingResponseInterceptor(GetPollingKeysResponse))
  async findAllNewKeysByAccount(
    @Param("address") accountAddress,
    @Body() data
  ) {
    const request = GetPollingKeysRequest.fromJSON(data);
    const keys = await this.keysService.findAllNewerThanTimestampByAccount(
      accountAddress,
      new Date(request.timestamp)
    );
    return keys.map((key) => key.toProto());
  }

  @ApiParam({ name: "address", type: String })
  @Post(":address/storage/polling")
  @UseInterceptors(new PollingResponseInterceptor(GetPollingStorageResponse))
  async findAllNewStorageByAccount(
    @Param("address") accountAddress,
    @Body() data
  ) {
    const request = GetPollingStorageRequest.fromJSON(data);
    const storageItems =
      await this.storageService.findAllNewerThanTimestampByAccount(
        accountAddress,
        new Date(request.timestamp)
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
