import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AccountKeyEntity } from "../entities/key.entity";
import { Repository } from "typeorm";
import { computeEntitiesDiff, processEntitiesDiff } from "../../utils";

@Injectable()
export class KeysService {
  constructor(
    @InjectRepository(AccountKeyEntity)
    private keyRepository: Repository<AccountKeyEntity>
  ) {}

  async updateAccountKeys(address: string, newKeys: AccountKeyEntity[]) {
    const oldKeys = await this.findKeysByAccount(address);
    const entitiesDiff = computeEntitiesDiff<AccountKeyEntity>({
      primaryKey: "index",
      newEntities: newKeys,
      oldEntities: oldKeys,
    });
    return processEntitiesDiff<AccountKeyEntity>({
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

  async create(accountKey: AccountKeyEntity) {
    return this.keyRepository.insert(accountKey);
  }

  async update(accountKey: AccountKeyEntity) {
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
