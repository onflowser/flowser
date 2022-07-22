import { Module } from "@nestjs/common";
import { AccountsService } from "./services/accounts.service";
import { AccountsController } from "./controllers/accounts.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Account } from "./entities/account.entity";
import { ContractsController } from "./controllers/contracts.controller";
import { ContractsService } from "./services/contracts.service";
import { Transaction } from "../transactions/entities/transaction.entity";
import { AccountContract } from "./entities/contract.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Account, AccountContract, Transaction])],
  controllers: [AccountsController, ContractsController],
  providers: [AccountsService, ContractsService],
  exports: [AccountsService, ContractsService],
})
export class AccountsModule {}
