import { PollingEntity } from "../../core/entities/polling.entity";
import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { AccountKeyEntity } from "./key.entity";
import { AccountContractEntity } from "./contract.entity";
import { Account } from "@flowser/shared";
import { TransactionEntity } from "../../transactions/entities/transaction.entity";
import { AccountStorageItemEntity } from "./storage-item.entity";

@Entity({ name: "accounts" })
export class AccountEntity extends PollingEntity {
  @PrimaryColumn()
  address: string;

  @Column({ type: "bigint" })
  balance: number;

  @Column()
  code: string;

  @Column({ default: false })
  isDefaultAccount: boolean;

  @OneToMany(() => AccountKeyEntity, (key) => key.account, {
    eager: true,
  })
  keys: AccountKeyEntity[];

  @OneToMany(() => AccountStorageItemEntity, (storage) => storage.account, {
    eager: true,
  })
  storage: AccountStorageItemEntity[];

  @OneToMany(() => AccountContractEntity, (contract) => contract.account, {
    eager: true,
  })
  contracts: AccountContractEntity[];

  @OneToMany(() => TransactionEntity, (key) => key.payer, {
    eager: true,
  })
  transactions: TransactionEntity[];

  toProto(): Account {
    return {
      address: this.address,
      balance: this.balance,
      code: this.code,
      storage: this.storage.map((storage) => storage.toProto()),
      keys: this.keys.map((key) => key.toProto()),
      contracts: this.contracts.map((contract) => contract.toProto()),
      transactions: this.transactions.map((transaction) =>
        transaction.toProto()
      ),
      isDefaultAccount: this.isDefaultAccount,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
