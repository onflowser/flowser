import { Module } from "@nestjs/common";
import { BlocksModule } from "../blocks/blocks.module";
import { AccountsModule } from "../accounts/accounts.module";
import { EventsModule } from "../events/events.module";
import { TransactionsModule } from "../transactions/transactions.module";
import { CoreModule } from "../core/core.module";
import { ProcessorService } from "./services/processor.service";
import { FlowModule } from "../flow/flow.module";
import { SubscriptionService } from "./services/subscription.service";
import { ProcessesModule } from "../processes/processes.module";
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [
    BlocksModule,
    AccountsModule,
    BlocksModule,
    EventsModule,
    FlowModule,
    TransactionsModule,
    CoreModule,
    ProcessesModule,
    WalletModule
  ],
  providers: [ProcessorService, SubscriptionService],
  exports: [ProcessorService],
})
export class DataProcessingModule {}
