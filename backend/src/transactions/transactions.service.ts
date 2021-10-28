import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { InjectRepository } from "@nestjs/typeorm";
import { Transaction } from "./entities/transaction.entity";
import { MongoRepository } from "typeorm";

@Injectable()
export class TransactionsService {

  constructor (
    @InjectRepository(Transaction)
    private transactionRepository: MongoRepository<Transaction>
  ) {}


  create(createTransactionDto: CreateTransactionDto) {
    return this.transactionRepository.save(createTransactionDto);
  }

  findAllNewerThanTimestamp(timestamp): Promise<Transaction[]> {
    return this.transactionRepository.find({
      where: {
        $or: [
          {createdAt: {$gt: timestamp}},
          {updatedAt: {$gt: timestamp}},
        ]
      },
      order: {createdAt: "DESC"}
    });
  }

  findAll() {
    return this.transactionRepository.find({
      order: {createdAt: "DESC"}
    });
  }

  findAllByBlock(blockId: string) {
    return this.transactionRepository.find({
      where: {referenceBlockId:blockId},
      order: {createdAt: "DESC"}
    });
  }

  findAllByBlockNewerThanTimestamp(blockId: string, timestamp) {
    return this.transactionRepository.find({
      where: {
        referenceBlockId: blockId,
        createdAt: {$gt: timestamp}
      },
      order: {createdAt: "DESC"}
    });
  }

  async findOne(id: string) {
    const [transaction] = await this.transactionRepository.find({ where: {id} });
    if (transaction) {
      return transaction;
    } else {
      throw new NotFoundException("Transaction not found")
    }
  }

  removeAll() {
    return this.transactionRepository.delete({});
  }
}
