import { Module } from "@nestjs/common";
import { CommonService } from "./common.service";
import { CommonController } from "./common.controller";
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
  ],
  controllers: [CommonController],
  providers: [CommonService],
})
export class CommonModule {}
