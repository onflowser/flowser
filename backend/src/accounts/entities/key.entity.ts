import { Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { PollingEntity } from "../../core/entities/polling.entity";
import { AccountEntity } from "./account.entity";
import { AccountKey } from "@flowser/shared";
import { HashAlgorithm, SignatureAlgorithm } from "@flowser/shared";
import { ensurePrefixedAddress } from "../../utils";

// https://developers.flow.com/tooling/flow-cli/accounts/create-accounts#key-weight
export const defaultKeyWeight = 1000;

@Entity({ name: "keys" })
export class AccountKeyEntity extends PollingEntity {
  @PrimaryColumn()
  index: number;

  @PrimaryColumn()
  accountAddress: string;

  @Column()
  publicKey: string;

  @Column({ nullable: true })
  privateKey: string | null;

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

  /**
   * Creates a key with default values (where applicable).
   * It doesn't pre-set the values that should be provided.
   */
  static createDefault(): AccountKeyEntity {
    const key = new AccountKeyEntity();
    // https://developers.flow.com/tooling/flow-cli/accounts/create-accounts#public-key-signature-algorithm
    key.signAlgo = SignatureAlgorithm.ECDSA_P256;
    // Which has algorithm is actually used here by default?
    // Flow CLI doesn't support the option to specify it as an argument,
    // nor does it return this info when generating the key.
    key.hashAlgo = HashAlgorithm.SHA3_256;
    key.weight = defaultKeyWeight;
    key.sequenceNumber = 0;
    key.revoked = false;
    return key;
  }

  toProto(): AccountKey {
    return {
      index: this.index,
      accountAddress: this.accountAddress,
      publicKey: this.publicKey,
      privateKey: this.privateKey ?? "",
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
