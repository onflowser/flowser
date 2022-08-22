import { Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { PollingEntity } from "../../common/entities/polling.entity";
import { AccountEntity } from "./account.entity";
import { ensurePrefixedAddress } from "../../utils";
import { FlowAccount, FlowKey } from "../../flow/services/gateway.service";
import { AccountKey } from "@flowser/types/generated/entities/accounts";
import {
  HashAlgorithm,
  SignatureAlgorithm,
} from "@flowser/types/generated/entities/common";

@Entity({ name: "keys" })
export class AccountKeyEntity extends PollingEntity {
  @PrimaryColumn()
  index: number;

  @PrimaryColumn()
  accountAddress: string;

  @Column()
  publicKey: string;

  @Column()
  signAlgo: SignatureAlgorithm;

  @Column()
  hashAlgo: HashAlgorithm;

  @Column()
  weight: number;

  @Column()
  sequenceNumber: number;

  @Column()
  revoked: boolean;

  @ManyToOne(() => AccountEntity, (account) => account.storage)
  account: AccountEntity;

  toProto(): AccountKey {
    return {
      index: this.index,
      accountAddress: this.accountAddress,
      publicKey: this.publicKey,
      signAlgo: this.signAlgo,
      hashAlgo: this.hashAlgo,
      weight: this.weight,
      sequenceNumber: this.sequenceNumber,
      revoked: this.revoked,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }

  static create(flowAccount: FlowAccount, flowKey: FlowKey) {
    const key = new AccountKeyEntity();
    key.index = flowKey.index;
    key.accountAddress = ensurePrefixedAddress(flowAccount.address);
    key.publicKey = flowKey.publicKey;
    key.signAlgo = flowKey.signAlgo;
    key.hashAlgo = flowKey.hashAlgo;
    key.weight = flowKey.weight;
    key.sequenceNumber = flowKey.sequenceNumber;
    key.revoked = flowKey.revoked;
    return key;
  }
}
