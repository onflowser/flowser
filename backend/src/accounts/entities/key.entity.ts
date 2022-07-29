import { Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { PollingEntity } from "../../common/entities/polling.entity";
import { Account } from "./account.entity";
import { ensurePrefixedAddress } from "../../utils";

@Entity({ name: "keys" })
export class AccountKey extends PollingEntity {
  @PrimaryColumn()
  index: number;

  @PrimaryColumn()
  accountAddress: string;

  @Column()
  publicKey: string;

  @Column()
  signAlgo: number;

  @Column()
  hashAlgo: number;

  @Column()
  weight: number;

  @Column()
  sequenceNumber: number;

  @Column()
  revoked: boolean;

  @ManyToOne(() => Account, (account) => account.storage)
  account: Account;

  static init(accountAddress: string, flowAccountKeyObject: any) {
    return Object.assign<AccountKey, any>(new AccountKey(), {
      ...flowAccountKeyObject,
      accountAddress: ensurePrefixedAddress(accountAddress),
    });
  }
}
