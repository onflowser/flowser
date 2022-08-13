import config, { env } from "../../config";
import { Injectable, Logger } from "@nestjs/common";
import { Interval } from "@nestjs/schedule";
import {
  FlowBlock,
  FlowCollection,
  FlowEvent,
  FlowGatewayService,
  FlowTransaction,
  FlowTransactionStatus,
} from "./flow-gateway.service";
import { BlocksService } from "../../blocks/blocks.service";
import { TransactionsService } from "../../transactions/transactions.service";
import { AccountsService } from "../../accounts/services/accounts.service";
import { ContractsService } from "../../accounts/services/contracts.service";
import { EventsService } from "../../events/events.service";
import { AccountEntity } from "../../accounts/entities/account.entity";
import { EventEntity } from "../../events/entities/event.entity";
import { TransactionEntity } from "../../transactions/entities/transaction.entity";
import { BlockEntity } from "../../blocks/entities/block.entity";
import { ProjectEntity } from "../../projects/entities/project.entity";
import { FlowEmulatorService } from "./flow-emulator.service";
import { LogsService } from "../../logs/logs.service";
import { LogEntity } from "../../logs/entities/log.entity";
import { StorageDataService } from "./storage-data.service";
import { AccountContractEntity } from "../../accounts/entities/contract.entity";
import { KeysService } from "../../accounts/services/keys.service";
import { AccountKeyEntity } from "../../accounts/entities/key.entity";
import { ensurePrefixedAddress } from "../../utils";
import { getDataSourceInstance } from "../../database";
import { FlowSubscriptionService } from "./flow-subscription.service";

type BlockData = {
  block: FlowBlock;
  transactions: FlowTransactionWithStatus[];
  collections: FlowCollection[];
  events: ExtendedFlowEvent[];
};

export type FlowTransactionWithStatus = FlowTransaction & {
  status: FlowTransactionStatus;
};

export type ExtendedFlowEvent = FlowEvent & {
  blockId: string;
  transactionId: string;
};

