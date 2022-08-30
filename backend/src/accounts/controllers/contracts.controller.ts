import { Controller, Get, Param, UseInterceptors, Query } from "@nestjs/common";
import { ContractsService } from "../services/contracts.service";
import { PollingResponseInterceptor } from "../../common/interceptors/polling-response.interceptor";
import { ApiParam, ApiQuery } from "@nestjs/swagger";
import { ParseUnixTimestampPipe } from "../../common/pipes/parse-unix-timestamp.pipe";
import {
  GetSingleContractResponse,
  GetPollingContractsResponse,
  GetAllContractsResponse,
} from "@flowser/types";

@Controller()
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Get("contracts")
  async findAll() {
    const contracts = await this.contractsService.findAll();
    return GetAllContractsResponse.toJSON({
      contracts: contracts.map((contract) => contract.toProto()),
    });
  }

  @Get("contracts/polling")
  @UseInterceptors(new PollingResponseInterceptor(GetPollingContractsResponse))
  async findAllNew(@Query("timestamp", ParseUnixTimestampPipe) timestamp) {
    const contracts = await this.contractsService.findAllNewerThanTimestamp(
      timestamp
    );
    return contracts.map((contract) => contract.toProto());
  }

  @ApiParam({ name: "id", type: String })
  @ApiQuery({ name: "timestamp", type: Number })
  @Get("/accounts/:address/contracts/polling")
  @UseInterceptors(new PollingResponseInterceptor(GetPollingContractsResponse))
  async findAllNewByAccount(
    @Param("address") accountAddress,
    @Query("timestamp", ParseUnixTimestampPipe) timestamp
  ) {
    const contracts =
      await this.contractsService.findAllNewerThanTimestampByAccount(
        accountAddress,
        timestamp
      );
    return contracts.map((transaction) => transaction.toProto());
  }

  @ApiParam({ name: "id", type: String })
  @Get("contracts/:id")
  async findOne(@Param("id") id: string) {
    const contract = await this.contractsService.findOne(id);
    return GetSingleContractResponse.toJSON({
      contract: contract.toProto(),
    });
  }
}
