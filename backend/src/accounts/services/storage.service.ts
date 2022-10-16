import { Injectable } from "@nestjs/common";
import { AccountStorageItemEntity } from "../entities/storage-item.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { MoreThan, Repository } from "typeorm";
import {
  computeEntitiesDiff,
  ensurePrefixedAddress,
  processEntitiesDiff,
} from "../../utils";

@Injectable()
export class AccountStorageService {
  constructor(
    @InjectRepository(AccountStorageItemEntity)
    private storageRepository: Repository<AccountStorageItemEntity>
  ) {}

  async findAllNewerThanTimestampByAccount(
    accountAddress: string,
    timestamp: Date
  ) {
    return this.storageRepository.find({
      where: [
        { updatedAt: MoreThan(timestamp), accountAddress },
        { createdAt: MoreThan(timestamp), accountAddress },
      ],
      order: { createdAt: "DESC" },
    });
  }

  async findStorageByAccount(address: string) {
    return this.storageRepository.find({
      where: { accountAddress: ensurePrefixedAddress(address) },
    });
  }

  async updateAccountStorage(
    address: string,
    newStorageItems: AccountStorageItemEntity[]
  ) {
    const oldStorageItems = await this.findStorageByAccount(address);
    const entitiesDiff = computeEntitiesDiff<AccountStorageItemEntity>({
      primaryKey: "pathIdentifier",
      newEntities: newStorageItems,
      oldEntities: oldStorageItems,
      deepCompare: true,
    });
    return processEntitiesDiff<AccountStorageItemEntity>({
      create: (e) => this.create(e),
      update: (e) => this.update(e),
      delete: (e) => this.delete(e),
      diff: entitiesDiff,
    });
  }

  async create(accountStorage: AccountStorageItemEntity) {
    return this.storageRepository.insert(accountStorage);
  }

  async update(accountStorage: AccountStorageItemEntity) {
    accountStorage.markUpdated();
    return this.storageRepository.update(
      {
        pathIdentifier: accountStorage.pathIdentifier,
        pathDomain: accountStorage.pathDomain,
        accountAddress: accountStorage.accountAddress,
      },
      accountStorage
    );
  }

  async delete(accountStorage: AccountStorageItemEntity) {
    return this.storageRepository.delete({
      pathIdentifier: accountStorage.pathIdentifier,
      pathDomain: accountStorage.pathDomain,
      accountAddress: accountStorage.accountAddress,
    });
  }

  async removeAll() {
    return this.storageRepository.delete({});
  }
}
