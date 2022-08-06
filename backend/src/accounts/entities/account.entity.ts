import { PollingEntity } from "../../common/entities/polling.entity";
import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { AccountKey } from "./key.entity";
import { AccountContract } from "./contract.entity";
import { AccountsStorage } from "./storage.entity";
import { ensurePrefixedAddress } from "../../utils";
import { FlowAccount } from "../../flow/services/flow-gateway.service";

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

  static create(flowAccount: FlowAccount): Account {
    const account = Object.assign<Account, FlowAccount>(
      new Account(),
      flowAccount
    );
    account.address = ensurePrefixedAddress(flowAccount.address);
    return account;
  }
}
