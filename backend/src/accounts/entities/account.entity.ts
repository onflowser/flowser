import { PollingEntity } from "../../common/entities/polling.entity";
import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { AccountKeyEntity } from "./key.entity";
import { AccountContractEntity } from "./contract.entity";
import { ensurePrefixedAddress } from "../../utils";
import { FlowAccount } from "../../flow/services/flow-gateway.service";
import { Account } from "@flowser/types";
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

  static create(flowAccount: FlowAccount): AccountEntity {
    const account = new AccountEntity();
    account.address = ensurePrefixedAddress(flowAccount.address);
    account.balance = flowAccount.balance;
    account.code = flowAccount.code;
    account.keys = flowAccount.keys.map((key) =>
      AccountKeyEntity.create(flowAccount, key)
    );
    return account;
  }

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
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
