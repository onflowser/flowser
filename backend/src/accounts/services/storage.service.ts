import { Injectable, NotImplementedException } from "@nestjs/common";
import { AccountsStorageEntity } from "../entities/storage.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

// TODO(milestone-3): implement this class
@Injectable()
export class StorageService {
  constructor(
    @InjectRepository(AccountsStorageEntity)
    private storageRepository: Repository<AccountsStorageEntity>
  ) {}

  async findStorageByAccount(address: string) {
    return this.storageRepository.find({
      where: { accountAddress: address },
    });
  }

  async updateAccountStorage(
    address: string,
    newStorage: AccountsStorageEntity[]
  ) {
    throw new NotImplementedException();
  }

  async create(accountStorage: AccountsStorageEntity) {
    throw new NotImplementedException();
  }

  async update(accountStorage: AccountsStorageEntity) {
    throw new NotImplementedException();
  }

  async delete(accountAddress: string, keyName: string) {
    throw new NotImplementedException();
  }
}
