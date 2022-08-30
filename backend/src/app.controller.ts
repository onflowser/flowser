import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";
import { GetFlowserVersionResponse } from "@flowser/types";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("version")
  getVersion() {
    const version = this.appService.flowserVersion();
    return GetFlowserVersionResponse.fromJSON(version);
  }
}
