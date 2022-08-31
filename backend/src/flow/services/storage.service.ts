import { Injectable, HttpException } from "@nestjs/common";
import axios from "axios";
import { FlowAccount } from "./gateway.service";
import { AccountStorageItemEntity } from "../../accounts/entities/storage-item.entity";

/**
 * For more info on the account storage model and API, see:
 * - https://developers.flow.com/cadence/language/accounts#accountstorage
 * - https://github.com/onflow/flow-emulator/pull/156
 *
 * Also see the account storage retrieval implementation:
 * https://github.com/onflow/flow-emulator/blob/3fbe8ad9dc841abdc13056e20e7b15fc0e32a749/server/backend/backend.go#L584-L590
 */

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

    const privateItems = privateStorageIdentifiers.map((identifier) =>
      AccountStorageItemEntity.create("Private", identifier, flowAccountStorage)
    );
    const publicItems = publicStorageIdentifiers.map((identifier) =>
      AccountStorageItemEntity.create("Public", identifier, flowAccountStorage)
    );
    const storageItems = storageIdentifiers.map((identifier) =>
      AccountStorageItemEntity.create("Storage", identifier, flowAccountStorage)
    );

    return { privateItems, publicItems, storageItems };
  }

  private async fetchStorageByAddress(address: string) {
    // TODO(milestone-3): use value from emulator config object
    const response = await axios.get(
      `http://localhost:8080/emulator/storages/${address}`
    );

    if (response.status !== 200) {
      throw new HttpException(response.statusText, response.status);
    }

    return response.data as FlowAccountStorage;
  }
}
