import { Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { Account } from "./account.entity";

@Entity({ name: "storage" })
export class AccountsStorage {
  // TODO(milestone-2): Which attributes should be considered a primary key?
  @PrimaryColumn()
  name: string;

  @PrimaryColumn()
  accountAddress: string;

  @Column()
  blockHeight: number;

  @Column()
  value: string;

  @ManyToOne(() => Account, (account) => account.storage)
  account: Account;
}
