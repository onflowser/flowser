import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TransactionEntity } from "./entities/transaction.entity";
import { MoreThan, Repository } from "typeorm";
import { TransactionStatus } from "@flowser/types/generated/entities/transactions";

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(TransactionEntity)
    private transactionRepository: Repository<TransactionEntity>
  ) {}

  create(transaction: TransactionEntity) {
    return this.transactionRepository.save(transaction);
  }

  updateStatus(transactionId: string, status: TransactionStatus) {
    return this.transactionRepository.update(transactionId, {
      status,
      updatedAt: new Date(),
    });
  }

  async countAll() {
    return this.transactionRepository.count();
  }

  findAll() {
    return this.transactionRepository.find({
      order: { createdAt: "DESC" },
    });
  }

  findAllByBlock(blockId: string) {
    return this.transactionRepository.find({
      where: { blockId },
      order: { createdAt: "DESC" },
    });
  }

  findAllNewerThanTimestamp(timestamp: Date): Promise<TransactionEntity[]> {
    return this.transactionRepository.find({
      where: [
        { createdAt: MoreThan(timestamp) },
        { updatedAt: MoreThan(timestamp) },
      ],
      order: { createdAt: "DESC" },
    });
  }

  findAllNewerThanTimestampByBlock(blockId: string, timestamp: Date) {
    return this.transactionRepository.find({
      where: [
        { updatedAt: MoreThan(timestamp), blockId },
        { createdAt: MoreThan(timestamp), blockId },
      ],
      order: { createdAt: "DESC" },
    });
  }

  findAllNewerThanTimestampByAccount(payerAddress: string, timestamp: Date) {
    return this.transactionRepository.find({
      where: [
        { updatedAt: MoreThan(timestamp), payerAddress },
        { createdAt: MoreThan(timestamp), payerAddress },
      ],
      order: { createdAt: "DESC" },
    });
  }

  async findOne(id: string) {
    return this.transactionRepository.findOneOrFail({
      where: { id },
    });
  }

  removeAll() {
    return this.transactionRepository.delete({});
  }
}
