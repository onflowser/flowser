import { Module } from "@nestjs/common";
import { CommonService } from "./common.service";
import { AccountsModule } from "../accounts/accounts.module";
import { BlocksModule } from "../blocks/blocks.module";
import { TransactionsModule } from "../transactions/transactions.module";
import { LogsModule } from "../logs/logs.module";
import { EventsModule } from "../events/events.module";

@Module({
  imports: [
    AccountsModule,
    BlocksModule,
    TransactionsModule,
    LogsModule,
    EventsModule,
    AccountsModule,
    BlocksModule,
    EventsModule,
    LogsModule,
    TransactionsModule,
    CommonModule,
  ],
  providers: [CommonService],
  exports: [CommonService],
})
export class CommonModule {}
