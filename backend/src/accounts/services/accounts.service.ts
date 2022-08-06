import { Injectable } from "@nestjs/common";
import { CreateAccountDto } from "../dto/create-account.dto";
import { UpdateAccountDto } from "../dto/update-account.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { AccountEntity } from "../entities/account.entity";
import { MoreThan, Repository } from "typeorm";
import { TransactionEntity } from "../../transactions/entities/transaction.entity";
import { ContractsService } from "./contracts.service";
import { plainToInstance } from "class-transformer";

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(AccountEntity)
    private accountRepository: Repository<AccountEntity>,
    @InjectRepository(TransactionEntity)
    private transactionRepository: Repository<TransactionEntity>,
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

  findAllNewerThanTimestamp(timestamp: Date): Promise<AccountEntity[]> {
    return this.accountRepository.find({
      where: [
        { updatedAt: MoreThan(timestamp) },
        { createdAt: MoreThan(timestamp) },
      ],
      order: {
        createdAt: "DESC",
      },
    });
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
    const account = plainToInstance(AccountEntity, createAccountDto);
    return this.accountRepository.insert(account);
  }

  async update(address: string, updateAccountDto: UpdateAccountDto) {
    const account = await this.accountRepository.findOneByOrFail({ address });
    const updatedAccount = Object.assign(account, updateAccountDto);
    account.markUpdated();
    return this.accountRepository.update({ address }, updatedAccount);
  }

  async markUpdated(address: string) {
    const account = await this.accountRepository.findOneByOrFail({ address });
    account.markUpdated();
    return this.update(address, account);
  }

  removeAll() {
    return this.accountRepository.delete({});
  }
}
