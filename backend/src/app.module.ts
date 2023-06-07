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
import { FlowModule } from "./flow/flow.module";
import { CoreModule } from "./core/core.module";
import { getDatabaseOptions } from "./database";
import { ProcessesModule } from "./processes/processes.module";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { WalletModule } from "./wallet/wallet.module";

@Global()
@Module({
  providers: [AppService],
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "static"),
    }),
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({ useFactory: getDatabaseOptions }),
    ScheduleModule.forRoot(),
    ProjectsModule,
    AccountsModule,
    BlocksModule,
    TransactionsModule,
    EventsModule,
    FlowModule,
    CoreModule,
    ProcessesModule,
    WalletModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
