import { Injectable, Logger } from "@nestjs/common";
import {
  FlowApiStatus,
  FlowGatewayService,
  GetParsedInteractionResponse,
  FlowEmulatorService,
  WellKnownAddressesOptions,
  ManagedProcess,
  ensureNonPrefixedAddress,
  ensurePrefixedAddress,
  FlowAccountStorageService,
  GoBindingsService,
} from "@onflowser/core";
import * as flowResource from "@onflowser/core";
import * as flowserResource from "@onflowser/api";
import { AsyncIntervalScheduler } from "./async-interval-scheduler";
import {
  IResourceIndex,
  HashAlgorithm,
  SignatureAlgorithm,
} from "@onflowser/api";

// See https://developers.flow.com/cadence/language/core-events
enum FlowCoreEventType {
  ACCOUNT_CREATED = "flow.AccountCreated",
  ACCOUNT_KEY_ADDED = "flow.AccountKeyAdded",
  ACCOUNT_KEY_REMOVED = "flow.AccountKeyRemoved",
  ACCOUNT_CONTRACT_ADDED = "flow.AccountContractAdded",
  ACCOUNT_CONTRACT_UPDATED = "flow.AccountContractUpdated",
  ACCOUNT_CONTRACT_REMOVED = "flow.AccountContractRemoved",
}

type BlockData = {
  block: flowResource.FlowBlock;
  transactions: FlowTransactionWithStatus[];
  collections: flowResource.FlowCollection[];
  events: ExtendedFlowEvent[];
};

type UnprocessedBlockInfo = {
  nextBlockHeightToProcess: number;
  latestUnprocessedBlockHeight: number;
};

type FlowTransactionWithStatus = flowResource.FlowTransaction & {
  status: flowResource.FlowTransactionStatus;
};

export type ExtendedFlowEvent = flowResource.FlowEvent & {
  blockId: string;
  transactionId: string;
};

@Injectable()
export class IndexerService {
  private emulatorProcess: ManagedProcess | undefined;
  private readonly logger = new Logger(IndexerService.name);
  private readonly pollingDelay = 500;
  private processingScheduler: AsyncIntervalScheduler;

  constructor(
    private transactionIndex: IResourceIndex<flowserResource.FlowTransaction>,
    private accountIndex: IResourceIndex<flowserResource.FlowAccount>,
    private blockIndex: IResourceIndex<flowserResource.FlowBlock>,
    private eventIndex: IResourceIndex<flowserResource.FlowEvent>,
    private contractIndex: IResourceIndex<flowserResource.FlowContract>,
    private accountStorageIndex: IResourceIndex<flowserResource.FlowAccountStorage>,
    private flowStorageService: FlowAccountStorageService,
    private flowGatewayService: FlowGatewayService,
    private flowEmulatorService: FlowEmulatorService,
    private goBindings: GoBindingsService
  ) {
    this.processingScheduler = new AsyncIntervalScheduler({
      name: "Blockchain processing",
      pollingIntervalInMs: this.pollingDelay,
      functionToExecute: this.processBlockchainData.bind(this),
    });
  }

  start(): void {
    this.processingScheduler.start();
  }

  stop(): void {
    this.processingScheduler.stop();
  }

  async processBlockchainData(): Promise<void> {
    const gatewayStatus = await this.flowGatewayService.getApiStatus();
    if (gatewayStatus !== FlowApiStatus.SERVICE_STATUS_ONLINE) {
      this.logger.debug("Gateway offline, pausing processing.");
      return;
    }

    const [unprocessedBlockInfo] = await Promise.all([
      this.getUnprocessedBlocksInfo(),
      this.processWellKnownAccountsForNonManagedEmulator(),
    ]);

    const { nextBlockHeightToProcess, latestUnprocessedBlockHeight } =
      unprocessedBlockInfo;
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
    const [allBlocks, latestBlock] = await Promise.all([
      this.blockIndex.findAll(),
      this.flowGatewayService.getLatestBlock(),
    ]);
    const lastIndexedBlock = this.findLatestBlock(allBlocks);
    const nextBlockHeightToProcess = lastIndexedBlock
      ? lastIndexedBlock.blockHeight + 1
      : latestBlock.height;
    const latestUnprocessedBlockHeight = latestBlock.height;

    return {
      nextBlockHeightToProcess,
      latestUnprocessedBlockHeight,
    };
  }

