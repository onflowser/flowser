import config from "../config";
import { Injectable } from "@nestjs/common";
import { Interval } from "@nestjs/schedule";
import { FlowGatewayService } from "./flow-gateway.service";
import { BlocksService } from "../blocks/blocks.service";
import { TransactionsService } from "../transactions/transactions.service";
import { AccountsService } from "../accounts/services/accounts.service";
import { ContractsService } from "../accounts/services/contracts.service";
import { EventsService } from "../events/events.service";
import { Account } from "../accounts/entities/account.entity";
import { Event } from "../events/entities/event.entity";
import { Transaction } from "../transactions/entities/transaction.entity";
import { Block } from "../blocks/entities/block.entity";
import { getMongoManager, MongoRepository } from "typeorm";

@Injectable()
export class FlowAggregatorService {

  constructor (
    private flowGatewayService: FlowGatewayService,
    private blockService: BlocksService,
    private transactionService: TransactionsService,
    private accountService: AccountsService,
    private contractService: ContractsService,
    private eventService: EventsService
  ) {}

  @Interval(config.dataFetchInterval)
  async fetchDataFromDataSource(): Promise<void> {
    return getMongoManager().transaction(async entityManager => {
      const {blocks, transactions, events} = await this.fetchData();

      const blockRepository = entityManager.getMongoRepository(Block);
      const transactionRepository = entityManager.getMongoRepository(Transaction);
      const eventRepository = entityManager.getMongoRepository(Event);
      const accountRepository = entityManager.getMongoRepository(Account);

      // store fetched data
      await Promise.all(blocks.map(e =>
        this.blockService.create(Block.init(e), blockRepository)
      ))
      await Promise.all(transactions.map(e =>
        this.transactionService.create(Transaction.init(e), transactionRepository)
      ))
      await Promise.all(events.map(e =>
        this.eventService.create(Event.init(e), eventRepository)
      ))
      await Promise.all(events.map(e => this.handleEvent(Event.init(e), accountRepository)))
    }).catch(e => {
      console.log(`[Flowser] failed to fetch data: `, e)
    })
  }

  async fetchData() {
    const lastStoredBlock = await this.blockService.findLastBlock();
    const latestBlock = await this.flowGatewayService.getLatestBlock();
    // fetch from initial block if no stored blocks found
    const startBlockHeight = lastStoredBlock ? lastStoredBlock.height : 0;
    const endBlockHeight = latestBlock.height;
    console.log(`[Flowser] block range: ${startBlockHeight} - ${endBlockHeight}`)
    const data = await this.flowGatewayService.getBlockDataWithinHeightRange(
      startBlockHeight,
      endBlockHeight
    );
    const events = data.map(({ events }) => events).flat();
    const transactions = data.map(({ transactions }) => transactions).flat();
    const blocks = data.map(({ block }) => block);
    return {events, transactions, blocks};
  }

  // https://github.com/onflow/cadence/blob/master/docs/language/core-events.md
  async handleEvent(event: Event, accountRepository?: MongoRepository<Account>) {
    const {data, type} = event;
    const {address} = data as any;
    const updateAccount = () => this.updateAccount(address, accountRepository)
    switch (type) {
      case "flow.AccountCreated":
        return this.handleAccountCreated(address, accountRepository);
      case "flow.AccountKeyAdded":
        return updateAccount();
      case "flow.AccountKeyRemoved":
        return updateAccount();
      case "flow.AccountContractAdded":
        return updateAccount();
      case "flow.AccountContractUpdated":
        return updateAccount();
      case "flow.AccountContractRemoved":
        return updateAccount();
      default:
        return null; // not a core event, ignore it
    }
  }

  async handleAccountCreated(address: string, repository?: MongoRepository<Account>) {
    const account = await this.flowGatewayService.getAccount(address);
    return this.accountService.create(Account.init(account), repository);
  }

  async updateAccount(address: string, repository?: MongoRepository<Account>) {
    const account = await this.flowGatewayService.getAccount(address);
    return this.accountService.update(
      address,
      Account.init(account, {updatedAt: new Date().getTime()}),
      repository
    )
  }
}
