import { Injectable, NotImplementedException } from "@nestjs/common";
import { AccountsStorage } from "../entities/storage.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

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
    // TODO: implement in later milestone
    // https://www.notion.so/flowser/Migrate-to-up-to-date-flow-cli-version-a2a3837d11b9451bb0df1751620bbe1d
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
