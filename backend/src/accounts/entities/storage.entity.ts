import { Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { AccountEntity } from "./account.entity";
import { AccountStorage } from "@flowser/types";

@Entity({ name: "storage" })
export class AccountsStorageEntity {
  // TODO(milestone-3): Which attributes should be considered a primary key?
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

  toProto() {
    return AccountStorage.fromPartial({
      name: this.name,
      accountAddress: this.accountAddress,
      blockHeight: this.blockHeight,
      value: this.value,
    });
  }
}
