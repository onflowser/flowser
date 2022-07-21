import { Controller, Get, Param, UseInterceptors, Query } from "@nestjs/common";
import { ContractsService } from "../services/contracts.service";
import { PollingResponseInterceptor } from "../../shared/interceptors/polling-response.interceptor";
import { ApiParam } from "@nestjs/swagger";
import { ParseUnixTimestampPipe } from "../../shared/pipes/parse-unix-timestamp.pipe";

@Controller("contracts")
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Get()
  findAll() {
    return this.contractsService.findAll();
  }

  @Get("/polling")
  @UseInterceptors(PollingResponseInterceptor)
  findAllNew(@Query("timestamp", ParseUnixTimestampPipe) timestamp) {
    return this.contractsService.findAllNewerThanTimestamp(timestamp);
  }

  @ApiParam({ name: "id", type: String })
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.contractsService.findOne(id);
  }
}
