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
import { FlowAccountStorageService } from "./services/storage.service";
import { SnapshotEntity } from "./entities/snapshot.entity";
import { FlowSnapshotService } from "./services/snapshot.service";
import { CoreModule } from "../core/core.module";
import { FlowDevWalletService } from "./services/dev-wallet.service";
import { ProcessesModule } from "../processes/processes.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([SnapshotEntity]),
    LogsModule,
    BlocksModule,
    AccountsModule,
    BlocksModule,
    EventsModule,
    TransactionsModule,
    CoreModule,
    ProcessesModule,
  ],
  controllers: [FlowController],
  providers: [
    FlowAggregatorService,
    FlowGatewayService,
    FlowEmulatorService,
    FlowCliService,
    FlowSubscriptionService,
    FlowConfigService,
    FlowAccountStorageService,
    FlowSnapshotService,
    FlowDevWalletService,
  ],
  exports: [
    FlowAggregatorService,
    FlowGatewayService,
    FlowEmulatorService,
    FlowCliService,
    FlowConfigService,
    FlowDevWalletService,
  ],
})
export class FlowModule {}
