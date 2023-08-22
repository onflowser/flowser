import { Injectable, HttpException } from "@nestjs/common";
import axios from "axios";
import { FlowAccount } from "./gateway.service";
import { AccountStorageItemEntity } from "../../accounts/entities/storage-item.entity";
import { ensurePrefixedAddress } from "../../utils/common-utils";
import { AccountStorageDomain } from "@flowser/shared";

/**
 * For more info on the account storage model and API, see:
 * - https://developers.flow.com/cadence/language/accounts#accountstorage
 * - https://github.com/onflow/flow-emulator/pull/156
 *
 * Also see the account storage retrieval implementation:
 * https://github.com/onflow/flow-emulator/blob/3fbe8ad9dc841abdc13056e20e7b15fc0e32a749/server/backend/backend.go#L584-L590
 */

// TODO(milestone-3): Defining shared for all possible cadence shared would be quite difficult.
// We could define just some of the most common shared like Resource, Path, Dictionary,.. to save time
// ... or we could define all shared and put them in a shared (npm) library?
// Object that is stored under /private or /public domains.
// https://github.com/onflow/cadence/blob/master/values.go
export type FlowCadenceValue = unknown;

// Identifier that is used in account storage path (e.g. /private/<identifier>).
export type FlowStorageIdentifier = string;

export type FlowStorageItem = Record<FlowStorageIdentifier, FlowCadenceValue>;

export type FlowAccountStorageDomain = "Private" | "Public" | "Storage";

export type FlowAccountStorage = {
  Address: string;
  Private: FlowStorageItem;
  Public: FlowStorageItem;
  Storage: FlowStorageItem;
  Account: FlowAccount;
};

@Injectable()
export class FlowAccountStorageService {
  public async getAccountStorage(address: string) {
    const flowAccountStorage = await this.fetchStorageByAddress(address);

    const privateStorageIdentifiers = Object.keys(
      flowAccountStorage.Private ?? {}
    );
    const publicStorageIdentifiers = Object.keys(
      flowAccountStorage.Public ?? {}
    );
    const storageIdentifiers = Object.keys(flowAccountStorage.Storage ?? {});

    const privateItems = privateStorageIdentifiers.map(
      (flowStorageIdentifier) =>
        this.createStorageEntity({
          flowStorageDomain: "Private",
          flowStorageIdentifier,
          flowAccountStorage,
        })
    );
    const publicItems = publicStorageIdentifiers.map((flowStorageIdentifier) =>
      this.createStorageEntity({
        flowStorageDomain: "Public",
        flowStorageIdentifier,
        flowAccountStorage,
      })
    );
    const storageItems = storageIdentifiers.map((flowStorageIdentifier) =>
      this.createStorageEntity({
        flowStorageDomain: "Storage",
        flowStorageIdentifier,
        flowAccountStorage,
      })
    );

    return { privateItems, publicItems, storageItems };
  }

  private async fetchStorageByAddress(address: string) {
    // TODO(milestone-3): use Value from emulator config object
    const response = await axios.get(
      `http://localhost:8080/emulator/storages/${address}`
    );

    if (response.status !== 200) {
      throw new HttpException(response.statusText, response.status);
    }

    return response.data as FlowAccountStorage;
  }

  private createStorageEntity(options: {
    flowStorageDomain: FlowAccountStorageDomain;
    flowStorageIdentifier: FlowStorageIdentifier;
    flowAccountStorage: FlowAccountStorage;
  }) {
    const { flowAccountStorage, flowStorageIdentifier, flowStorageDomain } =
      options;
    const storageData =
      flowAccountStorage[flowStorageDomain][flowStorageIdentifier];

    function getStorageData() {
      // TODO(milestone-x): For now we will just show plain (unparsed) storage data
      // But in the future we will want to parse it so that we can extract info
      // This will be possible after storage API implements proper deserialization of storage data
      if (typeof storageData !== "object") {
        // In case the data is a simple Value (string, number, boolean,...)
        // we need to store it in object form (e.g. under "Value" key).
        // Otherwise, it won't get properly encoded/decoded by protocol buffers.
        return { value: storageData };
      } else {
        return storageData;
      }
    }

    return new AccountStorageItemEntity({
      account: undefined,
      accountAddress: ensurePrefixedAddress(flowAccountStorage.Address),
      data: getStorageData(),
      pathDomain: this.flowStorageDomainToEnum(flowStorageDomain),
      pathIdentifier: flowStorageIdentifier,
    });
  }

  private flowStorageDomainToEnum(
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
