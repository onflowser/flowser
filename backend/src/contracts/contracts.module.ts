import { Module } from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { ContractsController } from './contracts.controller';
import { TypeOrmModule } from "@nestjs/typeorm";
import { AccountContract } from "../accounts/entities/contract.entity";

@Module({
  imports: [TypeOrmModule.forFeature([AccountContract])],
  controllers: [ContractsController],
  providers: [ContractsService],
  exports: [
    ContractsService
  ]
})
export class ContractsModule {}
