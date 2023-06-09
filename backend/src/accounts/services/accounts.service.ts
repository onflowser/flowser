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

  async findOneByAddress(address: string) {
    return this.accountRepository.findOneOrFail({
      where: { address },
      relations: ["keys", "storage", "contracts", "transactions"],
    });
  }

  async upsert(accountToUpsert: AccountEntity) {
    const existingAccount = await this.accountRepository.findOneBy({
      address: accountToUpsert.address,
    });
    return this.accountRepository.upsert(
      { ...(existingAccount ?? {}), ...accountToUpsert },
      ["address"]
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
