import { Injectable } from '@nestjs/common';
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

  findOne(id: string) {
    return this.transactionService.findOne(id);
  }

  update(id: string, updateTransactionDto: UpdateTransactionDto) {
    return `This action updates a #${id} transaction`;
  }

  remove(id: string) {
    return `This action removes a #${id} transaction`;
  }
}
