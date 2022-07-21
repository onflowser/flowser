import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AccountContract } from "../entities/contract.entity";

@Injectable()
export class ContractsService {
  constructor(
    @InjectRepository(AccountContract)
    private contractRepository: Repository<AccountContract>
  ) {}

  async findAll() {
    return this.contractRepository.find({
      order: { createdAt: "DESC" },
    });
  }

  async findAllNewerThanTimestamp(timestamp: Date): Promise<AccountContract[]> {
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
    const { accountAddress, name } = AccountContract.parseId(id);
    return this.contractRepository.findOneByOrFail({
      accountAddress,
      name,
    });
  }

  async replace(contract: AccountContract) {
    return this.contractRepository.upsert(contract, {
      conflictPaths: ["accountAddress", "name"],
    });
  }

  async create(contract: AccountContract) {
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
