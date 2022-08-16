import { Injectable } from "@nestjs/common";
import { AccountStorageItemEntity } from "../entities/storage-item.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { computeEntitiesDiff, processEntitiesDiff } from "../../utils";

@Injectable()
export class AccountStorageService {
  constructor(
    @InjectRepository(AccountStorageItemEntity)
    private storageRepository: Repository<AccountStorageItemEntity>
  ) {}

  async findStorageByAccount(address: string) {
    return this.storageRepository.find({
      where: { accountAddress: address },
    });
  }

  async updateAccountStorage(
    address: string,
    newStorageItems: AccountStorageItemEntity[]
  ) {
    const oldStorageItems = await this.findStorageByAccount(address);
    const entitiesDiff = computeEntitiesDiff<AccountStorageItemEntity>({
      primaryKey: "identifier",
      newEntities: newStorageItems,
      oldEntities: oldStorageItems,
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
        identifier: accountStorage.identifier,
        domain: accountStorage.domain,
        accountAddress: accountStorage.accountAddress,
      },
      accountStorage
    );
  }

  async delete(accountStorage: AccountStorageItemEntity) {
    return this.storageRepository.delete({
      identifier: accountStorage.identifier,
      domain: accountStorage.domain,
      accountAddress: accountStorage.accountAddress,
    });
  }

  async removeAll() {
    return this.storageRepository.delete({});
  }
}
