import { Injectable } from '@nestjs/common';
import { CreateContractDto } from '../dto/create-contract.dto';
import { UpdateContractDto } from '../dto/update-contract.dto';
import { InjectRepository } from "@nestjs/typeorm";
import { MongoRepository } from "typeorm";
import { Account } from "../entities/account.entity";
import { AccountContract } from "../entities/contract.entity";

@Injectable()
export class ContractsService {


  constructor (
    @InjectRepository(Account)
    private accountRepository: MongoRepository<Account>
  ) {}

  create(createContractDto: CreateContractDto) {
    return this.accountRepository.save(createContractDto);
  }

  async findAll() {
    return serializeAccountContracts(await this.accountRepository.find());
  }

  async findAllNewerThanTimestamp(timestamp): Promise<AccountContract[]> {
    return serializeAccountContracts(await this.accountRepository.find({
      where: {'contracts.createdAt': {$gt: timestamp}},
    }));
  }

  findOne(id: number) {
    return `This action returns a #${id} contract`;
  }

  findOneByName(name: string) {
    return this.accountRepository.findOne({ where: { name }});
  }

  update(id: number, updateContractDto: UpdateContractDto) {
    return `This action updates a #${id} contract`;
  }

  remove(id: number) {
    return `This action removes a #${id} contract`;
  }
}

// TODO(jernej): how to perform this logic with mongodb queries ?
// this is not as performant + I don't know how to select contracts._id field
function serializeAccountContracts(accounts: Account[]) {
  return accounts.map(account =>
    account.contracts.map(contract =>
      ({accountAddress: account.address, ...contract})
    )
  ).flat()
}
