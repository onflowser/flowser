import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { InjectRepository } from "@nestjs/typeorm";
import { Transaction } from "./entities/transaction.entity";
import { MongoRepository } from "typeorm";

@Injectable()
export class TransactionsService {

  constructor (
    @InjectRepository(Transaction)
    private transactionService: MongoRepository<Transaction>
  ) {}


  create(createTransactionDto: CreateTransactionDto) {
    return this.transactionService.save(createTransactionDto);
  }

  findAllNewerThanTimestamp(timestamp): Promise<Transaction[]> {
    return this.transactionService.find({
      where: {createdAt: {$gt: timestamp}}
    });
  }

  findAll() {
    return this.transactionService.find();
  }

  findAllByBlock(blockId: string) {
    return this.transactionService.find({
      where: {referenceBlockId:blockId}
    });
  }

  async findOne(id: string) {
    const [transaction] = await this.transactionService.find({ where: {_id: id} });
    if (transaction) {
      return transaction;
    } else {
      throw new NotFoundException("Transaction not found")
    }
  }

  update(id: string, updateTransactionDto: UpdateTransactionDto) {
    return `This action updates a #${id} transaction`;
  }

  remove(id: string) {
    return `This action removes a #${id} transaction`;
  }
}
