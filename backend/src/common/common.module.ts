import { Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { CommonController } from './common.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Log } from '../logs/entities/log.entity';
import { AccountsModule } from '../accounts/accounts.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Log]),
        AccountsModule
    ],
    controllers: [CommonController],
    providers: [CommonService]
})
export class CommonModule {
}
