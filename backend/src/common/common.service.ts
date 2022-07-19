import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { MongoRepository } from "typeorm";
import { Log } from "../logs/entities/log.entity";
import { Account } from "../accounts/entities/account.entity";
import { Block } from "../blocks/entities/block.entity";
import { Transaction } from "../transactions/entities/transaction.entity";
import { Event } from "../events/entities/event.entity";
import { ContractsService } from "../accounts/services/contracts.service";

@Injectable()
export class CommonService {
  constructor(
    @InjectRepository(Log)
    private commonRepository: MongoRepository<Account>,
    private contractsService: ContractsService
  ) {}

  async getCounters() {
    const [log, accounts, blocks, transactions, events, contracts] =
      await Promise.all([
        this.commonRepository.manager.stats(Log),
        this.commonRepository.manager.stats(Account),
        this.commonRepository.manager.stats(Block),
        this.commonRepository.manager.stats(Transaction),
        this.commonRepository.manager.stats(Event),
        this.contractsService.findAllNewerThanTimestamp(0),
      ]);
    return {
      log: log.count,
      accounts: accounts.count,
      blocks: blocks.count,
      transactions: transactions.count,
      events: events.count,
      contracts: contracts.length,
    };
  }
}
