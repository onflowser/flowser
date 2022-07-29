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
import { AccountContract } from "../../accounts/entities/contract.entity";
import { KeysService } from "../../accounts/services/keys.service";
import { AccountKey } from "../../accounts/entities/key.entity";
import { ensurePrefixedAddress } from "../../utils";
import { DataSource } from "typeorm";

@Injectable()
export class FlowAggregatorService {
  private project: Project;
  private readonly logger = new Logger(FlowAggregatorService.name);
  private serviceAccountBootstrapped = false;

  constructor(
    private blockService: BlocksService,
    private transactionService: TransactionsService,
    private accountService: AccountsService,
    private accountKeysService: KeysService,
    private contractService: ContractsService,
    private eventService: EventsService,
    private flowGatewayService: FlowGatewayService,
    private flowEmulatorService: FlowEmulatorService,
    private logsService: LogsService,
    private storageDataService: StorageDataService,
    private dataSource: DataSource
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

    const queryRunner = this.dataSource.createQueryRunner();

    // service account exist only on emulator chains
    if (this.project.hasEmulatorGateway() && !this.serviceAccountBootstrapped) {
      // FIXME(milestone-2): storage server hangs up when using flow-cli@v0.31
      this.logger.debug("Bootstrapping service account");

      await queryRunner.startTransaction();
      try {
        await this.bootstrapServiceAccount();

        await queryRunner.commitTransaction();
      } catch (e) {
        await queryRunner.rollbackTransaction();

        this.logger.error("Service account bootstrap error", e);
        return; // retry in the next iteration
      } finally {
        await queryRunner.release();
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

    const events = data
      .map(({ events }) => events)
      .flat()
      .map((event) => Event.init(event));
    const transactions = data
      .map(({ transactions }) => transactions)
      .flat()
      .map((transaction) => Transaction.init(transaction));
    const blocks = data.map(({ block }) => Block.init(block));

    // Process events first, so that transactions & events can reference created users.
    await this.processEvents(events);

    const blockPromises = Promise.all(
      blocks.map((block) =>
        this.blockService
          .create(block)
          .catch((e) =>
            this.logger.error(`block save error: ${e.message}`, e.stack)
          )
      )
    );
    const transactionPromises = Promise.all(
      transactions.map((transaction) =>
        this.handleTransactionCreated(transaction).catch((e) =>
          this.logger.error(`transaction save error: ${e.message}`, e.stack)
        )
      )
    );
    const eventPromises = Promise.all(
      events.map((event) =>
        this.eventService
          .create(event)
          .catch((e) =>
            this.logger.error(`event save error: ${e.message}`, e.stack)
          )
      )
    );

    try {
      await queryRunner.startTransaction();

      await Promise.all([blockPromises, transactionPromises, eventPromises]);

      await queryRunner.commitTransaction();
    } catch (e) {
      await queryRunner.rollbackTransaction();

      await this.logger.error(`Failed to store latest data`, e, e.stack);
    } finally {
      await queryRunner.release();
    }
  }

  async processEvents(events: Event[]) {
    const accountCreatedEvents = events.filter(
      (event) => event.type === "flow.AccountCreated"
    );
    const restEvents = events.filter(
      (event) => event.type !== "flow.AccountCreated"
    );
    await Promise.all(
      accountCreatedEvents.map((event) =>
        this.handleEvent(event).catch((e) => {
          this.logger.error(
            `flow.AccountCreated event handling error: ${e.message}`,
            e.stack
          );
        })
      )
    );
    await Promise.all(
      restEvents.map((event) =>
        this.handleEvent(event).catch((e) => {
          this.logger.error(`event handling error: ${e.message}`, e.stack);
        })
      )
    );
  }

  // https://github.com/onflow/cadence/blob/master/docs/language/core-events.md
  async handleEvent(event: Event) {
    const { data, type } = event;
    this.logger.debug(`handling event: ${type} ${JSON.stringify(data)}`);
    const { address, contract } = data as any;
    // TODO: should we use data.contract info to find the updated/created/deleted contract?
    switch (type) {
      case "flow.AccountCreated":
        return this.storeNewAccountWithContractsAndKeys(address);
      case "flow.AccountKeyAdded":
        return this.updateStoredAccountKeys(address);
      case "flow.AccountKeyRemoved":
        return this.updateStoredAccountKeys(address);
      case "flow.AccountContractAdded":
        return this.updateStoredAccountContracts(address);
      case "flow.AccountContractUpdated":
        return this.updateStoredAccountContracts(address);
      case "flow.AccountContractRemoved":
        return this.updateStoredAccountContracts(address);
      default:
        return null; // not a core event, ignore it
    }
  }

  async handleTransactionCreated(tx: Transaction) {
    // TODO: Should we also mark all tx.authorizers as updated?
    const payerAddress = ensurePrefixedAddress(tx.payer);
    return Promise.all([
      this.transactionService.create(tx),
      this.accountService.markUpdated(payerAddress),
    ]);
  }

  async storeNewAccountWithContractsAndKeys(address) {
    const flowAccount = await this.flowGatewayService.getAccount(address);
    const account = Account.init(flowAccount);
    const newContracts = Object.keys(flowAccount.contracts).map((name) =>
      AccountContract.init(
        flowAccount.address,
        name,
        flowAccount.contracts[name]
      )
    );
    const newKeys = flowAccount.keys.map((key) =>
      AccountKey.init(address, key)
    );
    await this.accountService.create(account);
    console.log(`Account ${address} created`);
    await Promise.all([
      this.accountKeysService.updateAccountKeys(address, newKeys),
      this.contractService.updateAccountContracts(
        account.address,
        newContracts
      ),
    ]);
  }

  async updateStoredAccountKeys(address: string) {
    const flowAccount = await this.flowGatewayService.getAccount(address);
    await Promise.all([
      this.accountService.markUpdated(address),
      this.accountKeysService.updateAccountKeys(
        address,
        flowAccount.keys.map((key) => AccountKey.init(address, key))
      ),
    ]);
  }

  async updateStoredAccountContracts(address: string) {
    const flowAccount = await this.flowGatewayService.getAccount(address);
    const account = Account.init(flowAccount);
    const newContracts = Object.keys(flowAccount.contracts).map((name) =>
      AccountContract.init(flowAccount.address, name, flowAccount[name])
    );
    await Promise.all([
      this.accountService.markUpdated(address),
      this.contractService.updateAccountContracts(
        account.address,
        newContracts
      ),
    ]);
  }

  // TODO(milestone-2): when do we need to update the account storage?
  async setUpdatedAccountStorage(account: Account) {
    // storage data API works only for local emulator for now
    if (this.project.hasEmulatorGateway()) {
      // TODO(milestone-2): enable this when we integrate the storage data API
      // account.storage = await this.storageDataService.getStorageData(address);
    }
  }

  async bootstrapServiceAccount() {
    const { serviceAddress } = defaultEmulatorFlags;
    try {
      await this.storeNewAccountWithContractsAndKeys(serviceAddress);
    } catch (error) {
      // ignore duplicate key error (with code 11000)
      if (error.code !== 11000) {
        throw new InternalServerErrorException(error.message);
      }
    }
  }
}
