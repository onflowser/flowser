import { Injectable, Logger } from "@nestjs/common";
import { Interval } from "@nestjs/schedule";
import {
  FlowBlock,
  FlowCollection,
  FlowEvent,
  FlowGatewayService,
  FlowTransaction,
  FlowTransactionStatus,
} from "./gateway.service";
import { BlocksService } from "../../blocks/blocks.service";
import { TransactionsService } from "../../transactions/transactions.service";
import { AccountsService } from "../../accounts/services/accounts.service";
import { ContractsService } from "../../accounts/services/contracts.service";
import { EventsService } from "../../events/events.service";
import { AccountEntity } from "../../accounts/entities/account.entity";
import { EventEntity } from "../../events/entities/event.entity";
import { TransactionEntity } from "../../transactions/entities/transaction.entity";
import { BlockEntity } from "../../blocks/entities/block.entity";
import { AccountContractEntity } from "../../accounts/entities/contract.entity";
import { KeysService } from "../../accounts/services/keys.service";
import { AccountKeyEntity } from "../../accounts/entities/key.entity";
import { ensurePrefixedAddress } from "../../utils";
import { getDataSourceInstance } from "../../database";
import { FlowSubscriptionService } from "./subscription.service";
import { FlowConfigService } from "./config.service";
import { ProjectContextLifecycle } from "../utils/project-context";
import { ProjectEntity } from "../../projects/entities/project.entity";
import { FlowAccountStorageService } from "./storage.service";
import { AccountStorageService } from "../../accounts/services/storage.service";
import { FlowCoreEventType, ManagedProcessState } from "@flowser/shared";
import {
  ProcessManagerEvent,
  ProcessManagerService,
} from "../../processes/process-manager.service";
import {
  ManagedProcessEntity,
  ManagedProcessEvent,
} from "../../processes/managed-process.entity";
import { CommonService } from "../../core/services/common.service";
import { FlowEmulatorService } from "./emulator.service";

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
export class FlowAggregatorService implements ProjectContextLifecycle {
  private projectContext: ProjectEntity | undefined;
  private emulatorProcess: ManagedProcessEntity | undefined;
  private readonly logger = new Logger(FlowAggregatorService.name);

  constructor(
    private blockService: BlocksService,
    private transactionService: TransactionsService,
    private accountService: AccountsService,
    private accountStorageService: AccountStorageService,
    private accountKeysService: KeysService,
    private contractService: ContractsService,
    private eventService: EventsService,
    private flowStorageService: FlowAccountStorageService,
    private flowGatewayService: FlowGatewayService,
    private flowSubscriptionService: FlowSubscriptionService,
    private configService: FlowConfigService,
    private processManagerService: ProcessManagerService,
    private commonService: CommonService
  ) {}

  onEnterProjectContext(project: ProjectEntity): void {
    this.projectContext = project;
    this.emulatorProcess = this.processManagerService.get(
      FlowEmulatorService.processId
    );
    this.processManagerService.on(
      ProcessManagerEvent.PROCESS_ADDED,
      this.onProcessAddedOrUpdated.bind(this)
    );
    this.processManagerService.on(
      ProcessManagerEvent.PROCESS_UPDATED,
      this.onProcessAddedOrUpdated.bind(this)
    );
  }

  onExitProjectContext(): void {
    this.projectContext = undefined;
    this.processManagerService.removeListener(
      ProcessManagerEvent.PROCESS_ADDED,
      this.onProcessAddedOrUpdated.bind(this)
    );
    this.processManagerService.removeListener(
      ProcessManagerEvent.PROCESS_UPDATED,
      this.onProcessAddedOrUpdated.bind(this)
    );
    this.emulatorProcess?.removeListener(
      ManagedProcessEvent.STATE_CHANGE,
      this.onProcessStateChange.bind(this)
    );
  }

  private onProcessAddedOrUpdated(process: ManagedProcessEntity) {
    const isEmulatorProcess = process.id === FlowEmulatorService.processId;
    if (isEmulatorProcess) {
      this.logger.debug(`Emulator was started or updated`);
      // Remove any previous listeners
      this.emulatorProcess?.removeListener(
        ManagedProcessEvent.STATE_CHANGE,
        this.onProcessStateChange.bind(this)
      );
      // Update internal process instance & reattach listener
      this.emulatorProcess = process;
      this.emulatorProcess.on(
        ManagedProcessEvent.STATE_CHANGE,
        this.onProcessStateChange.bind(this)
      );
    }
  }

  private async onProcessStateChange(state: ManagedProcessState) {
    if (state === ManagedProcessState.MANAGED_PROCESS_STATE_RUNNING) {
      this.logger.debug("Emulator process was started, reindexing");
      // Reindex all blockchain data when the emulator is started (restarted)
      await this.commonService.removeBlockchainData();
    }
  }

