import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {FlowAggregatorService} from "./flow-aggregator.service";
import { BlocksModule } from "../blocks/blocks.module";
import { FlowGatewayService } from "./flow-gateway.service";
import { AccountsModule } from "../accounts/accounts.module";
import { EventsModule } from "../events/events.module";
import { TransactionsModule } from "../transactions/transactions.module";

@Module({
  imports: [
    TypeOrmModule.forFeature(),
    BlocksModule,
    AccountsModule,
    BlocksModule,
    EventsModule,
    TransactionsModule
  ],
  providers: [
    FlowAggregatorService,
    FlowGatewayService
  ],
  exports: [
    FlowGatewayService
  ]
})
export class FlowModule {
}
