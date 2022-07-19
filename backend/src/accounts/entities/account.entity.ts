import { PollingEntity } from "../../shared/entities/polling.entity";
import { Column, Entity, Index, ObjectID, ObjectIdColumn } from "typeorm";
import { AccountKey } from "./key.entity";
import { AccountContract } from "./contract.entity";
import { FlowAccount } from "../../flow/types";
import { AccountsStorage } from "./storage.entity";

@Entity({ name: "accounts" })
export class Account extends PollingEntity {
  @ObjectIdColumn()
  _id: ObjectID | any;

  @Column()
  @Index({ unique: true })
  id: string;

  @Column()
  address: string;

  @Column()
  balance: number;

  @Column()
  code: string;

  @Column((type) => AccountKey)
  keys: AccountKey[];

  @Column((type) => AccountContract)
  contracts: AccountContract[];

  @Column((type) => AccountsStorage)
  storage: AccountsStorage[];

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
    account.id = flowAccountObject.address;
    account.keys = keys.map((key) => AccountKey.init(key));
    account.contracts = Object.keys(contracts).map((name) =>
      AccountContract.init(flowAccountObject.address, name, contracts[name])
    ) as AccountContract[] & Map<string, string>;
    return account;
  }
}
