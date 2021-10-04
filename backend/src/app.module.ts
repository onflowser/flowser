import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProjectsModule } from './projects/projects.module';
import { AccountsModule } from './accounts/accounts.module';
import { BlocksModule } from './blocks/blocks.module';
import { TransactionsModule } from './transactions/transactions.module';
import { EventsModule } from './events/events.module';
import { LogsModule } from './logs/logs.module';
import { FlowModule } from "./flow/flow.module";

const mongoUser = process.env.MONGODB_USERNAME;
const mongoPassword = process.env.MONGODB_PASSWORD;
const mongoHostname = process.env.MONGODB_HOST;
const mongoPort = process.env.MONGODB_PORT;
const mongoDatabase = process.env.MONGODB_DATABASE;
const url = `mongodb://${mongoUser}:${mongoPassword}@${mongoHostname}:${mongoPort}/${mongoDatabase}`;

@Global()
@Module({
    providers: [
        AppService,
    ],
    imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forRoot({
            type: 'mongodb',
            url,
            useNewUrlParser: true,
            autoLoadEntities: true,
        }),
        ScheduleModule.forRoot(),
        ProjectsModule,
        AccountsModule,
        BlocksModule,
        TransactionsModule,
        EventsModule,
        LogsModule,
        FlowModule
    ],
    controllers: [AppController]
})
export class AppModule {
}
