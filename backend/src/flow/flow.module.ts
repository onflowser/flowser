import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FlowGatewayService } from "./services/gateway.service";
import { FlowController } from "./flow.controller";
import { FlowEmulatorService } from "./services/emulator.service";
import { FlowCliService } from "./services/cli.service";
import { FlowConfigService } from "./services/config.service";
import { FlowAccountStorageService } from "./services/storage.service";
import { SnapshotEntity } from "./entities/snapshot.entity";
import { FlowSnapshotService } from "./services/snapshot.service";
import { FlowDevWalletService } from "./services/dev-wallet.service";
import { ProcessesModule } from "../processes/processes.module";
import { CoreModule } from "../core/core.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([SnapshotEntity]),
    ProcessesModule,
    // We only need to import core module,
    // to access data removal service from snapshots service.
    // Otherwise, this module shouldn't depend on many other modules.
    CoreModule,
  ],
  controllers: [FlowController],
  providers: [
    FlowGatewayService,
    FlowEmulatorService,
    FlowCliService,
    FlowConfigService,
    FlowAccountStorageService,
    FlowSnapshotService,
    FlowDevWalletService,
  ],
  exports: [
    FlowGatewayService,
    FlowEmulatorService,
    FlowCliService,
    FlowConfigService,
    FlowDevWalletService,
    FlowAccountStorageService,
  ],
})
export class FlowModule {}
