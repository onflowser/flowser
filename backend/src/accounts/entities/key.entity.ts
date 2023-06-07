import { Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { PollingEntity } from "../../core/entities/polling.entity";
import { AccountEntity } from "./account.entity";
import { AccountKey } from "@flowser/shared";
import { HashAlgorithm, SignatureAlgorithm } from "@flowser/shared";

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
}
