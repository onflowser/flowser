import { Injectable } from "@nestjs/common";
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
  // https://www.notion.so/flowser/Improve-relational-data-model-fc3f8b8bd60d4a76a169328e6eaf124a
  findAllNewerThanTimestamp(timestamp): Promise<Account[]> {
    return this.accountRepository
      .createQueryBuilder("account")
      .select()
      .where("account.updatedAt > :timestamp", { timestamp })
      .orWhere("account.createdAt > :timestamp", { timestamp })
      .orderBy("account.createdAt", "DESC")
      .getMany();
  }

  async findOne(address: string) {
    return this.accountRepository.findOneByOrFail({ address });
  }

  async findOneByAddress(address: string) {
    const account = await this.findOne(address);
    const addressWithout0xPrefix = account.address.substr(2);
    const transactions = this.transactionRepository
      .createQueryBuilder("transaction")
      .where("transaction.payer = :address", {
        address: addressWithout0xPrefix,
      })
      .getMany();

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
