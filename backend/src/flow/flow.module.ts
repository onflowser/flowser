import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FlowGatewayService } from "../../../packages/core/src/flow/flow-gateway.service";
import { FlowController } from "./flow.controller";
import { FlowEmulatorService } from "../../../packages/core/src/flow/flow-emulator.service";
import { FlowCliService } from "./services/cli.service";
import { FlowConfigService } from "../../../packages/core/src/flow/flow-config.service";
import { FlowAccountStorageService } from "./services/storage.service";
import { SnapshotEntity } from "./entities/snapshot.entity";
import { FlowSnapshotService } from "./services/snapshot.service";
import { ProcessesModule } from "../processes/processes.module";
import { CoreModule } from "../core/core.module";
import { BlocksModule } from "../blocks/blocks.module";
import { FlowTemplatesService } from "./services/templates.service";
import { GoBindingsModule } from "../go-bindings/go-bindings.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([SnapshotEntity]),
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
    FlowTemplatesService,
    FlowGatewayService,
    FlowEmulatorService,
    FlowCliService,
    FlowConfigService,
    FlowAccountStorageService,
    FlowSnapshotService,
  ],
  exports: [
    FlowTemplatesService,
    FlowGatewayService,
    FlowEmulatorService,
    FlowCliService,
    FlowConfigService,
    FlowAccountStorageService,
    FlowSnapshotService,
  ],
})
export class FlowModule {}
