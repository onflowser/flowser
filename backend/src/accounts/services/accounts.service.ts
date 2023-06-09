import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AccountEntity } from "../entities/account.entity";
import { MoreThan, Repository } from "typeorm";
import { TransactionEntity } from "../../transactions/entities/transaction.entity";

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(AccountEntity)
    private accountRepository: Repository<AccountEntity>,
    @InjectRepository(TransactionEntity)
    private transactionRepository: Repository<TransactionEntity>
  ) {}

  findAll() {
    return this.accountRepository.find({
      order: { createdAt: "DESC", updatedAt: "DESC" },
    });
  }

  async findAllAddresses() {
    const result = await this.accountRepository
      .createQueryBuilder()
      .select("address")
      .getRawMany();
    return result.map((result) => result.address) as string[];
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

  async accountExists(address: string) {
    const existingAccount = await this.accountRepository.findOneBy({ address });
    return existingAccount !== null;
  }

  async findOneByAddress(address: string) {
    return this.accountRepository.findOneOrFail({
      where: { address },
      relations: ["keys", "storage", "contracts", "transactions"],
    });
  }

  async create(account: AccountEntity) {
    return this.accountRepository.insert(account);
  }

  // TODO(custom-wallet): Should we replace update/create calls with upsert?
  async upsert(accountToUpsert: AccountEntity) {
    const account = await this.accountRepository.findOneBy({
      address: accountToUpsert.address,
    });
    return this.accountRepository.upsert(
      { ...(account ?? {}), ...accountToUpsert },
      ["address"]
    );
  }

  // TODO(custom-wallet): Why do we not use the `updatedAccount` here?
  async update(address: string, updatedAccount: AccountEntity) {
    const account = await this.accountRepository.findOneByOrFail({ address });
    account.markUpdated();
    return this.accountRepository.update(
      { address },
      // Prevent overwriting existing created date
      { ...account, createdAt: undefined }
    );
  }

  async markUpdated(address: string) {
    return this.accountRepository.update(
      { address },
      { updatedAt: new Date() }
    );
  }

  removeAll() {
    return this.accountRepository.delete({});
  }
}
