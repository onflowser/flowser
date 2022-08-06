import { Module } from "@nestjs/common";
import { AccountsService } from "./services/accounts.service";
import { AccountsController } from "./controllers/accounts.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AccountEntity } from "./entities/account.entity";
import { ContractsController } from "./controllers/contracts.controller";
import { ContractsService } from "./services/contracts.service";
import { TransactionEntity } from "../transactions/entities/transaction.entity";
import { AccountContractEntity } from "./entities/contract.entity";
import { AccountKeyEntity } from "./entities/key.entity";
import { AccountsStorageEntity } from "./entities/storage.entity";
import { KeysService } from "./services/keys.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AccountEntity,
      AccountContractEntity,
      AccountKeyEntity,
      AccountsStorageEntity,
      TransactionEntity,
    ]),
  ],
  controllers: [AccountsController, ContractsController],
  providers: [AccountsService, ContractsService, KeysService],
  exports: [AccountsService, ContractsService, KeysService],
})
export class AccountsModule {}
