import { Injectable, NotImplementedException } from "@nestjs/common";
import { AccountsStorage } from "../entities/storage.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

// TODO(milestone-2): implement this class
@Injectable()
export class StorageService {
  constructor(
    @InjectRepository(AccountsStorage)
    private storageRepository: Repository<AccountsStorage>
  ) {}

  async findStorageByAccount(address: string) {
    return this.storageRepository.find({
      where: { accountAddress: address },
    });
  }

  async updateAccountStorage(address: string, newStorage: AccountsStorage[]) {
    throw new NotImplementedException();
  }

  async create(accountStorage: AccountsStorage) {
    throw new NotImplementedException();
  }

  async update(accountStorage: AccountsStorage) {
    throw new NotImplementedException();
  }

  async delete(accountAddress: string, keyName: string) {
    throw new NotImplementedException();
  }
}
