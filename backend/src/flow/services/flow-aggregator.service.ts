import config from "../../config";
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
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
import { StorageDataService } from "./storage-data.service";
import { defaultEmulatorFlags } from "../../projects/data/default-emulator-flags";
import { FlowAccount } from "../types";
import { AccountContract } from "../../accounts/entities/contract.entity";
import { plainToClass } from "class-transformer";

@Injectable()
export class FlowAggregatorService {
  private project: Project;
  private readonly logger = new Logger(FlowAggregatorService.name);
  private serviceAccountBootstrapped = false;

  constructor(
    private blockService: BlocksService,
    private transactionService: TransactionsService,
    private accountService: AccountsService,
    private contractService: ContractsService,
    private eventService: EventsService,
    private flowGatewayService: FlowGatewayService,
    private flowEmulatorService: FlowEmulatorService,
    private logsService: LogsService,
    private storageDataService: StorageDataService
  ) {}

  configureProjectContext(project?: Project) {
    this.project = project;
  }

  async startEmulator() {
    await this.flowEmulatorService.init();
    await this.stopEmulator();
    return this.flowEmulatorService.start((data) => {
      this.handleEmulatorLogs(data);
    });
  }

  stopEmulator() {
    return this.flowEmulatorService.stop();
  }

  handleEmulatorLogs(data: string[]) {
    return Promise.all(
      data.map((line) => {
        return this.logsService.create(new Log(line));
      })
    );
  }

  @Interval(config.dataFetchInterval)
  async fetchDataFromDataSource(): Promise<void> {
    if (!this.project) {
      return;
    }

    // service account exist only on emulator chains
    if (this.project.isEmulator() && !this.serviceAccountBootstrapped) {
      // TODO: storage server hangs up when using flow-cli@v0.31
      this.logger.debug("Bootstrapping service account");
      try {
        await this.bootstrapServiceAccount();
      } catch (e) {
        this.logger.error("Service account bootstrap error: ", e.message);
        return; // retry in the next iteration
      }
      this.serviceAccountBootstrapped = true;
    }

    const lastStoredBlock = await this.blockService.findLastBlock();
    let latestBlock;
    try {
      latestBlock = await this.flowGatewayService.getLatestBlock();
    } catch (e) {
      return this.logger.debug(`failed to fetch latest block: ${e}`);
    }

    // user can specify (on a project level) what is the starting block height
    // if user provides no specification, the latest block height is used
    const initialStartBlockHeight = !this.project.isStartBlockHeightDefined()
      ? latestBlock.height
      : this.project.startBlockHeight;
    // fetch from last stored block (if there are already blocks in the database)
    const startBlockHeight = lastStoredBlock
      ? lastStoredBlock.height + 1
      : initialStartBlockHeight;
    const endBlockHeight = latestBlock.height;

    if (startBlockHeight > endBlockHeight) {
      // no new blocks will be fetched
      return;
    }

    this.logger.debug(
      `fetching block range (${startBlockHeight} - ${endBlockHeight})`
    );

    let data;
    try {
      data = await this.flowGatewayService.getBlockDataWithinHeightRange(
        startBlockHeight,
        endBlockHeight
      );
    } catch (e) {
      return this.logger.debug(`failed to fetch block data: ${e.message}`);
    }

    const events = data.map(({ events }) => events).flat();
    const transactions = data.map(({ transactions }) => transactions).flat();
    const blocks = data.map(({ block }) => block);

    const blockPromises = Promise.all(
      blocks.map((e) =>
        this.blockService
          .create(Block.init(e))
          .catch((e) =>
            this.logger.error(`block save error: ${e.message}`, e.stack)
          )
      )
    );
    const transactionPromises = Promise.all(
      transactions.map((e) =>
        this.handleTransactionCreated(Transaction.init(e)).catch((e) =>
          this.logger.error(`transaction save error: ${e.message}`, e.stack)
        )
      )
    );
    const eventPromises = Promise.all(
      events.map((e) =>
        this.eventService
          .create(Event.init(e))
          .catch((e) =>
            this.logger.error(`event save error: ${e.message}`, e.stack)
          )
      )
    );
    const eventHandlingPromises = Promise.all(
      events.map((e) => this.handleEvent(Event.init(e)))
    );

    try {
      await Promise.all([
        blockPromises,
        transactionPromises,
        eventPromises,
        eventHandlingPromises,
      ]);
    } catch (e) {
      // TODO: revert writes (wrap in db transaction)
      // check https://github.com/onflowser/flowser/issues/6
      this.logger.error(`data store error: ${e.message}`, e.stack);
    }
  }

