import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AccountEntity } from "../entities/account.entity";
import { MoreThan, Repository } from "typeorm";
import { TransactionEntity } from "../../transactions/transaction.entity";
import { removeByBlockIds } from "../../blocks/entities/block-context.entity";

type PartialAccountWithPrimaryKey = Pick<AccountEntity, "address"> &
  Partial<AccountEntity>;

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

  async findOneWithRelationsByAddress(address: string) {
    return this.accountRepository.findOneOrFail({
      where: { address },
      relations: ["keys", "storage", "contracts", "transactions"],
    });
  }

  async findOneByAddress(address: string) {
    return this.accountRepository.findOneOrFail({
      where: { address },
    });
  }

  async upsert(accountToUpsert: PartialAccountWithPrimaryKey) {
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

  removeByBlockIds(blockIds: string[]) {
    return removeByBlockIds({
      blockIds,
      repository: this.accountRepository,
    });
  }
}
