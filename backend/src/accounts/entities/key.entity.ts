import { Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { PollingEntity } from "../../common/entities/polling.entity";
import { Account } from "./account.entity";
import { ensurePrefixedAddress } from "../../utils";
import { FlowAccount, FlowKey } from "../../flow/services/flow-gateway.service";

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

  static create(flowAccount: FlowAccount, flowKey: FlowKey) {
    return Object.assign<AccountKey, any>(new AccountKey(), {
      ...flowKey,
      accountAddress: ensurePrefixedAddress(flowAccount.address),
    });
  }
}
