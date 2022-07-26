import { Injectable } from "@nestjs/common";
import { CreateAccountDto } from "../dto/create-account.dto";
import { UpdateAccountDto } from "../dto/update-account.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Account } from "../entities/account.entity";
import { Repository } from "typeorm";
import { Transaction } from "../../transactions/entities/transaction.entity";
import { ContractsService } from "./contracts.service";
import { plainToClass } from "class-transformer";

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    private contractsService: ContractsService
  ) {}

  async countAll() {
    return this.accountRepository.count();
  }

  findAll() {
    return this.accountRepository.find({
      order: { createdAt: "DESC", updatedAt: "DESC" },
    });
  }

  findAllNewerThanTimestamp(timestamp: Date): Promise<Account[]> {
    return this.accountRepository
      .createQueryBuilder("account")
      .select()
      .where("account.updatedAt > :timestamp", { timestamp })
      .orWhere("account.createdAt > :timestamp", { timestamp })
      .orderBy("account.createdAt", "DESC")
      .getMany();
  }

  async findOne(address: string) {
    return this.accountRepository.findOneOrFail({
      where: { address },
      relations: ["keys", "storage"],
    });
  }

  async findOneByAddress(address: string) {
    const addressWithout0xPrefix = address.substr(2);
    const accountPromise = this.findOne(address);
    const transactionsPromise = this.transactionRepository
      .createQueryBuilder("transaction")
      .where("transaction.payer = :address", {
        address: addressWithout0xPrefix,
      })
      .getMany();
    const contractsPromise =
      this.contractsService.getContractsByAccountAddress(address);

    const [account, transactions, contracts] = await Promise.all([
      accountPromise,
      transactionsPromise,
      contractsPromise,
    ]);

    return { ...account, transactions, contracts };
  }

  async create(createAccountDto: CreateAccountDto) {
    const account = plainToClass(Account, createAccountDto);
    return this.accountRepository.insert(account);
  }

  async update(address: string, updateAccountDto: UpdateAccountDto) {
    const account = await this.accountRepository.findOneByOrFail({ address });
    const updatedAccount = Object.assign(account, updateAccountDto);
    account.markUpdated();
    return this.accountRepository.update({ address }, updatedAccount);
  }

  async markUpdated(address: string) {
    const account = await this.accountRepository
      .findOneByOrFail({ address })
      .catch((e) => {
        console.log("Mark updated error", e);
        throw e;
      });
    account.markUpdated();
    return this.update(address, account);
  }

  removeAll() {
    return this.accountRepository.delete({});
  }
}
