import config from "../config";
import { Injectable } from "@nestjs/common";
import { Interval } from "@nestjs/schedule";
import { FlowGatewayService } from "./flow-gateway.service";
import { BlocksService } from "../blocks/blocks.service";
import { TransactionsService } from "../transactions/transactions.service";
import { AccountsService } from "../accounts/accounts.service";
import { ContractsService } from "../contracts/contracts.service";
import { EventsService } from "../events/events.service";
import { Account } from "../accounts/entities/account.entity";
import { Event } from "../events/entities/event.entity";
import { Transaction } from "../transactions/entities/transaction.entity";
import { Block } from "../blocks/entities/block.entity";

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
    try {
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
      // store fetched data
      await Promise.all(blocks.map(e => this.blockService.create(Block.init(e))))
      await Promise.all(transactions.map(e => this.transactionService.create(Transaction.init(e))))
      await Promise.all(events.map(e => this.eventService.create(Event.init(e))))
      await Promise.all(events.map(e => this.handleEvent(Event.init(e))))
    } catch (e) {
      console.error(`[Flowser] block fetch error: ${e}`, e.stack)
    }
  }

  // https://github.com/onflow/cadence/blob/master/docs/language/core-events.md
  async handleEvent(event: Event) {
    console.log(`[Flowser] handling event: `, event.type)
    const {data, type} = event;
    const {address, contract} = data as any;
    switch (type) {
      case "flow.AccountCreated":
        return this.handleAccountCreated(address);
      case "flow.AccountKeyAdded":
        return this.handleAccountKeyAdded(address);
      case "flow.AccountKeyRemoved":
        return this.handleAccountKeyRemoved(address);
      case "flow.AccountContractAdded":
        return this.handleAccountContractAdded(address, contract);
      case "flow.AccountContractUpdated":
        return this.handleAccountContractUpdated(address, contract);
      case "flow.AccountContractRemoved":
        return this.handleAccountContractRemoved(address, contract);
      default:
        return null; // not a core event, ignore it
    }
  }

  async handleAccountCreated(address: string) {
    const account = await this.flowGatewayService.getAccount(address);
    console.log("[Flow] Account created: ", account.address);
    return this.accountService.create(Account.init(account));
  }

  async handleAccountKeyAdded(address: string) {
    return this.updateAccount(address)
  }

  async handleAccountKeyRemoved(address: string) {
    return this.handleAccountKeyAdded(address);
  }

  async handleAccountContractAdded(address: string, contractName: string) {
    return this.updateAccount(address)
  }

  async handleAccountContractUpdated(address: string, contractName: string) {
    return this.updateAccount(address)
  }

  async handleAccountContractRemoved(address: string, contractName: string) {
    return this.updateAccount(address)
  }

  async updateAccount(address: string) {
    const account = await this.flowGatewayService.getAccount(address);
    console.log("[Flow] Account updated: ", account.address);
    return this.accountService.update(address, Account.init(account))
  }
}
