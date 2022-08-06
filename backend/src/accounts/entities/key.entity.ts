import { Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { PollingEntity } from "../../common/entities/polling.entity";
import { AccountEntity } from "./account.entity";
import { ensurePrefixedAddress } from "../../utils";
import { FlowAccount, FlowKey } from "../../flow/services/flow-gateway.service";
import { AccountKey } from "@flowser/types/generated/accounts";

@Entity({ name: "keys" })
export class AccountKeyEntity extends PollingEntity implements AccountKey {
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

  @ManyToOne(() => AccountEntity, (account) => account.storage)
  account: AccountEntity;

  static create(flowAccount: FlowAccount, flowKey: FlowKey) {
    return Object.assign<AccountKeyEntity, any>(new AccountKeyEntity(), {
      ...flowKey,
      accountAddress: ensurePrefixedAddress(flowAccount.address),
    });
  }
}