  private findLatestBlock(blocks: flowserResource.FlowBlock[]) {
    let latestBlock: flowserResource.FlowBlock = blocks[0];
    for (const block of blocks) {
      if (block.blockHeight > latestBlock.blockHeight) {
        latestBlock = block;
      }
    }
    return latestBlock;
  }

  private async processBlockWithHeight(height: number) {
    const blockData = await this.getBlockData(height);

    // Process events first, so that transactions can reference created users.
    await this.processNewEvents({
      events: blockData.events,
      block: blockData.block,
    });

    try {
      await this.storeBlockData(blockData);
      await this.reIndexAllAccountStorage();
    } catch (e) {
      this.logger.error(`Failed to store block (#${height}) data`, e);
    }

    try {
      blockData.transactions.map((transaction) =>
        this.subscribeToTransactionStatusUpdates(transaction.id)
      );
    } catch (e) {
      this.logger.error("Transaction status update failed", e);
    }
  }

  private async subscribeToTransactionStatusUpdates(
    transactionId: string
  ): Promise<void> {
    const unsubscribe = this.flowGatewayService
      .getTxStatusSubscription(transactionId)
      .subscribe((newStatus) =>
        this.transactionIndex.update({
          id: transactionId,
          status: {
            errorMessage: newStatus.errorMessage,
            grcpStatus: this.reMapGrcpStatus(newStatus.statusCode),
            executionStatus: newStatus.status,
          },
        })
      );
    try {
      await this.flowGatewayService
        .getTxStatusSubscription(transactionId)
        .onceSealed();
    } catch (e) {
      this.logger.debug(`Failed to wait on sealed transaction:`, e);
    } finally {
      // Once transaction is sealed, status won't change anymore.
      unsubscribe();
    }
  }

