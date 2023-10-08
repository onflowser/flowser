import { FlowGatewayService } from "./flow-gateway.service";
import { ensurePrefixedAddress } from "../utils";
import {
  AccountStorageDomain,
  CadenceTypeKind,
  FlowAccountStorage,
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
    address: string
  ): Promise<FlowAccountStorage[]> {
    const flowAccountStorage = await this.fetchStorageByAddress(address);

    return [
      ...flowAccountStorage.capabilityPathItems.map(
        (item): FlowAccountStorage => ({
          id: `${ensurePrefixedAddress(item.address)}.${item.path}`,
          address: ensurePrefixedAddress(item.address),
          // Temporarily store the data type in untyped field, refactor later.
          data: {
            type: item.type,
          },
          domain: this.getStorageDomainFromPath(item.path),
          path: item.path,
          targetPath: item.targetPath,
        })
      ),
      ...flowAccountStorage.storagePathItems.map(
        (item): FlowAccountStorage => ({
          id: `${ensurePrefixedAddress(item.address)}.${item.path}`,
          address: ensurePrefixedAddress(item.address),
          // Temporarily store the data type in untyped field, refactor later.
          data: {
            type: item.type,
          },
          domain: this.getStorageDomainFromPath(item.path),
          path: item.path,
          targetPath: "",
        })
      ),
    ];
  }

  private async fetchStorageByAddress(
    address: string
  ): Promise<StorageTraversalResult> {
    const cadence = `
      pub struct CapabilityPathItem {
        pub let address: Address
        pub let path: String
        pub let type: Type
        pub let targetPath: String?
      
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
      
      pub struct StoragePathItem {
        pub let address: Address
        pub let path: String
        pub let type: Type
      
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
      
      pub struct StorageTraversalResult {
        pub let capabilityPathItems: [CapabilityPathItem]
        pub let storagePathItems: [StoragePathItem]
      
        init(
          capabilityPathItems: [CapabilityPathItem],
          storagePathItems: [StoragePathItem]
        ) {
          self.capabilityPathItems = capabilityPathItems
          self.storagePathItems = storagePathItems
        }
      }
      
      pub fun main(address: Address): StorageTraversalResult {
      
        let account = getAuthAccount(address)
        let capabilityPathItems: [CapabilityPathItem] = []
        let storagePathItems: [StoragePathItem] = []
      
        account.forEachPrivate(fun (path: PrivatePath, type: Type): Bool {
          capabilityPathItems.append(buildCapabilityPathItem(account: account, path: path, type: type))
          return true
        })
      
        account.forEachPublic(fun (path: PublicPath, type: Type): Bool {
          capabilityPathItems.append(buildCapabilityPathItem(account: account, path: path, type: type))
          return true
        })
      
        account.forEachStored(fun (path: StoragePath, type: Type): Bool {
          storagePathItems.append(buildStoragePathItem(account: account, path: path, type: type))
          return true
        })
        
        return StorageTraversalResult(
          capabilityPathItems: capabilityPathItems,
          storagePathItems: storagePathItems
        )
      }
      
      priv fun buildCapabilityPathItem(account: AuthAccount, path: CapabilityPath, type: Type): CapabilityPathItem {
         var targetPath: String? = nil
          if let target = account.getLinkTarget(path) {
            targetPath = target.toString()
          }
        return CapabilityPathItem(
            address: account.address,
            path: path.toString(),
            type: type,
            targetPath: targetPath
          )
      }
      
      priv fun buildStoragePathItem(account: AuthAccount, path: StoragePath, type: Type): StoragePathItem {
      
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

  private getStorageDomainFromPath(path: string): AccountStorageDomain {
    const rawDomain = path.split("/")[1];
    switch (rawDomain) {
      case "public":
        return AccountStorageDomain.STORAGE_DOMAIN_PUBLIC;
      case "private":
        return AccountStorageDomain.STORAGE_DOMAIN_PRIVATE;
      case "storage":
        return AccountStorageDomain.STORAGE_DOMAIN_STORAGE;
      default:
        throw new Error(`Unknown domain: ${rawDomain}`);
    }
  }
}
