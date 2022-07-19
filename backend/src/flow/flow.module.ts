import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlowAggregatorService } from './services/flow-aggregator.service';
import { BlocksModule } from '../blocks/blocks.module';
import { AccountsModule } from '../accounts/accounts.module';
import { EventsModule } from '../events/events.module';
import { TransactionsModule } from '../transactions/transactions.module';
import { FlowGatewayService } from './services/flow-gateway.service';
import { FlowController } from './flow.controller';
import { FlowEmulatorService } from './services/flow-emulator.service';
import { LogsModule } from '../logs/logs.module';
import { FlowCliService } from './services/flow-cli.service';
import { StorageDataService } from './services/storage-data.service';

@Module({
    imports: [
        TypeOrmModule.forFeature(),
        LogsModule,
        BlocksModule,
        AccountsModule,
        BlocksModule,
        EventsModule,
        TransactionsModule,
    ],
    controllers: [FlowController],
    providers: [FlowAggregatorService, FlowGatewayService, FlowEmulatorService, FlowCliService, StorageDataService],
    exports: [FlowAggregatorService, FlowGatewayService, FlowEmulatorService, FlowCliService, StorageDataService],
})
export class FlowModule {}
