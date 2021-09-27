import { Module } from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { ContractsController } from './contracts.controller';

@Module({
  controllers: [ContractsController],
  providers: [ContractsService]
})
export class ContractsModule {}
