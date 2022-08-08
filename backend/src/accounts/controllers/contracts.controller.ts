import { Controller, Get, Param, UseInterceptors, Query } from "@nestjs/common";
import { ContractsService } from "../services/contracts.service";
import { PollingResponseInterceptor } from "../../common/interceptors/polling-response.interceptor";
import { ApiParam } from "@nestjs/swagger";
import { ParseUnixTimestampPipe } from "../../common/pipes/parse-unix-timestamp.pipe";
import {
  GetSingleContractResponse,
  GetPollingContractsResponse,
  GetAllContractsResponse,
} from "@flowser/types/generated/responses/contracts";

@Controller("contracts")
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Get()
  async findAll() {
    const contracts = await this.contractsService.findAll();
    return GetAllContractsResponse.toJSON({
      contracts: contracts.map((contract) => contract.toProto()),
    });
  }

  @Get("/polling")
  @UseInterceptors(new PollingResponseInterceptor(GetPollingContractsResponse))
  async findAllNew(@Query("timestamp", ParseUnixTimestampPipe) timestamp) {
    const contracts = await this.contractsService.findAllNewerThanTimestamp(
      timestamp
    );
    return contracts.map((contract) => contract.toProto());
  }

  @ApiParam({ name: "id", type: String })
  @Get(":id")
  async findOne(@Param("id") id: string) {
    const contract = await this.contractsService.findOne(id);
    return GetSingleContractResponse.toJSON({
      contract: contract.toProto(),
    });
  }
}
