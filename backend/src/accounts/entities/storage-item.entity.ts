import { Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { AccountEntity } from "./account.entity";
import { AccountStorageDomain, AccountStorageItem } from "@flowser/shared";
import { PollingEntity } from "../../common/entities/polling.entity";
import {
  FlowAccountStorage,
  FlowAccountStorageDomain,
  FlowStorageIdentifier,
} from "../../flow/services/storage.service";
import { ensurePrefixedAddress } from "../../utils";

@Entity({ name: "storage" })
export class AccountStorageItemEntity extends PollingEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  pathIdentifier: string;

  @PrimaryColumn()
  pathDomain: AccountStorageDomain;

  @PrimaryColumn()
  accountAddress: string;

  @Column("simple-json")
  data: unknown;

  @ManyToOne(() => AccountEntity, (account) => account.storage)
  account: AccountEntity;

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

  static create(
    flowStorageDomain: FlowAccountStorageDomain,
    flowStorageIdentifier: FlowStorageIdentifier,
    flowAccountStorage: FlowAccountStorage
  ) {
    const storageData =
      flowAccountStorage[flowStorageDomain][flowStorageIdentifier];

    const storageItem = new AccountStorageItemEntity();
    storageItem.pathIdentifier = flowStorageIdentifier;
    storageItem.pathDomain = this.convertFlowStorageDomain(flowStorageDomain);
    storageItem.id = `${
      flowAccountStorage.Address
    }/${storageItem.getLowerCasedPathDomain()}/${storageItem.pathIdentifier}`;

    // TODO(milestone-x): For now we will just show plain (unparsed) storage data
    // But in the future we will want to parse it so that we can extract info
    // This will be possible after storage API implements proper deserialization of storage data
    if (typeof storageData !== "object") {
      // In case the data is a simple value (string, number, boolean,...)
      // we need to store it in object form (e.g. under "value" key).
      // Otherwise it won't get properly encoded/decoded by protocol buffers.
      storageItem.data = { value: storageData };
    } else {
      storageItem.data = storageData;
    }
    storageItem.accountAddress = ensurePrefixedAddress(
      flowAccountStorage.Address
    );
    return storageItem;
  }

  private static convertFlowStorageDomain(
    flowStorageDomain: FlowAccountStorageDomain
  ): AccountStorageDomain {
    switch (flowStorageDomain) {
      case "Public":
        return AccountStorageDomain.STORAGE_DOMAIN_PUBLIC;
      case "Private":
        return AccountStorageDomain.STORAGE_DOMAIN_PRIVATE;
      case "Storage":
        return AccountStorageDomain.STORAGE_DOMAIN_STORAGE;
      default:
        return AccountStorageDomain.STORAGE_DOMAIN_UNKNOWN;
    }
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
