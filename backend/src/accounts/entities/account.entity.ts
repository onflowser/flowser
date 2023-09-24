import { PollingEntity } from "../../core/entities/polling.entity";
import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { AccountKeyEntity } from "./key.entity";
import { AccountContractEntity } from "./contract.entity";
import { Account, AccountTag } from "@flowser/shared";
import { TransactionEntity } from "../../transactions/transaction.entity";
import { AccountStorageItemEntity } from "./storage-item.entity";
import { BlockContextEntity } from "../../blocks/entities/block-context.entity";
import { PollingEntityInitArguments } from "../../utils/type-utils";

type AccountEntityInitArgs = PollingEntityInitArguments<AccountEntity>;

@Entity({ name: "accounts" })
export class AccountEntity extends PollingEntity implements BlockContextEntity {
  @PrimaryColumn()
  address: string;

  // Nullable for backward compatability - to not cause not null constraint failure on migration.
  @Column({ nullable: true })
  blockId: string;

  @Column({ type: "bigint" })
  balance: number;

  @Column()
  code: string;

  // If this account is one of the default accounts
  // already created by the emulator itself.
  @Column({ default: false })
  isDefaultAccount: boolean;

  @OneToMany(() => AccountKeyEntity, (key) => key.account, {
    eager: true,
  })
  keys?: AccountKeyEntity[];

  @OneToMany(() => AccountStorageItemEntity, (storage) => storage.account, {
    eager: true,
  })
  storage?: AccountStorageItemEntity[];

  @OneToMany(() => AccountContractEntity, (contract) => contract.account, {
    eager: true,
  })
  contracts?: AccountContractEntity[];

  @OneToMany(() => TransactionEntity, (key) => key.payer, {
    eager: true,
  })
  transactions?: TransactionEntity[];

  // Entities are also automatically initialized by TypeORM.
  // In those cases no constructor arguments are provided.
  constructor(args: AccountEntityInitArgs | undefined) {
    super();
    this.address = args?.address ?? "";
    this.blockId = args?.blockId ?? "";
    this.balance = args?.balance ?? 0;
    this.code = args?.code ?? "";
    this.isDefaultAccount = args?.isDefaultAccount ?? false;
    if (args?.keys) {
      this.keys = args.keys;
    }
    if (args?.storage) {
      this.storage = args.storage;
    }
    if (args?.contracts) {
      this.contracts = args.contracts;
    }
    if (args?.transactions) {
      this.transactions = args.transactions;
    }
  }

  /**
   * Creates an account with default values (where applicable).
   * It doesn't pre-set the values that should be provided.
   */
  static createDefault(): AccountEntity {
    return new AccountEntity({
      balance: 0,
      address: "",
      blockId: "",
      isDefaultAccount: false,
      code: "",
      keys: [],
      transactions: [],
      contracts: [],
      storage: [],
    });
  }

  toProto(): Account {
    const tags: AccountTag[] = [];

    if (this.isDefaultAccount) {
      tags.push({
        name: "Default",
        description: "This account was created automatically by the emulator.",
      });
    }

    const isServiceAccount = [
      "0xf8d6e0586b0a20c7",
      "0x0000000000000001", // When using monotonic addresses setting
    ].includes(this.address);

    // https://developers.flow.com/concepts/flow-token/concepts#flow-service-account
    if (isServiceAccount) {
      tags.push({
        name: "Service",
        description:
          "A special account in Flow that has special permissions to manage system contracts. It is able to mint tokens, set fees, and update network-level contracts.",
      });
    }

    return {
      address: this.address,
      balance: this.balance,
      code: this.code,
      storage: this.storage?.map((storage) => storage.toProto()) ?? [],
      keys: this.keys?.map((key) => key.toProto()) ?? [],
      transactions:
        this.transactions?.map((transaction) => transaction.toProto()) ?? [],
      tags,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
