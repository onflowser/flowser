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
import { StorageService } from "./services/storage.service";
import { FlowSubscriptionService } from "./services/subscription.service";

@Module({
  imports: [
    TypeOrmModule.forFeature(),
    LogsModule,
    BlocksModule,
    AccountsModule,
    BlocksModule,
    EventsModule,
    TransactionsModule,
  ],
  controllers: [FlowController],
  providers: [
    FlowAggregatorService,
    FlowGatewayService,
    FlowEmulatorService,
    FlowCliService,
    FlowSubscriptionService,
    StorageService,
  ],
  exports: [
    FlowAggregatorService,
    FlowGatewayService,
    FlowEmulatorService,
    FlowCliService,
    StorageService,
  ],
})
export class FlowModule {}
