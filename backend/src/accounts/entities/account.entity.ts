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

  @Column("json")
  keys: AccountKey[];

  @Column("json", { nullable: true })
  storage: AccountsStorage[];

  @OneToMany(() => AccountContract, (contract) => contract.account)
  contracts: AccountContract[];

  static init(
    flowAccountObject: FlowAccount,
    options?: Partial<Account>
  ): Account {
    const { keys, contracts } = flowAccountObject;
    const account = Object.assign<Account, FlowAccount, Partial<Account>>(
      new Account(),
      flowAccountObject,
      options
    );
    account.address = flowAccountObject.address;
    account.keys = keys.map((key) => AccountKey.init(key));
    account.contracts = Object.keys(contracts).map((name) =>
      AccountContract.init(flowAccountObject.address, name, contracts[name])
    ) as AccountContract[] & Map<string, string>;
    return account;
  }
}
