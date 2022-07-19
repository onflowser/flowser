import { Controller, Get } from "@nestjs/common";
import { CommonService } from "./common.service";

@Controller("common")
export class CommonController {
  constructor(private readonly commonService: CommonService) {}

  @Get("counters")
  async getCounters() {
    return await this.commonService.getCounters();
  }
}
