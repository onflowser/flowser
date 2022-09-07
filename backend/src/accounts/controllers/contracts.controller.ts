import {
  Controller,
  Get,
  Param,
  UseInterceptors,
  Body,
  Post,
} from "@nestjs/common";
import { ContractsService } from "../services/contracts.service";
import { PollingResponseInterceptor } from "../../common/interceptors/polling-response.interceptor";
import { ApiParam } from "@nestjs/swagger";
import {
  GetSingleContractResponse,
  GetPollingContractsResponse,
  GetAllContractsResponse,
  GetPollingContractsRequest,
  GetPollingContractsByAccountRequest,
} from "@flowser/shared";

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

  @Post("contracts/polling")
  @UseInterceptors(new PollingResponseInterceptor(GetPollingContractsResponse))
  async findAllNew(@Body() data) {
    const request = GetPollingContractsRequest.fromJSON(data);
    const contracts = await this.contractsService.findAllNewerThanTimestamp(
      new Date(request.timestamp)
    );
    return contracts.map((contract) => contract.toProto());
  }

  @ApiParam({ name: "id", type: String })
  @Post("/accounts/:address/contracts/polling")
  @UseInterceptors(new PollingResponseInterceptor(GetPollingContractsResponse))
  async findAllNewByAccount(@Param("address") accountAddress, @Body() data) {
    const request = GetPollingContractsByAccountRequest.fromJSON(data);
    const contracts =
      await this.contractsService.findAllNewerThanTimestampByAccount(
        accountAddress,
        new Date(request.timestamp)
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
