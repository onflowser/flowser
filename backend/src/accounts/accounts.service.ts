import { Injectable } from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { InjectRepository } from "@nestjs/typeorm";
import { Account } from "./entities/account.entity";
import { MongoRepository } from "typeorm";

@Injectable()
export class AccountsService {

  constructor (
    @InjectRepository(Account)
    private accountRepository: MongoRepository<Account>
  ) {}

  create(createAccountDto: CreateAccountDto) {
    return this.accountRepository.save(createAccountDto);
  }

  findAll() {
    return `This action returns all accounts`;
  }

  findOne(id: number) {
    return `This action returns a #${id} account`;
  }

  findOneByAddress(address: string) {
    return this.accountRepository.findOne({ where: { address }});
  }

  update(address: string, updateAccountDto: UpdateAccountDto) {
    return this.accountRepository.updateOne({ address }, updateAccountDto);
  }

  remove(id: number) {
    return `This action removes a #${id} account`;
  }
}
