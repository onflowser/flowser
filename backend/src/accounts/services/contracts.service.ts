import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { MoreThan, Repository } from "typeorm";
import { AccountContractEntity } from "../entities/contract.entity";
import { computeEntitiesDiff, processEntitiesDiff } from "../../utils";
import { removeByBlockIds } from "../../blocks/entities/block-context.entity";

@Injectable()
export class ContractsService {
  constructor(
    @InjectRepository(AccountContractEntity)
    private contractRepository: Repository<AccountContractEntity>
  ) {}

  async findAll() {
    return this.contractRepository.find({
      order: { createdAt: "DESC" },
    });
  }

  async findAllNewerThanTimestamp(
    timestamp: Date
  ): Promise<AccountContractEntity[]> {
    return this.contractRepository.find({
      where: [
        { updatedAt: MoreThan(timestamp) },
        { createdAt: MoreThan(timestamp) },
      ],
      order: { createdAt: "DESC" },
    });
  }

  async findAllNewerThanTimestampByAccount(
    accountAddress: string,
    timestamp: Date
  ) {
    return this.contractRepository.find({
      where: [
        { updatedAt: MoreThan(timestamp), accountAddress },
        { createdAt: MoreThan(timestamp), accountAddress },
      ],
      order: { createdAt: "DESC" },
    });
  }

  async getContractsByAccountAddress(address: string) {
    return this.contractRepository
      .createQueryBuilder("contract")
      .where("contract.accountAddress = :accountAddress", {
        accountAddress: address,
      })
      .getMany();
  }

  async findOne(id: string) {
    const { accountAddress, name } = AccountContractEntity.decodeId(id);
    return this.contractRepository.findOneByOrFail({
      accountAddress,
      name,
    });
  }

  async update(contract: AccountContractEntity) {
    contract.markUpdated();
    return this.contractRepository.update(
      { accountAddress: contract.accountAddress, name: contract.name },
      // Prevent overwriting existing created date
      { ...contract, createdAt: undefined }
    );
  }

  async updateAccountContracts(
    accountAddress: string,
    newContracts: AccountContractEntity[]
  ) {
    const oldContracts = await this.getContractsByAccountAddress(
      accountAddress
    );
    const contractsDiff = computeEntitiesDiff({
      primaryKey: ["accountAddress", "name"],
      oldEntities: oldContracts,
      newEntities: newContracts,
    });
    return processEntitiesDiff<AccountContractEntity>({
      create: (e) => this.create(e),
      update: (e) => this.update(e),
      delete: (e) => this.delete(e.accountAddress, e.name),
      diff: contractsDiff,
    });
  }

  async create(contract: AccountContractEntity) {
    return this.contractRepository.insert(contract);
  }

  async delete(accountAddress: string, contractName: string) {
    return this.contractRepository.delete({
      accountAddress,
      name: contractName,
    });
  }

  removeAll() {
    return this.contractRepository.delete({});
  }

  removeByBlockIds(blockIds: string[]) {
    return removeByBlockIds({
      blockIds,
      repository: this.contractRepository,
    });
  }
}
