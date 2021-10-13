import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAccountDto } from '../dto/create-account.dto';
import { UpdateAccountDto } from '../dto/update-account.dto';
import { InjectRepository } from "@nestjs/typeorm";
import { Account } from "../entities/account.entity";
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
    return this.accountRepository.find();
  }

  findAllNewerThanTimestamp(timestamp): Promise<Account[]> {
    return this.accountRepository.find({
      where: {createdAt: {$gt: timestamp}}
    });
  }

  async findOne(id: string) {
    const [account] = await this.accountRepository.find({ where: {_id: id} });
    if (account) {
      return account;
    } else {
      throw new NotFoundException("Account not found")
    }
  }

  findOneByAddress(address: string) {
    return this.accountRepository.findOne({ where: { address }});
  }

  update(address: string, updateAccountDto: UpdateAccountDto) {
    // we refetch and insert the whole account entity
    // contracts & keys can be added or removed
    // therefore collection needs to be replaced and not just updated
    return this.accountRepository.replaceOne(
      { address },
      updateAccountDto,
      // TODO: why default emulator-account creation event is not logged inside a transaction ?
      // this is why we need to create new account if account doesn't exists (edge case)
      { upsert: true }
    );
  }

  remove(id: string) {
    return `This action removes a #${id} account`;
  }
}
