import { Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { AccountEntity } from "./account.entity";
import { AccountStorage } from "@flowser/types/generated/accounts";

@Entity({ name: "storage" })
export class AccountsStorageEntity implements AccountStorage {
  // TODO(milestone-2): Which attributes should be considered a primary key?
  @PrimaryColumn()
  name: string;

  @PrimaryColumn()
  accountAddress: string;

  @Column()
  blockHeight: number;

  @Column()
  value: string;

  @ManyToOne(() => AccountEntity, (account) => account.storage)
  account: AccountEntity;
}
