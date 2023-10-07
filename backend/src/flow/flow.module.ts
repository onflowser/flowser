import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FlowGatewayService } from "../../../packages/core/src/flow/flow-gateway.service";
import { FlowController } from "./flow.controller";
import { FlowEmulatorService } from "../../../packages/core/src/flow/flow-emulator.service";
import { FlowCliService } from "../../../packages/core/src/flow/flow-cli.service";
import { FlowConfigService } from "../../../packages/core/src/flow/flow-config.service";
import { FlowAccountStorageService } from "../../../packages/core/src/flow/flow-storage.service";
import { FlowSnapshot } from "../../../packages/core/src/flow/flow-snapshot";
import { FlowSnapshotsService } from "../../../packages/core/src/flow/flow-snapshots.service";
import { ProcessesModule } from "../processes/processes.module";
import { CoreModule } from "../core/core.module";
import { BlocksModule } from "../blocks/blocks.module";
import { FlowInteractionsService } from "../../../packages/core/src/flow/flow-interactions.service";
import { GoBindingsModule } from "../go-bindings/go-bindings.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([FlowSnapshot]),
    ProcessesModule,
    // We need this to perform blockchain cache removal in snapshot service.
    BlocksModule,
    // We only need to import core module,
    // to access data removal service from snapshots service.
    // Otherwise, this module shouldn't depend on many other modules.
    CoreModule,
    GoBindingsModule,
  ],
  controllers: [FlowController],
  providers: [
    FlowInteractionsService,
    FlowGatewayService,
    FlowEmulatorService,
    FlowCliService,
    FlowConfigService,
    FlowAccountStorageService,
    FlowSnapshotsService,
  ],
  exports: [
    FlowInteractionsService,
    FlowGatewayService,
    FlowEmulatorService,
    FlowCliService,
    FlowConfigService,
    FlowAccountStorageService,
    FlowSnapshotsService,
  ],
})
export class FlowModule {}
