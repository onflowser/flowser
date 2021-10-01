import { Module } from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { ContractsController } from './contracts.controller';
import { TypeOrmModule } from "@nestjs/typeorm";
import { Contract } from "./entities/contract.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Contract])],
  controllers: [ContractsController],
  providers: [ContractsService],
  exports: [
    ContractsService
  ]
})
export class ContractsModule {}
