import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TransactionEntity } from "./entities/transaction.entity";
import { MoreThan, Repository } from "typeorm";

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(TransactionEntity)
    private transactionRepository: Repository<TransactionEntity>
  ) {}

  create(transaction: TransactionEntity) {
    return this.transactionRepository.save(transaction);
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
      where: { referenceBlockId: blockId },
      order: { createdAt: "DESC" },
    });
  }

  findAllByBlockNewerThanTimestamp(blockId: string, timestamp: Date) {
    return this.transactionRepository.find({
      where: {
        referenceBlockId: blockId,
        createdAt: MoreThan(timestamp),
      },
      order: { createdAt: "DESC" },
    });
  }

  async findOne(id: string) {
    const [transaction] = await this.transactionRepository.find({
      where: { id },
    });
    if (transaction) {
      return transaction;
    } else {
      throw new NotFoundException("Transaction not found");
    }
  }

  removeAll() {
    return this.transactionRepository.delete({});
  }
}
