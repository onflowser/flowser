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

  findAll() {
    return `This action returns all transactions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} transaction`;
  }

  update(id: number, updateTransactionDto: UpdateTransactionDto) {
    return `This action updates a #${id} transaction`;
  }

  remove(id: number) {
    return `This action removes a #${id} transaction`;
  }
}
