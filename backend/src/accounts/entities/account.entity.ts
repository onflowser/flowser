import { PollingEntity } from "../../common/entities/polling.entity";
import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { AccountKey } from "./key.entity";
import { AccountContract } from "./contract.entity";
import { FlowAccount } from "../../flow/types";
import { AccountsStorage } from "./storage.entity";

@Entity({ name: "accounts" })
export class Account extends PollingEntity {
  @PrimaryColumn()
  address: string;

  @Column({ type: "bigint" })
  balance: number;

  @Column()
  code: string;

  @OneToMany(() => AccountKey, (key) => key.account)
  keys: AccountKey[];

  @OneToMany(() => AccountsStorage, (storage) => storage.account)
  storage: AccountsStorage[];

  @OneToMany(() => AccountContract, (contract) => contract.account)
  contracts: AccountContract[];

  static init(flowAccountObject: FlowAccount): Account {
    const account = Object.assign<Account, FlowAccount>(
      new Account(),
      flowAccountObject
    );
    account.address = flowAccountObject.address;
    return account;
  }
}
