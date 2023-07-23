import { Module } from "@nestjs/common";
import { BlocksModule } from "../blocks/blocks.module";
import { AccountsModule } from "../accounts/accounts.module";
import { EventsModule } from "../events/events.module";
import { TransactionsModule } from "../transactions/transactions.module";
import { CoreModule } from "../core/core.module";
import { ProcessorService } from "./processor.service";
import { FlowModule } from "../flow/flow.module";
import { ProcessesModule } from "../processes/processes.module";
import { WalletModule } from "../wallet/wallet.module";
import { InteractionsModule } from '../interactions/interactions.module';

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
    WalletModule,
    InteractionsModule
  ],
  providers: [ProcessorService],
  exports: [ProcessorService],
})
export class DataProcessingModule {}
