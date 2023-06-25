import { Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { PollingEntity } from "../../core/entities/polling.entity";
import { AccountEntity } from "./account.entity";
import { AccountKey } from "@flowser/shared";
import { HashAlgorithm, SignatureAlgorithm } from "@flowser/shared";
import { BlockContextEntity } from "../../blocks/entities/block-context.entity";
import { PollingEntityInitArguments } from "../../utils/type-utils";

type AccountKeyEntityInitArgs = PollingEntityInitArguments<AccountKeyEntity>;

// https://developers.flow.com/tooling/flow-cli/accounts/create-accounts#key-weight
export const defaultKeyWeight = 1000;

@Entity({ name: "keys" })
export class AccountKeyEntity
  extends PollingEntity
  implements BlockContextEntity
{
  @PrimaryColumn()
  index: number;

  @PrimaryColumn()
  accountAddress: string;

  // Nullable for backward compatability - to not cause not null constraint failure on migration.
  @Column({ nullable: true })
  blockId: string = "NULL";

  @Column()
  publicKey: string;

  @Column({ nullable: true })
  privateKey: string;

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
  account?: AccountEntity;

  // Entities are also automatically initialized by TypeORM.
  // In those cases no constructor arguments are provided.
  constructor(args: AccountKeyEntityInitArgs | undefined) {
    super();
    this.index = args?.index ?? -1;
    this.accountAddress = args?.accountAddress ?? "";
    this.blockId = args?.blockId ?? "";
    this.publicKey = args?.publicKey ?? "";
    this.privateKey = args?.privateKey ?? "";
    this.signAlgo =
      args?.signAlgo ?? SignatureAlgorithm.SIGNATURE_ALGORITHM_UNSPECIFIED;
    this.hashAlgo = args?.hashAlgo ?? HashAlgorithm.HASH_ALGORITHM_UNSPECIFIED;
    this.weight = args?.weight ?? -1;
    this.sequenceNumber = args?.sequenceNumber ?? -1;
    this.revoked = args?.revoked ?? false;
    if (args?.account) {
      this.account = args.account;
    }
  }

  /**
   * Creates a key with default values (where applicable).
   * It doesn't pre-set the values that should be provided.
   */
  static createDefault(): AccountKeyEntity {
    return new AccountKeyEntity({
      // https://developers.flow.com/tooling/flow-cli/accounts/create-accounts#public-key-signature-algorithm
      signAlgo: SignatureAlgorithm.ECDSA_P256,
      // Which has algorithm is actually used here by default?
      // Flow CLI doesn't support the option to specify it as an argument,
      // nor does it return this info when generating the key.
      hashAlgo: HashAlgorithm.SHA3_256,
      weight: defaultKeyWeight,
      sequenceNumber: 0,
      revoked: false,
      account: undefined,
      accountAddress: "",
      blockId: "",
      index: 0,
      privateKey: "",
      publicKey: "",
    });
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