  async getTotalBlocksToProcess() {
    const { startBlockHeight, endBlockHeight } = await this.getBlockRange();
    return endBlockHeight - startBlockHeight;
  }

  // TODO(milestone-x): Next interval shouldn't start before this function resolves
  @Interval(1000)
  async fetchDataFromDataSource(): Promise<void> {
    if (!this.projectContext) {
      return;
    }
    if (
      this.projectContext.emulator.run &&
      !this.emulatorProcess?.isRunning()
    ) {
      return;
    }

    // Service account is present only on emulator chain
    if (!(await this.isServiceAccountProcessed())) {
      await this.processStaticAccounts();
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
    const initialStartBlockHeight =
      !this.projectContext.isStartBlockHeightDefined()
        ? latestBlock.height
        : this.projectContext.startBlockHeight;

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
      await this.updateAccountsStorage();

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
    // TODO(milestone-3): Transaction references previous block in referenceBlockId field. Why? Previously we used this field to indicate which block contained some transaction.
    // Docs say: referenceBlockId = A reference to the block used to calculate the expiry of this transaction.
    // https://developers.flow.com/tools/fcl-js/reference/api#transactionobject
    const blockPromise = this.blockService
      .create(BlockEntity.create(data.block))
      .catch((e) =>
        this.logger.error(`block save error: ${e.message}`, e.stack)
      );
    const transactionPromises = Promise.all(
      data.transactions.map((transaction) =>
        this.handleTransactionCreated(
          data.block,
          transaction,
          transaction.status
        ).catch((e) =>
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

    return Promise.all([blockPromise, transactionPromises, eventPromises]);
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
      (event) => event.type === FlowCoreEventType.ACCOUNT_CREATED
    );
    const restEvents = events.filter(
      (event) => event.type !== FlowCoreEventType.ACCOUNT_CREATED
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

  async handleEvent(event: FlowEvent) {
    const { data, type } = event;
    this.logger.debug(`handling event: ${type} ${JSON.stringify(data)}`);
    const address = ensurePrefixedAddress(data.address);
    // TODO: should we use data.contract info to find the updated/created/deleted contract?
    switch (type) {
      case FlowCoreEventType.ACCOUNT_CREATED:
        return this.storeNewAccountWithContractsAndKeys(address);
      case FlowCoreEventType.ACCOUNT_KEY_ADDED:
      case FlowCoreEventType.ACCOUNT_KEY_REMOVED:
        return this.updateStoredAccountKeys(address);
      case FlowCoreEventType.ACCOUNT_CONTRACT_ADDED:
      case FlowCoreEventType.ACCOUNT_CONTRACT_UPDATED:
      case FlowCoreEventType.ACCOUNT_CONTRACT_REMOVED:
        return this.updateStoredAccountContracts(address);
      default:
        return null; // not a core event, ignore it
    }
  }

  async handleTransactionCreated(
    block: FlowBlock,
    transaction: FlowTransaction,
    status: FlowTransactionStatus
  ) {
    // TODO: Should we also mark all tx.authorizers as updated?
    const payerAddress = ensurePrefixedAddress(transaction.payer);
    return Promise.all([
      this.transactionService.create(
        TransactionEntity.create(block, transaction, status)
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

  async updateAccountsStorage() {
    const allAddresses = await this.accountService.findAllAddresses();
    this.logger.debug(
      `Processing storages for accounts: ${allAddresses.join(", ")}`
    );
    await Promise.all(
      allAddresses.map((address) => this.processAccountStorage(address))
    );
  }

  async processAccountStorage(address: string) {
    const { privateItems, publicItems, storageItems } =
      await this.flowStorageService.getAccountStorage(address);
    return this.accountStorageService.updateAccountStorage(address, [
      ...privateItems,
      ...publicItems,
      ...storageItems,
    ]);
  }

  async isServiceAccountProcessed() {
    const serviceAccountAddress = ensurePrefixedAddress(
      this.configService.getServiceAccountAddress()
    );
    return this.accountService.accountExists(serviceAccountAddress);
  }

  async processStaticAccounts() {
    const dataSource = await getDataSourceInstance();
    const queryRunner = dataSource.createQueryRunner();
    const serviceAccountAddress = ensurePrefixedAddress(
      this.configService.getServiceAccountAddress()
    );
    const staticAccountAddresses = [
      serviceAccountAddress,
      // See: https://github.com/onflow/flow-emulator/blob/cdd177ea264f67b0e79d63f681888fd47bba90fa/server/server.go#L137-L143
      "0xee82856bf20e2aa6",
      "0xe5a8b7f23e8b548f",
      "0x0ae53cb6e3f42a79",
    ];

    await queryRunner.startTransaction();
    try {
      await Promise.all(
        staticAccountAddresses.map((address) =>
          this.storeNewAccountWithContractsAndKeys(address)
        )
      );
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }
}
