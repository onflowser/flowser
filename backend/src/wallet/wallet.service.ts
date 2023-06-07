import { Injectable } from "@nestjs/common";
import { FlowConfigService } from "../flow/services/config.service";
import { ProcessManagerService } from "../processes/process-manager.service";

@Injectable()
export class WalletService {
  constructor(
    private configService: FlowConfigService,
    private processManagerService: ProcessManagerService
  ) {}
}
