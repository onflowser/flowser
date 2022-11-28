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
import {
  FlowCoreEventType,
  ServiceStatus,
  ManagedProcessState,
} from "@flowser/shared";
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

type UnprocessedBlockInfo = {
  nextBlockHeightToProcess: number;
  latestUnprocessedBlockHeight: number;
};

type FlowTransactionWithStatus = FlowTransaction & {
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
    this.emulatorProcess = this.processManagerService.getByIdOrFail(
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
    const { nextBlockHeightToProcess, latestUnprocessedBlockHeight } =
      await this.getUnprocessedBlocksInfo();

    return latestUnprocessedBlockHeight - (nextBlockHeightToProcess - 1);
  }

  // TODO(milestone-x): Next interval shouldn't start before this function resolves
  @Interval(1000)
  async fetchDataFromDataSource(): Promise<void> {
    if (!this.projectContext) {
      return;
    }
    const gatewayStatus = await FlowGatewayService.getApiStatus(
      this.projectContext.gateway
    );
    if (gatewayStatus !== ServiceStatus.SERVICE_STATUS_ONLINE) {
      return;
    }

    // Service account is present only on emulator chain
    if (!(await this.isServiceAccountProcessed())) {
      await this.processDefaultAccounts();
    }

    const { nextBlockHeightToProcess, latestUnprocessedBlockHeight } =
      await this.getUnprocessedBlocksInfo();
    const hasBlocksToProcess =
      nextBlockHeightToProcess <= latestUnprocessedBlockHeight;

    if (!hasBlocksToProcess) {
      return;
    }

    try {
      for (
        let height = nextBlockHeightToProcess;
        height <= latestUnprocessedBlockHeight;
        height++
      ) {
        this.logger.debug(`Processing block: ${height}`);
        // Blocks must be processed in sequential order (not in parallel)
        // because objects on subsequent blocks can reference objects from previous blocks
        // (e.g. a transaction may reference an account from previous block)
        await this.processBlockWithHeight(height);
      }
    } catch (e) {
      return this.logger.debug(`failed to fetch block data: ${e}`);
    }
  }

  private async getUnprocessedBlocksInfo(): Promise<UnprocessedBlockInfo> {
    const [lastStoredBlock, latestBlock] = await Promise.all([
      this.blockService.findLastBlock(),
      this.flowGatewayService.getLatestBlock(),
    ]);
    const nextBlockHeightToProcess = lastStoredBlock
      ? lastStoredBlock.height + 1
      : this.projectContext?.startBlockHeight ?? 0;
    const latestUnprocessedBlockHeight = latestBlock.height;

    return {
      nextBlockHeightToProcess,
      latestUnprocessedBlockHeight,
    };
  }

  private async processBlockWithHeight(height: number) {
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

  private subscribeTxStatusUpdates(transactions: FlowTransactionWithStatus[]) {
    transactions.forEach((transaction) => {
      this.flowSubscriptionService.addTransactionSubscription(transaction.id);
    });
  }

  private async storeBlockData(data: BlockData) {
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

  private async getBlockData(height: number): Promise<BlockData> {
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

  private async processEvents(events: FlowEvent[]) {
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
          this.logger.error(
            `${event.type} event handling error: ${e.message}`,
            e.stack
          );
        })
      )
    );
  }

  private async handleEvent(event: FlowEvent) {
    const { data, type } = event;
    this.logger.debug(`handling event: ${type} ${JSON.stringify(data)}`);
    const address = ensurePrefixedAddress(data.address);
    switch (type) {
      case FlowCoreEventType.ACCOUNT_CREATED:
        return this.storeNewAccountWithContractsAndKeys(address);
      case FlowCoreEventType.ACCOUNT_KEY_ADDED:
      case FlowCoreEventType.ACCOUNT_KEY_REMOVED:
        return this.updateStoredAccountKeys(address);
      case FlowCoreEventType.ACCOUNT_CONTRACT_ADDED:
      case FlowCoreEventType.ACCOUNT_CONTRACT_UPDATED:
      case FlowCoreEventType.ACCOUNT_CONTRACT_REMOVED:
        // TODO: Use event.data.address & event.data.contract to determine updated/created/removed contract
        return this.updateStoredAccountContracts(address);
      default:
        return null; // not a core event, ignore it
    }
  }

  private async handleTransactionCreated(
    block: FlowBlock,
    transaction: FlowTransaction,
    status: FlowTransactionStatus
  ) {
    // TODO: Should we also mark all tx.authorizers as updated?
    const payerAddress = ensurePrefixedAddress(transaction.payer);
    return Promise.all([
      this.transactionService.createOrUpdate(
        TransactionEntity.create(block, transaction, status)
      ),
      this.accountService.markUpdated(payerAddress),
    ]);
  }

  private async storeNewAccountWithContractsAndKeys(address: string) {
    const flowAccount = await this.flowGatewayService.getAccount(address);
    const unSerializedAccount = AccountEntity.create(flowAccount);
    if (
      this.getDefaultAccountsAddresses().includes(unSerializedAccount.address)
    ) {
      unSerializedAccount.isDefaultAccount = true;
    }
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

  private async updateStoredAccountKeys(address: string) {
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

  private async updateStoredAccountContracts(address: string) {
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

  private async updateAccountsStorage() {
    const allAddresses = await this.accountService.findAllAddresses();
    this.logger.debug(
      `Processing storages for accounts: ${allAddresses.join(", ")}`
    );
    await Promise.all(
      allAddresses.map((address) => this.processAccountStorage(address))
    );
  }

  private async processAccountStorage(address: string) {
    const { privateItems, publicItems, storageItems } =
      await this.flowStorageService.getAccountStorage(address);
    return this.accountStorageService.updateAccountStorage(address, [
      ...privateItems,
      ...publicItems,
      ...storageItems,
    ]);
  }

  private async isServiceAccountProcessed() {
    const serviceAccountAddress = ensurePrefixedAddress(
      this.configService.getServiceAccountAddress()
    );
    return this.accountService.accountExists(serviceAccountAddress);
  }

  private async processDefaultAccounts() {
    const dataSource = await getDataSourceInstance();
    const queryRunner = dataSource.createQueryRunner();

    await queryRunner.startTransaction();
    try {
      await Promise.all(
        this.getDefaultAccountsAddresses().map((address) =>
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

  private getDefaultAccountsAddresses() {
    const serviceAccountAddress = ensurePrefixedAddress(
      this.configService.getServiceAccountAddress()
    );
    return [
      serviceAccountAddress,
      // See: https://github.com/onflow/flow-emulator/blob/cdd177ea264f67b0e79d63f681888fd47bba90fa/server/server.go#L137-L143
      "0xee82856bf20e2aa6",
      "0xe5a8b7f23e8b548f",
      "0x0ae53cb6e3f42a79",
    ];
  }
}
