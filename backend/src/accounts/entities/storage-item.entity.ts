import { Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { AccountEntity } from "./account.entity";
import { AccountStorageDomain, AccountStorageItem } from "@flowser/shared";
import { PollingEntity } from "../../core/entities/polling.entity";
import {
  FlowAccountStorage,
  FlowAccountStorageDomain,
  FlowStorageIdentifier,
} from "../../flow/services/storage.service";
import { ensurePrefixedAddress } from "../../utils";

@Entity({ name: "storage" })
export class AccountStorageItemEntity extends PollingEntity {
  // This is a deprecated column, but removing it would cause a database migration error.
  // To completely remove this we would need to write a manual migration script.
  @PrimaryColumn({ name: "id" })
  _id: string = "";

  @PrimaryColumn()
  pathIdentifier: string;

  @PrimaryColumn()
  pathDomain: AccountStorageDomain;

  @PrimaryColumn()
  accountAddress: string;

  @Column("simple-json")
  data: unknown;

  @ManyToOne(() => AccountEntity, (account) => account.storage)
  account: AccountEntity;

  get id() {
    return `${this.accountAddress}/${this.getLowerCasedPathDomain()}/${
      this.pathIdentifier
    }`;
  }

  toProto(): AccountStorageItem {
    return {
      id: this.id,
      pathIdentifier: this.pathIdentifier,
      pathDomain: this.pathDomain,
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
