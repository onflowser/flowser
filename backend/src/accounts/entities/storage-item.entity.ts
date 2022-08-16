import { Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { AccountEntity } from "./account.entity";
import {
  AccountStorageDomain,
  AccountStorageItem,
} from "@flowser/types/generated/entities/accounts";
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
  identifier: string;

  @PrimaryColumn()
  domain: AccountStorageDomain;

  @PrimaryColumn()
  accountAddress: string;

  @Column("simple-json")
  data: unknown;

  @ManyToOne(() => AccountEntity, (account) => account.storage)
  account: AccountEntity;

  toProto() {
    return AccountStorageItem.fromPartial({
      identifier: this.identifier,
      domain: this.domain,
      data: this.data,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    });
  }

  static create(
    flowStorageDomain: FlowAccountStorageDomain,
    flowStorageIdentifier: FlowStorageIdentifier,
    flowAccountStorage: FlowAccountStorage
  ) {
    const storageData =
      flowAccountStorage[flowStorageDomain][flowStorageIdentifier];

    const storageItem = new AccountStorageItemEntity();
    storageItem.identifier = flowStorageIdentifier;
    storageItem.domain = this.convertFlowStorageDomain(flowStorageDomain);
    storageItem.data = storageData;
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
}