@Injectable()
export class FlowAggregatorService {
  private project: ProjectEntity;
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
    private flowSubscriptionService: FlowSubscriptionService,
    private logsService: LogsService,
    private storageDataService: StorageDataService
  ) {}

  configureProjectContext(project?: ProjectEntity) {
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
        return this.logsService.create(LogEntity.create(line));
      })
    );
  }

  @Interval(config.dataFetchInterval)
  async fetchDataFromDataSource(): Promise<void> {
    if (!this.project) {
      return;
    }

    // service account exist only on emulator chains
    if (this.project.hasEmulatorGateway() && !this.serviceAccountBootstrapped) {
      await this.bootstrapServiceAccount();
    }

    const { startBlockHeight, endBlockHeight } = await this.getBlockRange();
    const hasBlocksToProcess = startBlockHeight <= endBlockHeight;
    if (!hasBlocksToProcess) {
      return;
    }

    try {
      await this.processBlocksWithinHeightRange(
        startBlockHeight,
        endBlockHeight
      );
    } catch (e) {
      return this.logger.debug(`failed to fetch block data: ${e}`);
    }
  }

  async getBlockRange() {
    const [lastStoredBlock, latestBlock] = await Promise.all([
      this.blockService.findLastBlock(),
      this.flowGatewayService.getLatestBlock(),
    ]);

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

    return { startBlockHeight, endBlockHeight };
  }

  public async processBlocksWithinHeightRange(
    fromHeight: number,
    toHeight: number
  ) {
    for (let height = fromHeight; height <= toHeight; height++) {
      this.logger.debug(`fetching block: ${height}`);
      await this.processBlockWithHeight(height);
    }
  }

  async processBlockWithHeight(height: number) {
    const dataSource = await getDataSourceInstance();
    const queryRunner = dataSource.createQueryRunner();

    const blockData = await this.getBlockData(height);

    // Process events first, so that transactions can reference created users.
    await this.processEvents(blockData.events);

    this.subscribeTxStatusUpdates(blockData.transactions);

    try {
      await queryRunner.startTransaction();

      await this.storeBlockData(blockData);

      await queryRunner.commitTransaction();
    } catch (e) {
      await queryRunner.rollbackTransaction();

      await this.logger.error(`Failed to store latest data`, e);
    } finally {
      await queryRunner.release();
    }
  }

  subscribeTxStatusUpdates(transactions: FlowTransactionWithStatus[]) {
    transactions.forEach((transaction) => {
      this.flowSubscriptionService.addTransactionSubscription(transaction.id);
    });
  }

  async storeBlockData(data: BlockData) {
    const blockPromises = this.blockService
      .create(BlockEntity.create(data.block))
      .catch((e) =>
        this.logger.error(`block save error: ${e.message}`, e.stack)
      );
    const transactionPromises = Promise.all(
      data.transactions.map((transaction) =>
        this.handleTransactionCreated(transaction, transaction.status).catch(
          (e) =>
            this.logger.error(`transaction save error: ${e.message}`, e.stack)
        )
      )
    );
    const eventPromises = Promise.all(
      data.events.map((event) =>
        this.eventService
          .create(EventEntity.create(event))
          .catch((e) =>
            this.logger.error(`event save error: ${e.message}`, e.stack)
          )
      )
    );

    return Promise.all([blockPromises, transactionPromises, eventPromises]);
  }

  public async getBlockData(height: number): Promise<BlockData> {
    const block = await this.flowGatewayService.getBlockByHeight(height);
    const collections = await Promise.all(
      block.collectionGuarantees.map(async (guarantee) =>
        this.flowGatewayService.getCollectionById(guarantee.collectionId)
      )
    );
    const transactionIds = collections
      .map((collection) => collection.transactionIds)
      .flat();

    const transactionFutures = Promise.all(
      transactionIds.map((txId) =>
        this.flowGatewayService.getTransactionById(txId)
      )
    );
    const transactionStatusesFutures = Promise.all(
      transactionIds.map((txId) =>
        this.flowGatewayService.getTransactionStatusById(txId)
      )
    );

    const [transactions, statuses] = await Promise.all([
      transactionFutures,
      transactionStatusesFutures,
    ]);

    const transactionsWithStatuses = transactions.map((transaction, index) => ({
      ...transaction,
      status: statuses[index],
    }));

    const events = transactionsWithStatuses
      .map((tx) =>
        tx.status.events.map((event) => ({
          ...event,
          transactionId: tx.id,
          blockId: tx.referenceBlockId,
        }))
      )
      .flat();

    return {
      block,
      collections,
      transactions: transactionsWithStatuses,
      events,
    };
  }

  async processEvents(events: FlowEvent[]) {
    // Process new accounts first, so other events can reference them.
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
  async handleEvent(event: FlowEvent) {
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

  async handleTransactionCreated(
    transaction: FlowTransaction,
    status: FlowTransactionStatus
  ) {
    // TODO: Should we also mark all tx.authorizers as updated?
    const payerAddress = ensurePrefixedAddress(transaction.payer);
    return Promise.all([
      this.transactionService.create(
        TransactionEntity.create(transaction, status)
      ),
      this.accountService.markUpdated(payerAddress),
    ]);
  }

  async storeNewAccountWithContractsAndKeys(address: string) {
    const flowAccount = await this.flowGatewayService.getAccount(address);
    const unSerializedAccount = AccountEntity.create(flowAccount);
    const newContracts = Object.keys(flowAccount.contracts).map((name) =>
      AccountContractEntity.create(
        flowAccount,
        name,
        flowAccount.contracts[name]
      )
    );
    const newKeys = flowAccount.keys.map((flowKey) =>
      AccountKeyEntity.create(flowAccount, flowKey)
    );
    await this.accountService.create(unSerializedAccount);
    console.log(`Account ${address} created`);
    await Promise.all([
      this.accountKeysService.updateAccountKeys(address, newKeys),
      this.contractService.updateAccountContracts(
        unSerializedAccount.address,
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
        flowAccount.keys.map((flowKey) =>
          AccountKeyEntity.create(flowAccount, flowKey)
        )
      ),
    ]);
  }

  async updateStoredAccountContracts(address: string) {
    const flowAccount = await this.flowGatewayService.getAccount(address);
    const account = AccountEntity.create(flowAccount);
    const newContracts = Object.keys(flowAccount.contracts).map((name) =>
      AccountContractEntity.create(
        flowAccount,
        name,
        flowAccount.contracts[name]
      )
    );

    await Promise.all([
      this.accountService.markUpdated(address),
      this.contractService.updateAccountContracts(
        account.address,
        newContracts
      ),
    ]);
  }

  // TODO(milestone-3): when do we need to update the account storage?
  async setUpdatedAccountStorage(account: AccountEntity) {
    // storage data API works only for local emulator for now
    if (this.project.hasEmulatorGateway()) {
      // TODO(milestone-3): enable this when we integrate the storage data API
      // FIXME(milestone-3): storage server hangs up when using flow-cli@v0.31
      // account.storage = await this.storageDataService.getStorageData(address);
    }
  }

  async bootstrapServiceAccount() {
    // TODO(milestone-3): read this from flow.json
    const serviceAddress = "f8d6e0586b0a20c7";

    const dataSource = await getDataSourceInstance();
    const queryRunner = dataSource.createQueryRunner();

    await queryRunner.startTransaction();
    try {
      await this.storeNewAccountWithContractsAndKeys(serviceAddress);
      await queryRunner.commitTransaction();
      this.serviceAccountBootstrapped = true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
}
