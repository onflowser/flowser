import { PollingEntity } from '../../shared/entities/polling.entity';
import { Column, Entity, ObjectID, ObjectIdColumn } from "typeorm";
import { AccountKey } from "./key.entity";
import { AccountContract } from "./contract.entity";

@Entity({ name: 'accounts' })
export class Account extends PollingEntity {
  @ObjectIdColumn()
  _id: ObjectID;

  @Column()
  address: string;

  @Column()
  balance: number;

  @Column()
  code: string;

  @Column(type => AccountKey)
  keys: AccountKey[];

  @Column(type => AccountContract)
  contracts: AccountContract[];

  static init(flowAccountObject) {
    const {keys, contracts} = flowAccountObject;
    const account = Object.assign<Account, Account>(new Account(), flowAccountObject);
    account._id = flowAccountObject.address;
    account.keys = keys.map(key => (
      Object.assign<AccountKey, any>(new AccountKey(), key)
    ))
    account.contracts = Object.keys(contracts).map(name => (
      Object.assign<AccountContract, any>(new AccountContract(), { name, code: contracts[name] })
    ))
    return account;
  }
}
