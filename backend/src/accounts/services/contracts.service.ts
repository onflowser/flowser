import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AccountContractEntity } from "../entities/contract.entity";
import { computeEntitiesDiff, processEntitiesDiff } from "../../utils";

@Injectable()
export class ContractsService {
  constructor(
    @InjectRepository(AccountContractEntity)
    private contractRepository: Repository<AccountContractEntity>
  ) {}

  async countAll() {
    return this.contractRepository.count();
  }

  async findAll() {
    return this.contractRepository.find({
      order: { createdAt: "DESC" },
    });
  }

  async findAllNewerThanTimestamp(
    timestamp: Date
  ): Promise<AccountContractEntity[]> {
    return this.contractRepository
      .createQueryBuilder("contract")
      .select()
      .where("contract.updatedAt > :timestamp", { timestamp })
      .orWhere("contract.createdAt > :timestamp", { timestamp })
      .orderBy("contract.createdAt", "DESC")
      .getMany();
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
    const { accountAddress, name } = AccountContractEntity.parseId(id);
    return this.contractRepository.findOneByOrFail({
      accountAddress,
      name,
    });
  }

  async update(contract: AccountContractEntity) {
    return this.contractRepository.update(
      { accountAddress: contract.accountAddress, name: contract.name },
      contract
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
      primaryKey: "name",
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
}
