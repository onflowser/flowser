import { FlowGatewayService } from "./flow-gateway.service";
import { ensurePrefixedAddress } from "./utils";
import {
  FlowStorageDomain,
  CadenceTypeKind,
  FlowAccountStorage,
  OmitTimestamps,
} from "@onflowser/api";

/**
 * For more info on the account storage model and API, see:
 * - https://developers.flow.com/cadence/language/accounts#accountstorage
 * - https://github.com/onflow/flow-emulator/pull/156
 *
 * Also see the account storage retrieval implementation:
 * https://github.com/onflow/flow-emulator/blob/3fbe8ad9dc841abdc13056e20e7b15fc0e32a749/server/backend/backend.go#L584-L590
 */

type CapabilityPathItem = {
  address: string;
  path: string;
  targetPath: string;
  type: Record<string, unknown>;
};

type StoragePathItem = {
  address: string;
  path: string;
  type: Record<string, unknown>;
};

type StorageTraversalResult = {
  capabilityPathItems: CapabilityPathItem[];
  storagePathItems: StoragePathItem[];
};

export class FlowAccountStorageService {
  constructor(private readonly flowGatewayService: FlowGatewayService) {}

  public async getAccountStorageItems(
    address: string,
  ): Promise<OmitTimestamps<FlowAccountStorage>[]> {
    const flowAccountStorage = await this.fetchStorageByAddress(address);

    return [
      ...flowAccountStorage.capabilityPathItems.map(
        (item): OmitTimestamps<FlowAccountStorage> => ({
          id: `${ensurePrefixedAddress(item.address)}.${item.path}`,
          address: ensurePrefixedAddress(item.address),
          // Temporarily store the data type in untyped field, refactor later.
          data: {
            type: item.type,
          },
          domain: this.getStorageDomainFromPath(item.path),
          path: item.path,
          targetPath: item.targetPath,
        }),
      ),
      ...flowAccountStorage.storagePathItems.map(
        (item): OmitTimestamps<FlowAccountStorage> => ({
          id: `${ensurePrefixedAddress(item.address)}.${item.path}`,
          address: ensurePrefixedAddress(item.address),
          // Temporarily store the data type in untyped field, refactor later.
          data: {
            type: item.type,
          },
          domain: this.getStorageDomainFromPath(item.path),
          path: item.path,
          targetPath: "",
        }),
      ),
    ];
  }

  private async fetchStorageByAddress(
    address: string,
  ): Promise<StorageTraversalResult> {
    // language=Cadence
    const cadence = `
      access(all) struct CapabilityPathItem {
        access(all) let address: Address
        access(all) let path: String
        access(all) let type: Type
        access(all) let targetPath: String?
      
        init(
          address: Address,
          path: String,
          type: Type,
          targetPath: String?
        ) {
          self.address = address
          self.path = path
          self.type = type
          self.targetPath = targetPath
        }
      }
      
      access(all) struct StoragePathItem {
        access(all) let address: Address
        access(all) let path: String
        access(all) let type: Type
      
        init(
          address: Address,
          path: String,
          type: Type,
        ) {
          self.address = address
          self.path = path
          self.type = type
        }
      }
      
      access(all) struct StorageTraversalResult {
        access(all) let capabilityPathItems: [CapabilityPathItem]
        access(all) let storagePathItems: [StoragePathItem]
      
        init(
          capabilityPathItems: [CapabilityPathItem],
          storagePathItems: [StoragePathItem]
        ) {
          self.capabilityPathItems = capabilityPathItems
          self.storagePathItems = storagePathItems
        }
      }
      
      access(all) fun main(address: Address): StorageTraversalResult {
      
        let account = getAuthAccount<auth(Storage, Contracts, Keys, Inbox, Capabilities) &Account>(address)
        let capabilityPathItems: [CapabilityPathItem] = []
        let storagePathItems: [StoragePathItem] = []
      
        // Note: This API is not available anymore since Cadence v1.0
        // Related: https://github.com/33-Labs/flowview/pull/18
        // account.storage.forEachPrivate(fun (path: PrivatePath, type: Type): Bool {
        //   capabilityPathItems.append(buildCapabilityPathItem(account: account, path: path, type: type))
        //   return true
        // })
      
        var publicRes = account.storage.forEachPublic(fun (path: PublicPath, type: Type): Bool {
          capabilityPathItems.append(buildCapabilityPathItem(account: account, path: path, type: type))
          return true
        })
      
        var storedRes = account.storage.forEachStored(fun (path: StoragePath, type: Type): Bool {
          storagePathItems.append(buildStoragePathItem(account: account, path: path, type: type))
          return true
        })
        
        return StorageTraversalResult(
          capabilityPathItems: capabilityPathItems,
          storagePathItems: storagePathItems
        )
      }
      
      access(self) fun buildCapabilityPathItem(account: &Account, path: PublicPath, type: Type): CapabilityPathItem {
         var targetPath: String? = nil
        // Note: This is a workaround to check if the path is a capability
        // There is no getLinkTarget method anymore
        // Related: https://github.com/33-Labs/flowview/pull/18
        if account.capabilities.exists(path) {
            targetPath = path.toString()
        }
        return CapabilityPathItem(
            address: account.address,
            path: path.toString(),
            type: type,
            targetPath: targetPath
          )
      }
        
      access(self) fun buildStoragePathItem(account: &Account, path: StoragePath, type: Type): StoragePathItem {
        
          return StoragePathItem(
              address: account.address,
              path: path.toString(),
              type: type,
          )
      }
    `;

    return await this.flowGatewayService.executeScript({
      cadence,
      arguments: [
        {
          value: address,
          type: {
            rawType: "Address",
            kind: CadenceTypeKind.CADENCE_TYPE_ADDRESS,
            optional: false,
            array: undefined,
            dictionary: undefined,
          },
          identifier: "address",
        },
      ],
    });
  }

  private getStorageDomainFromPath(path: string): FlowStorageDomain {
    const rawDomain = path.split("/")[1];
    switch (rawDomain) {
      case "public":
        return FlowStorageDomain.STORAGE_DOMAIN_PUBLIC;
      case "private":
        return FlowStorageDomain.STORAGE_DOMAIN_PRIVATE;
      case "storage":
        return FlowStorageDomain.STORAGE_DOMAIN_STORAGE;
      default:
        throw new Error(`Unknown domain: ${rawDomain}`);
    }
  }
}