  // https://github.com/onflow/cadence/blob/master/docs/language/core-events.md
  async handleEvent(event: Event) {
    this.logger.debug(`handling event: ${event.type}`);
    const { data, type } = event;
    const { address, contract } = data as any;
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

  async handleTransactionCreated(tx: Transaction) {
    return Promise.all([
      this.transactionService.create(tx),
      this.updateAccount(`0x${tx.payer}`),
    ]);
  }

  async handleAccountCreated(address: string) {
    return this.updateAccount(address);
  }

  async handleAccountKeyAdded(address: string) {
    return this.updateAccount(address);
  }

  async handleAccountKeyRemoved(address: string) {
    return this.handleAccountKeyAdded(address);
  }

  async handleAccountContractAdded(address: string, contractName: string) {
    return this.updateAccount(address);
  }

  async handleAccountContractUpdated(address: string, contractName: string) {
    return this.updateAccount(address);
  }

  async handleAccountContractRemoved(address: string, contractName: string) {
    return this.updateAccount(address);
  }

  async updateAccount(address: string, props: Partial<Account> = {}) {
    const flowAccount = await this.flowGatewayService.getAccount(address);
    // storage data API works only for local emulator for now
    if (this.project.isEmulator()) {
      // FIXME: temporary disabled storage functionality due to bellow pending task
      // https://www.notion.so/flowser/Migrate-to-up-to-date-flow-cli-version-a2a3837d11b9451bb0df1751620bbe1d
      // account.storage = await this.storageDataService.getStorageData(address);
    }
    const account = Account.init(flowAccount, props);
    account.markUpdated();
    await this.accountService.replace(address, account);
    await this.updateAccountContracts(flowAccount);
  }

  async updateAccountContracts(flowAccount: FlowAccount) {
    const accountAddress = flowAccount.address;
    const storedAccountContracts =
      await this.contractService.getContractsByAccountAddress(accountAddress);
    const providedAccountContractsLookup = new Map(
      Object.entries(flowAccount.contracts)
    );
    const storedAccountContractsLookup = new Map(
      storedAccountContracts.map((contract) => [contract.name, contract])
    );

    const promises = [];
    for (const [contractName, contractCode] of providedAccountContractsLookup) {
      const contract = plainToClass(AccountContract, {
        accountAddress,
        name: contractName,
        code: contractCode,
      });
      const storedContract = storedAccountContractsLookup.get(contractName);
      if (storedContract) {
        promises.push(this.contractService.replace(contract));
      } else {
        promises.push(this.contractService.create(contract));
      }
    }
    for (const contract of storedAccountContracts) {
      if (!providedAccountContractsLookup.has(contract.name)) {
        promises.push(
          this.contractService.delete(accountAddress, contract.name)
        );
      }
    }
    return Promise.all(promises);
  }

  async bootstrapServiceAccount() {
    const { serviceAddress } = defaultEmulatorFlags;
    try {
      await this.handleAccountCreated(serviceAddress);
    } catch (error) {
      // ignore duplicate key error (with code 11000)
      if (error.code !== 11000) {
        throw new InternalServerErrorException(error.message);
      }
    }
  }
}
