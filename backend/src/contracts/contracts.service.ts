import { Injectable } from '@nestjs/common';
import { CreateContractDto } from './dto/create-contract.dto';
import { UpdateContractDto } from './dto/update-contract.dto';
import { InjectRepository } from "@nestjs/typeorm";
import { AccountContract } from "../accounts/entities/contract.entity";
import { MongoRepository } from "typeorm";

@Injectable()
export class ContractsService {

  constructor (
    @InjectRepository(AccountContract)
    private contractRepository: MongoRepository<AccountContract>
  ) {}

  create(createContractDto: CreateContractDto) {
    return this.contractRepository.save(createContractDto);
  }

  findAll() {
    return `This action returns all contracts`;
  }

  findOne(id: number) {
    return `This action returns a #${id} contract`;
  }

  findOneByName(name: string) {
    return this.contractRepository.findOne({ where: { name }});
  }

  update(id: number, updateContractDto: UpdateContractDto) {
    return `This action updates a #${id} contract`;
  }

  remove(id: number) {
    return `This action removes a #${id} contract`;
  }
}
