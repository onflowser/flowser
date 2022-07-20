import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateAccountDto } from "../dto/create-account.dto";
import { UpdateAccountDto } from "../dto/update-account.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Account } from "../entities/account.entity";
import { Repository } from "typeorm";
import { Transaction } from "../../transactions/entities/transaction.entity";

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>
  ) {}

  create(createAccountDto: CreateAccountDto) {
    return this.accountRepository.save(createAccountDto);
  }

  findAll() {
    return this.accountRepository.find({
      order: { createdAt: "DESC", updatedAt: "DESC" },
    });
  }

  // TODO: refactor data model
  findAllNewerThanTimestamp(timestamp): Promise<Account[]> {
    // Finds all accounts that have been updated or created after the given timestamp
    // and returns them as an array of Account objects
    return Promise.resolve([]); // TODO: write SQL query
  }

  async findOne(address: string) {
    return this.accountRepository.findOneByOrFail({ address });
  }

  async findOneByAddress(address: string) {
    const account = await this.findOne(address);
    const addressWithout0x = account.address.substr(2);
    const transactions = []; // TODO: Write SQL query
    // const transactions = await this.transactionRepository
    //   .aggregate([
    //     { $match: { payer: addressWithout0x } },
    //     { $project: { _id: 0 } },
    //   ])
    //   .sort({ createdAt: -1 })
    //   .toArray();

    return { ...account, transactions };
  }

  replace(address: string, updateAccountDto: UpdateAccountDto) {
    // Re-fetch and insert the whole account entity
    // contracts & keys can be added or removed
    // therefore collection needs to be replaced and not just updated
    return this.accountRepository.upsert(
      { ...updateAccountDto, updatedAt: new Date() },
      { conflictPaths: ["address"] }
    );
  }

  update(address: string, updateAccountDto: UpdateAccountDto) {
    return this.accountRepository.update(
      { address },
      {
        ...updateAccountDto,
        updatedAt: new Date(),
      }
    );
  }

  removeAll() {
    return this.accountRepository.delete({});
  }
}