  private async storeBlockData(data: BlockData) {
    const blockPromise = this.blockIndex
      .add(this.createBlockEntity({ block: data.block }))
      .catch((e: any) =>
        this.logger.error(`block save error: ${e.message}`, e.stack)
      );
    const transactionPromises = Promise.all(
      data.transactions.map((transaction) =>
        this.processNewTransaction({
          block: data.block,
          transaction: transaction,
          transactionStatus: transaction.status,
        }).catch((e: any) =>
          this.logger.error(`transaction save error: ${e.message}`, e.stack)
        )
      )
    );
    const eventPromises = Promise.all(
      data.events.map((flowEvent) =>
        this.eventIndex
          .add(
            this.createEventEntity({
              event: flowEvent,
            })
          )
          .catch((e: any) =>
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

  private async processNewEvents(options: {
    events: flowResource.FlowEvent[];
    block: flowResource.FlowBlock;
  }) {
    const { events, block } = options;
    // Process new accounts first, so other events can reference them.
    const accountCreatedEvents = events.filter(
      (event) => event.type === FlowCoreEventType.ACCOUNT_CREATED
    );
    const restEvents = events.filter(
      (event) => event.type !== FlowCoreEventType.ACCOUNT_CREATED
    );
    await Promise.all(
      accountCreatedEvents.map((flowEvent) =>
        this.processStandardEvents({ event: flowEvent, block }).catch((e) => {
          this.logger.error(
            `flow.AccountCreated event handling error: ${
              e.message
            } (${JSON.stringify(flowEvent)})`,
            e.stack
          );
        })
      )
    );
    await Promise.all(
      restEvents.map((flowEvent) =>
        this.processStandardEvents({ event: flowEvent, block: block }).catch(
          (e) => {
            this.logger.error(
              `${flowEvent.type} event handling error: ${
                e.message
              } (${JSON.stringify(flowEvent)})`,
              e.stack
            );
          }
        )
      )
    );
  }

  private async processStandardEvents(options: {
    event: flowResource.FlowEvent;
    block: flowResource.FlowBlock;
  }) {
    const { event, block } = options;
    this.logger.debug(
      `handling event: ${event.type} ${JSON.stringify(event.data)}`
    );

    const monotonicAddresses = this.flowEmulatorService.getWellKnownAddresses({
      overrideUseMonotonicAddresses: true,
    });
    const nonMonotonicAddresses =
      this.flowEmulatorService.getWellKnownAddresses({
        overrideUseMonotonicAddresses: false,
      });

    const buildFlowTokensWithdrawnEvent = (address: string) =>
      `A.${ensureNonPrefixedAddress(address)}.FlowToken.TokensWithdrawn`;
    const buildFlowTokensDepositedEvent = (address: string) =>
      `A.${ensureNonPrefixedAddress(address)}.FlowToken.TokensDeposited`;

    const address = ensurePrefixedAddress(event.data.address);
    switch (event.type) {
      case FlowCoreEventType.ACCOUNT_CREATED:
        return this.reIndexAccount({
          address,
          block: block,
        });
      case FlowCoreEventType.ACCOUNT_KEY_ADDED:
      case FlowCoreEventType.ACCOUNT_KEY_REMOVED:
        return this.reIndexAccount({ address, block: block });
      case FlowCoreEventType.ACCOUNT_CONTRACT_ADDED:
      case FlowCoreEventType.ACCOUNT_CONTRACT_UPDATED:
      case FlowCoreEventType.ACCOUNT_CONTRACT_REMOVED:
        // TODO: Stop re-fetching all contracts and instead use event.data.contract to get the removed/updated/added contract
        return this.reIndexAccount({ address, block: block });
      // For now keep listening for monotonic and non-monotonic addresses,
      // although I think only non-monotonic ones are used for contract deployment.
      // See: https://github.com/onflow/flow-emulator/issues/421#issuecomment-1596844610
      case buildFlowTokensWithdrawnEvent(monotonicAddresses.flowTokenAddress):
      case buildFlowTokensWithdrawnEvent(
        nonMonotonicAddresses.flowTokenAddress
      ):
        // New emulator accounts are initialized
        // with a default Flow balance coming from null address.
        return event.data.from
          ? this.reIndexAccount(event.data.from)
          : undefined;
      case buildFlowTokensDepositedEvent(monotonicAddresses.flowTokenAddress):
      case buildFlowTokensDepositedEvent(
        nonMonotonicAddresses.flowTokenAddress
      ):
        return this.reIndexAccount(event.data.to);
      default:
        return null; // not a standard event, ignore it
    }
  }

  private async processNewTransaction(options: {
    block: flowResource.FlowBlock;
    transaction: flowResource.FlowTransaction;
    transactionStatus: flowResource.FlowTransactionStatus;
  }) {
    const parsedInteraction = await this.goBindings.getParsedInteraction({
      sourceCode: options.transaction.script,
    });
    if (parsedInteraction.error) {
      this.logger.error(
        `Unexpected interaction parsing error: ${parsedInteraction.error}`
      );
    }
    return this.transactionIndex.add(
      this.createTransactionEntity({ ...options, parsedInteraction })
    );
  }

  private async reIndexAccount(options: {
    address: string;
    block: flowResource.FlowBlock;
  }) {
    const { address, block } = options;
    const flowAccount = await this.flowGatewayService.getAccount(address);
    const flowserAccount = this.createAccountEntity({
      account: flowAccount,
      block: block,
    });

    await Promise.all([
      this.accountIndex.add(flowserAccount),
      // TODO(restructure): Should we store keys/contracts within the account index or a separate one?
      Promise.all(
        Object.keys(flowAccount.contracts).map((name) =>
          this.contractIndex.add(
            this.createContractEntity({
              account: flowAccount,
              block: block,
              name,
              code: flowAccount.contracts[name],
            })
          )
        )
      ),
    ]);
  }

  private async reIndexAllAccountStorage() {
    const allAccounts = await this.accountIndex.findAll();
    this.logger.debug(
      `Processing storages for accounts: ${allAccounts.join(", ")}`
    );
    await Promise.all(
      allAccounts.map((account: flowserResource.FlowAccount) =>
        this.reIndexAccountStorage(account.address)
      )
    );
  }

  private async reIndexAccountStorage(address: string) {
    const storages = await this.flowStorageService.getAccountStorageItems(
      address
    );
    return Promise.all(
      storages.map((storage) => this.accountStorageIndex.add(storage))
    );
  }

  private async isServiceAccountProcessed(options?: WellKnownAddressesOptions) {
    const { serviceAccountAddress } =
      this.flowEmulatorService.getWellKnownAddresses(options);
    try {
      const serviceAccount = await this.accountIndex.findOneById(
        serviceAccountAddress
      );

      // Service account is already created by the wallet service,
      // but that service doesn't set the public key.
      // So if public key isn't present,
      // we know that we haven't processed this account yet.
      return Boolean(serviceAccount?.keys?.[0]?.publicKey);
    } catch (e) {
      // Service account not found
      return false;
    }
  }

  private async processWellKnownAccountsForNonManagedEmulator() {
    // When using non-managed emulator,
    // we don't know if the blockchain uses monotonic or non-monotonic addresses,
    // so we need to try processing well-known accounts with both options.
    const isManagedEmulator = this.emulatorProcess?.isRunning();
    if (isManagedEmulator) {
      return;
    }

    // Ignore errors that any of the functions throw
    await Promise.allSettled([
      this.processWellKnownAccounts({
        overrideUseMonotonicAddresses: true,
      }),
      this.processWellKnownAccounts({
        overrideUseMonotonicAddresses: false,
      }),
    ]);
  }

  private async processWellKnownAccounts(options?: WellKnownAddressesOptions) {
    const isAlreadyProcessed = await this.isServiceAccountProcessed(options);

    if (isAlreadyProcessed) {
      // Assume all other accounts are also processed (we batch process them together).
      return;
    }

    // Afaik these well-known default accounts are
    // bootstrapped in a "meta-transaction",
    // which is hidden from the public blockchain.
    // See: https://github.com/onflow/flow-go/blob/master/fvm/bootstrap.go
    const nonExistingBlock: flowResource.FlowBlock = {
      id: "NULL",
      blockSeals: [],
      collectionGuarantees: [],
      height: 0,
      parentId: "",
      signatures: [],
      timestamp: 0,
    };

    await Promise.all(
      this.getAllWellKnownAddresses(options).map((address) =>
        this.reIndexAccount({
          address,
          block: nonExistingBlock,
        })
      )
    );
  }

  private getAllWellKnownAddresses(options?: WellKnownAddressesOptions) {
    // TODO(snapshots-revamp): Try processing monotonic and normal addresses
    //  as we don't know which setting is used if non-managed emulator is used.
    const wellKnownAddresses =
      this.flowEmulatorService.getWellKnownAddresses(options);
    return [
      wellKnownAddresses.serviceAccountAddress,
      wellKnownAddresses.fungibleTokenAddress,
      wellKnownAddresses.flowFeesAddress,
      wellKnownAddresses.flowTokenAddress,
    ];
  }

  private createAccountEntity(options: {
    account: flowResource.FlowAccount;
    block: flowResource.FlowBlock;
  }): flowserResource.FlowAccount {
    const { account, block } = options;

    const allPossibleWellKnownAddresses = [
      this.getAllWellKnownAddresses({ overrideUseMonotonicAddresses: true }),
      this.getAllWellKnownAddresses({ overrideUseMonotonicAddresses: false }),
    ].flat();

    const address = ensurePrefixedAddress(account.address);

    return {
      id: address,
      balance: account.balance,
      address,
      blockId: block.id,
      isDefaultAccount: allPossibleWellKnownAddresses.includes(address),
      code: account.code,
      keys: account.keys.map((flowKey) =>
        this.createKeyEntity({
          account: account,
          key: flowKey,
          block: block,
        })
      ),
    };
  }

  private createKeyEntity(options: {
    account: flowResource.FlowAccount;
    key: flowResource.FlowKey;
    block: flowResource.FlowBlock;
  }): flowserResource.FlowAccountKey {
    const { account, key, block } = options;

    const signAlgoLookup = new Map([
      [0, SignatureAlgorithm.ECDSA_P256],
      [1, SignatureAlgorithm.ECDSA_secp256k1],
    ]);

    const hashAlgoLookup = new Map([
      [0, HashAlgorithm.SHA2_256],
      [1, HashAlgorithm.SHA3_256],
    ]);

    const accountAddress = ensurePrefixedAddress(account.address);

    return {
      id: `${accountAddress}.${key.index}`,
      index: key.index,
      accountAddress,
      publicKey: key.publicKey,
      signAlgo: signAlgoLookup.get(key.signAlgo),
      hashAlgo: hashAlgoLookup.get(key.hashAlgo),
      weight: key.weight,
      sequenceNumber: key.sequenceNumber,
      revoked: key.revoked,
      blockId: block.id,
      privateKey: "",
    };
  }

  private createEventEntity(options: {
    event: ExtendedFlowEvent;
  }): flowserResource.FlowEvent {
    const { event } = options;
    return {
      id: `${event.transactionId}.${event.eventIndex}`,
      type: event.type,
      transactionIndex: event.transactionIndex,
      transactionId: event.transactionId,
      blockId: event.blockId,
      eventIndex: event.eventIndex,
      data: event.data,
    };
  }

  private createBlockEntity(options: {
    block: flowResource.FlowBlock;
  }): flowserResource.FlowBlock {
    const { block } = options;
    return {
      id: block.id,
      collectionGuarantees: block.collectionGuarantees,
      blockSeals: block.blockSeals,
      // TODO(milestone-x): "signatures" field is not present in block response
      // https://github.com/onflow/fcl-js/issues/1355
      signatures: block.signatures ?? [],
      timestamp: new Date(block.timestamp),
      blockHeight: block.height,
      parentId: block.parentId,
    };
  }

  private createContractEntity(options: {
    block: flowResource.FlowBlock;
    account: flowResource.FlowAccount;
    name: string;
    code: string;
  }): flowserResource.FlowContract {
    const { account, block, name, code } = options;
    return {
      id: `${account.address}.${name}`,
      blockId: block.id,
      address: ensurePrefixedAddress(account.address),
      name: name,
      code: code,
    };
  }

  private createTransactionEntity(options: {
    block: flowResource.FlowBlock;
    transaction: flowResource.FlowTransaction;
    transactionStatus: flowResource.FlowTransactionStatus;
    parsedInteraction: GetParsedInteractionResponse;
  }): flowserResource.FlowTransaction {
    const { block, transaction, transactionStatus, parsedInteraction } =
      options;

    // FCL-JS returns type-annotated argument values.
    // But we don't need the type info since we already have
    // our own system of representing types with `CadenceType` message.
    function fromTypeAnnotatedFclArguments(
      object: flowResource.FlowTypeAnnotatedValue
    ): unknown {
      const { type, value } = object;
      // Available type values are listed here:
      // https://developers.flow.com/tooling/fcl-js/api#ftype
      switch (type) {
        case "Dictionary":
          return value.map((entry: any) => ({
            key: fromTypeAnnotatedFclArguments(entry.key),
            value: fromTypeAnnotatedFclArguments(entry.value),
          }));
        case "Array":
          return value.map((element: any) =>
            fromTypeAnnotatedFclArguments(element)
          );
        case "Path":
        case "PublicPath":
        case "PrivatePath":
        case "StoragePath":
        case "CapabilityPath":
        default:
          return value;
      }
    }

    return {
      id: transaction.id,
      script: transaction.script,
      payer: ensurePrefixedAddress(transaction.payer),
      blockId: block.id,
      referenceBlockId: transaction.referenceBlockId,
      gasLimit: transaction.gasLimit,
      authorizers: transaction.authorizers.map((address) =>
        ensurePrefixedAddress(address)
      ),
      arguments:
        parsedInteraction.interaction?.parameters.map(
          (parameter, index): flowserResource.FlowTransactionArgument => ({
            identifier: parameter.identifier,
            type: parameter.type,
            valueAsJson: JSON.stringify(
              fromTypeAnnotatedFclArguments(transaction.args[index])
            ),
          })
        ) ?? [],
      proposalKey: {
        ...transaction.proposalKey,
        address: ensurePrefixedAddress(transaction.proposalKey.address),
      },
      envelopeSignatures: this.deserializeSignableObjects(
        transaction.envelopeSignatures
      ),
      payloadSignatures: this.deserializeSignableObjects(
        transaction.payloadSignatures
      ),
      status: {
        errorMessage: transactionStatus.errorMessage,
        grcpStatus: this.reMapGrcpStatus(transactionStatus.statusCode),
        executionStatus: transactionStatus.status,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  private reMapGrcpStatus(statusCode: number) {
    // Older versions of the emulator use incorrect statusCode values.
    // See: https://github.com/onflow/flow-go/issues/4494#issuecomment-1601995168
    return [0, 1].includes(statusCode) ? statusCode : 1;
  }

  private deserializeSignableObjects(
    signableObjects: flowResource.FlowSignableObject[]
  ): flowserResource.SignableObject[] {
    return signableObjects.map((signable) => ({
      ...signable,
      address: ensurePrefixedAddress(signable.address),
    }));
  }
}
