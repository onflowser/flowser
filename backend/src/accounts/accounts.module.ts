import { forwardRef, Module } from '@nestjs/common';
import { AccountsService } from "./services/accounts.service";
import { AccountsController } from "./controllers/accounts.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AccountEntity } from "./entities/account.entity";
import { ContractsController } from "./controllers/contracts.controller";
import { ContractsService } from "./services/contracts.service";
import { TransactionEntity } from "../transactions/transaction.entity";
import { AccountContractEntity } from "./entities/contract.entity";
import { AccountKeyEntity } from "./entities/key.entity";
import { AccountStorageItemEntity } from "./entities/storage-item.entity";
import { KeysService } from "./services/keys.service";
import { AccountStorageService } from "./services/storage.service";
import { FlowModule } from '../flow/flow.module';

@Module({
  imports: [
    forwardRef(() => FlowModule),
    TypeOrmModule.forFeature([
      AccountEntity,
      AccountContractEntity,
      AccountKeyEntity,
      AccountStorageItemEntity,
      TransactionEntity,
    ]),
  ],
  controllers: [AccountsController, ContractsController],
  providers: [
    AccountsService,
    AccountStorageService,
    ContractsService,
    KeysService,
  ],
  exports: [
    AccountsService,
    AccountStorageService,
    ContractsService,
    KeysService,
  ],
})
export class AccountsModule {}
