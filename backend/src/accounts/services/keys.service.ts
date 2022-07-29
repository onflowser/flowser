import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AccountKey } from "../entities/key.entity";
import { Repository } from "typeorm";
import { computeEntitiesDiff, processEntitiesDiff } from "../../utils";

@Injectable()
export class KeysService {
  constructor(
    @InjectRepository(AccountKey)
    private keyRepository: Repository<AccountKey>
  ) {}

  async updateAccountKeys(address: string, newKeys: AccountKey[]) {
    const oldKeys = await this.findKeysByAccount(address);
    const entitiesDiff = computeEntitiesDiff<AccountKey>({
      primaryKey: "index",
      newEntities: newKeys,
      oldEntities: oldKeys,
    });
    return processEntitiesDiff<AccountKey>({
      create: (e) => this.create(e),
      update: (e) => this.update(e),
      delete: (e) => this.delete(e.accountAddress, e.index),
      diff: entitiesDiff,
    });
  }

  async findKeysByAccount(address: string) {
    return this.keyRepository.find({
      where: { accountAddress: address },
    });
  }

  async delete(accountAddress: string, keyIndex: number) {
    return this.keyRepository.delete({
      accountAddress,
      index: keyIndex,
    });
  }

  async create(accountKey: AccountKey) {
    return this.keyRepository.insert(accountKey);
  }

  async update(accountKey: AccountKey) {
    return this.keyRepository.update(
      {
        accountAddress: accountKey.accountAddress,
        index: accountKey.index,
      },
      accountKey
    );
  }

  removeAll() {
    return this.keyRepository.delete({});
  }
}
