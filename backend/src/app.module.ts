import { Global, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ScheduleModule } from "@nestjs/schedule";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ProjectsModule } from "./projects/projects.module";
import { AccountsModule } from "./accounts/accounts.module";
import { BlocksModule } from "./blocks/blocks.module";
import { TransactionsModule } from "./transactions/transactions.module";
import { EventsModule } from "./events/events.module";
import { LogsModule } from "./logs/logs.module";
import { FlowModule } from "./flow/flow.module";
import { CommonModule } from "./common/common.module";
import { getDatabaseOptions } from "./database";

@Global()
@Module({
  providers: [AppService],
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({ useFactory: getDatabaseOptions }),
    ScheduleModule.forRoot(),
    ProjectsModule,
    AccountsModule,
    BlocksModule,
    TransactionsModule,
    EventsModule,
    LogsModule,
    FlowModule,
    CommonModule,
  ],
  controllers: [AppController],
})
export class AppModule {
  constructor() {
    console.log("AppModule");
  }
}
