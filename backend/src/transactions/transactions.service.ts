import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TransactionEntity } from "./transaction.entity";
import { MoreThan, Repository, Any } from "typeorm";
import { TransactionStatus } from "@flowser/shared";
import { removeByBlockIds } from '../blocks/entities/block-context.entity';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(TransactionEntity)
    private transactionRepository: Repository<TransactionEntity>
  ) {}

  createOrUpdate(transaction: TransactionEntity) {
    return this.transactionRepository.save(transaction);
  }

  async updateStatus(transactionId: string, status: TransactionStatus) {
    const transaction = await this.findOneOrThrow(transactionId);
    transaction.status = status;
    await this.createOrUpdate(transaction);
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

  async findOneOrThrow(id: string) {
    return this.transactionRepository.findOneOrFail({
      where: { id },
    });
  }

  async findOne(id: string) {
    return this.transactionRepository.findOne({
      where: { id },
    });
  }

  removeAll() {
    return this.transactionRepository.delete({});
  }

  removeByBlockIds(blockIds: string[]) {
    return removeByBlockIds({
      blockIds,
      repository: this.transactionRepository
    })
  }
}
