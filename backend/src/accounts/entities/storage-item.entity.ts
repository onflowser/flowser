import { Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { AccountEntity } from "./account.entity";
import { AccountStorageDomain, AccountStorageItem } from "@flowser/shared";
import { PollingEntity } from "../../core/entities/polling.entity";
import { PollingEntityInitArguments } from "../../utils/type-utils";

type AccountStorageItemEntityInitArgs = Omit<
  PollingEntityInitArguments<AccountStorageItemEntity>,
  "_id" | "id"
>;

@Entity({ name: "storage" })
export class AccountStorageItemEntity extends PollingEntity {
  // This is a deprecated column, but removing it would cause a database migration error.
  // To completely remove this we would need to write a manual migration script.
  @PrimaryColumn({ name: "id" })
  _id: string = "";

  @PrimaryColumn({ name: "pathIdentifier" })
  path: string;

  @PrimaryColumn()
  pathDomain: AccountStorageDomain;

  @PrimaryColumn()
  accountAddress: string;

  @Column({ type: "text", nullable: true })
  targetPath: string | null;

  @Column("simple-json")
  data: any;

  @ManyToOne(() => AccountEntity, (account) => account.storage)
  account?: AccountEntity;

  // Entities are also automatically initialized by TypeORM.
  // In those cases no constructor arguments are provided.
  constructor(args: AccountStorageItemEntityInitArgs) {
    super();
    this.path = args?.path ?? "";
    this.targetPath = args?.targetPath ?? "";
    this.pathDomain =
      args?.pathDomain ?? AccountStorageDomain.STORAGE_DOMAIN_UNKNOWN;
    this.accountAddress = args?.accountAddress ?? "";
    this.data = args?.data ?? {};
    if (args?.account) {
      this.account = args.account;
    }
  }

  get id() {
    return `${this.accountAddress}/${this.getLowerCasedPathDomain()}/${
      this.path
    }`;
  }

  toProto(): AccountStorageItem {
    return {
      id: this.id,
      path: this.path,
      pathDomain: this.pathDomain,
      targetPath: this.targetPath ?? "",
      data: this.data,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }

  getLowerCasedPathDomain() {
    switch (this.pathDomain) {
      case AccountStorageDomain.STORAGE_DOMAIN_PUBLIC:
        return "public";
      case AccountStorageDomain.STORAGE_DOMAIN_PRIVATE:
        return "private";
      case AccountStorageDomain.STORAGE_DOMAIN_STORAGE:
        return "storage";
      default:
        return "unknown";
    }
  }
}
