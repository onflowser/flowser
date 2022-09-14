import { Module } from "@nestjs/common";
import { CommonService } from "./services/common.service";
import { AccountsModule } from "../accounts/accounts.module";
import { BlocksModule } from "../blocks/blocks.module";
import { TransactionsModule } from "../transactions/transactions.module";
import { EventsModule } from "../events/events.module";

@Module({
  imports: [
    AccountsModule,
    BlocksModule,
    TransactionsModule,
    EventsModule,
    CoreModule,
  ],
  providers: [CommonService],
  exports: [CommonService],
})
export class CoreModule {}
