import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { Project } from './entities/project.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlowModule } from '../flow/flow.module';
import { AccountsModule } from '../accounts/accounts.module';
import { BlocksModule } from '../blocks/blocks.module';
import { EventsModule } from '../events/events.module';
import { LogsModule } from '../logs/logs.module';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Project]),
        FlowModule,
        AccountsModule,
        BlocksModule,
        EventsModule,
        LogsModule,
        TransactionsModule,
    ],
    controllers: [ProjectsController],
    providers: [ProjectsService],
    exports: [ProjectsService],
})
export class ProjectsModule {}
