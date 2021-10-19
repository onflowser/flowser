import { PollingEntity } from '../../shared/entities/polling.entity';
import { Column, Entity, ObjectID, ObjectIdColumn } from "typeorm";

@Entity({ name: 'contracts' })
export class AccountContract extends PollingEntity {
  @ObjectIdColumn()
  _id: ObjectID;

  @Column()
  name: string;

  @Column()
  code: string;

  static init(accountAddress: string, name: string, code: string) {
    return Object.assign<AccountContract, any>(new AccountContract(), {
      id: `${accountAddress}.${name}`,
      name,
      code
    })
  }
}
