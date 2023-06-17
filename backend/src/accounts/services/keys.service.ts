import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AccountKeyEntity } from "../entities/key.entity";
import { MoreThan, Repository } from "typeorm";
import { computeEntitiesDiff, processEntitiesDiff } from "../../utils";
import { removeByBlockIds } from "../../blocks/entities/block-context.entity";

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
      create: (e) => this.upsert(e),
      update: (e) => this.upsert(e),
      delete: (e) => this.delete(e.accountAddress, e.index),
      diff: entitiesDiff,
    });
  }

  async findAllNewerThanTimestampByAccount(
    accountAddress: string,
    timestamp: Date
  ) {
    return this.keyRepository.find({
      where: [
        { updatedAt: MoreThan(timestamp), accountAddress },
        { createdAt: MoreThan(timestamp), accountAddress },
      ],
      order: { createdAt: "DESC" },
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

  async upsert(createdOrUpdatedKey: AccountKeyEntity) {
    const existingKey = await this.keyRepository.findOneBy({
      accountAddress: createdOrUpdatedKey.accountAddress,
      index: createdOrUpdatedKey.index,
    });
    createdOrUpdatedKey.markUpdated();
    return this.keyRepository.upsert(
      {
        ...createdOrUpdatedKey,
        // Don't override the exiting private key with an empty one.
        privateKey: createdOrUpdatedKey.privateKey
          ? createdOrUpdatedKey.privateKey
          : existingKey?.privateKey,
        // Make sure to keep the original created date.
        createdAt: existingKey?.createdAt ?? createdOrUpdatedKey.createdAt,
      },
      {
        conflictPaths: ["index", "accountAddress"],
      }
    );
  }

  removeAll() {
    return this.keyRepository.delete({});
  }

  removeByBlockIds(blockIds: string[]) {
    return removeByBlockIds({
      blockIds,
      repository: this.keyRepository,
    });
  }
}
