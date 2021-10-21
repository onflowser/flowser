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
      where: {createdAt: {$gt: timestamp}}
    });
  }

  findAll() {
    return this.transactionRepository.find();
  }

  findAllByBlock(blockId: string) {
    return this.transactionRepository.find({
      where: {referenceBlockId:blockId}
    });
  }

  findAllByBlockNewerThanTimestamp(blockId: string, timestamp) {
    return this.transactionRepository.find({
      where: {
        referenceBlockId: blockId,
        createdAt: {$gt: timestamp}
      }
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
}
