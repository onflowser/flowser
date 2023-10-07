import { Module } from "@nestjs/common";
import { BlocksModule } from "../blocks/blocks.module";
import { AccountsModule } from "../accounts/accounts.module";
import { EventsModule } from "../events/events.module";
import { TransactionsModule } from "../transactions/transactions.module";
import { CoreModule } from "../core/core.module";
import { IndexerService } from "@onflowser/indexer/src/indexer.service";
import { FlowModule } from "../flow/flow.module";
import { ProcessesModule } from "../processes/processes.module";
import { WalletModule } from "../wallet/wallet.module";
import { GoBindingsModule } from "../go-bindings/go-bindings.module";

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
    GoBindingsModule,
  ],
  providers: [IndexerService],
  exports: [IndexerService],
})
export class DataProcessingModule {}
