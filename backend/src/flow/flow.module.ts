import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {FlowAggregatorService} from "./flow-aggregator.service";
import { BlocksModule } from "../blocks/blocks.module";
import { AccountsModule } from "../accounts/accounts.module";
import { EventsModule } from "../events/events.module";
import { TransactionsModule } from "../transactions/transactions.module";
import { ProjectsModule } from "../projects/projects.module";
import { FlowGatewayService } from "./flow-gateway.service";
import { FlowController } from "./flow.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature(),
    BlocksModule,
    AccountsModule,
    BlocksModule,
    EventsModule,
    TransactionsModule,
  ],
  controllers: [
    FlowController
  ],
  providers: [
    FlowAggregatorService,
    FlowGatewayService
  ],
  exports: [
    FlowAggregatorService,
    FlowGatewayService
  ]
})
export class FlowModule {
}
