import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { Log } from '../logs/entities/log.entity';
import { Account } from '../accounts/entities/account.entity';
import { Block } from '../blocks/entities/block.entity';
import { Transaction } from '../transactions/entities/transaction.entity';
import { Event } from '../events/entities/event.entity';
import { ContractsService } from '../accounts/services/contracts.service';

@Injectable()
export class CommonService {
    constructor(
        @InjectRepository(Log)
        private commonRepository: MongoRepository<Account>,
        private contractsService: ContractsService
    ) {
    }

    async getCounters() {
        return {
            log: (await this.commonRepository.manager.stats(Log)).count,
            accounts: (await this.commonRepository.manager.stats(Account)).count,
            blocks: (await this.commonRepository.manager.stats(Block)).count,
            transactions: (await this.commonRepository.manager.stats(Transaction)).count,
            events: (await this.commonRepository.manager.stats(Event)).count,
            contracts: (await this.contractsService.findAllNewerThanTimestamp(0)).length
        }
    }
}
