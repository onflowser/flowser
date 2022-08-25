import { Controller, Get } from "@nestjs/common";
import { CommonService } from "./common.service";
import { GetAllObjectsCountsResponse } from "@flowser/types";

@Controller("common")
export class CommonController {
  constructor(private readonly commonService: CommonService) {}

  @Get("counters")
  async getCounters() {
    const counts = await this.commonService.getCounters();
    return GetAllObjectsCountsResponse.toJSON(counts);
  }
}
