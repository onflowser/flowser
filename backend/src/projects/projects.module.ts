import { Module } from "@nestjs/common";
import { ProjectsService } from "./projects.service";
import { ProjectsController } from "./projects.controller";
import { ProjectEntity } from "./project.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FlowModule } from "../flow/flow.module";
import { AccountsModule } from "../accounts/accounts.module";
import { BlocksModule } from "../blocks/blocks.module";
import { EventsModule } from "../events/events.module";
import { TransactionsModule } from "../transactions/transactions.module";
import { CoreModule } from "../core/core.module";
import { WalletModule } from "../wallet/wallet.module";
import { DataProcessingModule } from "../data-processing/data-processing.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([ProjectEntity]),
    FlowModule,
    AccountsModule,
    BlocksModule,
    EventsModule,
    TransactionsModule,
    CoreModule,
    WalletModule,
    DataProcessingModule,
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
