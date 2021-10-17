import config from "../../config";
import { Injectable } from "@nestjs/common";
import { Interval } from "@nestjs/schedule";
import { FlowGatewayService } from "./flow-gateway.service";
import { BlocksService } from "../../blocks/blocks.service";
import { TransactionsService } from "../../transactions/transactions.service";
import { AccountsService } from "../../accounts/services/accounts.service";
import { ContractsService } from "../../accounts/services/contracts.service";
import { EventsService } from "../../events/events.service";
import { Account } from "../../accounts/entities/account.entity";
import { Event } from "../../events/entities/event.entity";
import { Transaction } from "../../transactions/entities/transaction.entity";
import { Block } from "../../blocks/entities/block.entity";
import { Project } from "../../projects/entities/project.entity";
import { FlowEmulatorService } from "./flow-emulator.service";
import { LogsService } from "../../logs/logs.service";
import { Log } from "../../logs/entities/log.entity";

@Injectable()
export class FlowAggregatorService {

  private project: Project;

  constructor (
    private blockService: BlocksService,
    private transactionService: TransactionsService,
    private accountService: AccountsService,
    private contractService: ContractsService,
    private eventService: EventsService,
    private flowGatewayService: FlowGatewayService,
    private flowEmulatorService: FlowEmulatorService,
    private logsService: LogsService
  ) {}

  configureProjectContext(project: Project) {
    this.project = project;
  }

  async startEmulator() {
    await this.flowEmulatorService.init();
    if (this.flowEmulatorService.isRunning()) {
      this.flowEmulatorService.stop();
    }
    await this.flowEmulatorService.start(((error, data) => {
      if (error) {
        console.error(`[Flowser] received emulator error: `, error)
      } else {
        console.log(`[Flowser] received emulator logs: `, data)
        Promise.all(data.map(line => {
          const log = new Log();
          log.data = line;
          this.logsService.create(log);
        }))
      }
    }))
  }

  @Interval(config.dataFetchInterval)
  async fetchDataFromDataSource(): Promise<void> {
    try {
      const lastStoredBlock = await this.blockService.findLastBlock();
      const latestBlock = await this.flowGatewayService.getLatestBlock();
      // user can specify (on a project level) what is the starting block height
      // if user provides no specification, the latest block height is used
      const initialStartBlockHeight = this.project.startBlockHeight === undefined
        ? latestBlock.height :
        this.project.startBlockHeight;
      // fetch from last stored block (if there are already blocks in the database)
      const startBlockHeight = lastStoredBlock ?
        lastStoredBlock.height :
        initialStartBlockHeight;
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
      await Promise.all(blocks.map(e =>
        this.blockService.create(Block.init(e))
          .catch(e => console.error(`[Flowser] block save error: `, e))
      ))
      await Promise.all(transactions.map(e =>
        this.transactionService.create(Transaction.init(e))
          .catch(e => console.error(`[Flowser] transaction save error: `, e))
      ))
      await Promise.all(events.map(e =>
        this.eventService.create(Event.init(e))
          .catch(e => console.error(`[Flowser] event save error: `, e))
      ))
      await Promise.all(events.map(e => this.handleEvent(Event.init(e))))
    } catch (e) {
      console.error(`[Flowser] data fetch error: ${e}`, e.message)
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
    return this.accountService.update(
      address,
      Account.init(account, {updatedAt: new Date().getTime()})
    )
  }
}
