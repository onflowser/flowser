import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AccountsModule } from './accounts/accounts.module';

const mongoUser = process.env.MONGODB_USERNAME;
const mongoPassword = process.env.MONGODB_PASSWORD;
const mongoHostname = process.env.MONGODB_HOST;
const mongoPort = process.env.MONGODB_PORT;
const mongoDatabase = process.env.MONGODB_DATABASE;
const url = `mongodb://${mongoUser}:${mongoPassword}@${mongoHostname}:${mongoPort}/${mongoDatabase}`;

@Module({
    imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forRoot({
            type: 'mongodb',
            url,
            useNewUrlParser: true,
            entities: [
                __dirname + '/**/*.entity.ts',
            ]
        }),
        AccountsModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {
}
