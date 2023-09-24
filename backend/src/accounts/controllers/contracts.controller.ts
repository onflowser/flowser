import {
  Controller,
  Get,
  Param,
  UseInterceptors,
  Body,
  Post,
} from "@nestjs/common";
import { ContractsService } from "../services/contracts.service";
import { PollingResponseInterceptor } from "../../core/interceptors/polling-response.interceptor";
import { ApiParam } from "@nestjs/swagger";
import {
  GetSingleContractResponse,
  GetPollingContractsResponse,
  GetAllContractsResponse,
  GetPollingContractsRequest,
  GetPollingContractsByAccountRequest,
  AccountContract,
} from "@flowser/shared";
import { AccountContractEntity } from "../entities/contract.entity";
import { FlowConfigService } from "../../flow/services/config.service";

@Controller()
export class ContractsController {
  constructor(
    private readonly contractsService: ContractsService,
    private readonly flowConfigService: FlowConfigService
  ) {}

  @Get("contracts")
  async findAll() {
    const contracts = await this.contractsService.findAll();
    return GetAllContractsResponse.toJSON({
      contracts: contracts.map((contract) => this.toProto(contract)),
    });
  }

  @Post("contracts/polling")
  @UseInterceptors(new PollingResponseInterceptor(GetPollingContractsResponse))
  async findAllNew(@Body() data: unknown) {
    const request = GetPollingContractsRequest.fromJSON(data);
    const contracts = await this.contractsService.findAllNewerThanTimestamp(
      new Date(request.timestamp)
    );
    return contracts.map((contract) => this.toProto(contract));
  }

  @ApiParam({ name: "id", type: String })
  @Post("/accounts/:address/contracts/polling")
  @UseInterceptors(new PollingResponseInterceptor(GetPollingContractsResponse))
  async findAllNewByAccount(
    @Param("address") accountAddress: string,
    @Body() data: unknown
  ) {
    const request = GetPollingContractsByAccountRequest.fromJSON(data);
    const contracts =
      await this.contractsService.findAllNewerThanTimestampByAccount(
        accountAddress,
        new Date(request.timestamp)
      );
    return contracts.map((contract) => this.toProto(contract));
  }

  @ApiParam({ name: "id", type: String })
  @Get("contracts/:id")
  async findOne(@Param("id") id: string) {
    const contract = await this.contractsService.findOne(id);
    return GetSingleContractResponse.toJSON({
      contract: this.toProto(contract),
    });
  }

  private toProto(contract: AccountContractEntity): AccountContract {
    const localContractConfig = this.flowConfigService
      .getContracts()
      .find((localContract) => localContract.name === contract.name);

    return {
      id: contract.id,
      accountAddress: contract.accountAddress,
      name: contract.name,
      code: contract.code,
      createdAt: contract.createdAt.toISOString(),
      updatedAt: contract.updatedAt.toISOString(),
      localConfig: localContractConfig
        ? {
            absolutePath: localContractConfig.absolutePath,
            relativePath: localContractConfig.relativePath,
          }
        : undefined,
    };
  }
}
