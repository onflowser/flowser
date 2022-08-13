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
    FlowConfigService,
    FlowActionsService,
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
