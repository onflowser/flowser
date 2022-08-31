import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FlowAggregatorService } from "./services/aggregator.service";
import { BlocksModule } from "../blocks/blocks.module";
import { AccountsModule } from "../accounts/accounts.module";
import { EventsModule } from "../events/events.module";
import { TransactionsModule } from "../transactions/transactions.module";
import { FlowGatewayService } from "./services/gateway.service";
import { FlowController } from "./flow.controller";
import { FlowEmulatorService } from "./services/emulator.service";
import { LogsModule } from "../logs/logs.module";
import { FlowCliService } from "./services/cli.service";
import { FlowSubscriptionService } from "./services/subscription.service";
import { FlowConfigService } from "./services/config.service";
import { FlowActionsService } from "./services/actions.service";
import { FlowAccountStorageService } from "./services/storage.service";
import { SnapshotEntity } from "./entities/snapshot.entity";
import { FlowSnapshotService } from "./services/snapshot.service";
import { CommonModule } from "../common/common.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([SnapshotEntity]),
    LogsModule,
    BlocksModule,
    AccountsModule,
    BlocksModule,
    EventsModule,
    TransactionsModule,
    CommonModule,
  ],
  controllers: [FlowController],
  providers: [
    FlowAggregatorService,
    FlowGatewayService,
    FlowEmulatorService,
    FlowCliService,
    FlowSubscriptionService,
    FlowConfigService,
    FlowActionsService,
    FlowAccountStorageService,
    FlowSnapshotService,
  ],
  exports: [
    FlowAggregatorService,
    FlowGatewayService,
    FlowEmulatorService,
    FlowCliService,
    FlowConfigService,
    FlowActionsService,
  ],
})
export class FlowModule {}
