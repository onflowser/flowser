import * as flowResource from "./flow-gateway.service";
import * as flowserResource from "@onflowser/api";
import {
  IResourceIndex,
  HashAlgorithm,
  SignatureAlgorithm,
  ParsedInteractionOrError,
} from "@onflowser/api";
import { IFlowInteractions } from "./flow-interactions.service";
import { FlowAccountStorageService } from "./flow-storage.service";
import { FlowApiStatus, FlowGatewayService, FlowAccountKeyEvent } from "./flow-gateway.service";
import { ensurePrefixedAddress } from "./utils";
import { IFlowserLogger } from './logger';
import { FclValue } from "./fcl-value";

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

export class FlowIndexerService {
  constructor(
    private readonly logger: IFlowserLogger,
    private transactionIndex: IResourceIndex<flowserResource.FlowTransaction>,
    private accountIndex: IResourceIndex<flowserResource.FlowAccount>,
    private blockIndex: IResourceIndex<flowserResource.FlowBlock>,
    private eventIndex: IResourceIndex<flowserResource.FlowEvent>,
    private contractIndex: IResourceIndex<flowserResource.FlowContract>,
    private accountKeyIndex: IResourceIndex<flowserResource.FlowAccountKey>,
    private accountStorageIndex: IResourceIndex<flowserResource.FlowAccountStorage>,
    private flowStorageService: FlowAccountStorageService,
    private flowGatewayService: FlowGatewayService,
    private flowInteractionsService: IFlowInteractions,
  ) {}

  async processBlockchainData(): Promise<void> {
    const gatewayStatus = await this.flowGatewayService.getApiStatus();
    if (gatewayStatus !== FlowApiStatus.SERVICE_STATUS_ONLINE) {
      this.logger.debug("Gateway offline, pausing processing.");
      return;
    }

    const [unprocessedBlockInfo] = await Promise.all([
      this.getUnprocessedBlocksInfo(),
      this.processWellKnownAccounts(),
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
      : 0;
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

    try {
      await this.processBlockData(blockData);
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
    } catch (e: unknown) {
      this.logger.error("Failed to wait on sealed transaction", e);
    } finally {
      // Once transaction is sealed, status won't change anymore.
      unsubscribe();
    }
  }

  private async processBlockData(data: BlockData) {
    const blockPromise = this.blockIndex
      .create(this.createBlockEntity({ block: data.block }))
      .catch((e: unknown) =>
        this.logger.error("block save error", e)
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
          .create(
            this.createEventEntity({
              event: flowEvent,
            })
          )
          .catch((e: any) =>
            this.logger.error(`event save error: ${e.message}`, e.stack)
          )
      )
    );

    return Promise.all([
      blockPromise,
      transactionPromises,
      eventPromises,
      this.processEventBatch({
        events: data.events,
        block: data.block,
      })
    ]);
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

  private async processEventBatch(options: {
    events: flowResource.FlowEvent[];
    block: flowResource.FlowBlock;
  }) {
    const { events, block } = options;
    await Promise.all(
      events.map((flowEvent) =>
        this.processSingleEvent({ event: flowEvent, block: block }).catch(
          (e) => {
            this.logger.error(
              `Event handling error: ${
                e.message
              } (${JSON.stringify(flowEvent)})`,
              e.stack
            );
          }
        )
      )
    );
  }

  private async processSingleEvent(options: {
    event: flowResource.FlowEvent;
    block: flowResource.FlowBlock;
  }) {
    const { event, block } = options;
    this.logger.debug(
      `Processing event: ${JSON.stringify(event)}`
    );

    const isFlowTokenWithdrawnEvent = (eventId: string) =>
      /A\..*\.FlowToken\.TokensWithdrawn/.test(eventId);
    const isFlowTokenDepositedEvent = (eventId: string) =>
      /A\..*\.FlowToken\.TokensDeposited/.test(eventId);

    const address = ensurePrefixedAddress(event.data.address);
    switch (event.type) {
      case FlowCoreEventType.ACCOUNT_CREATED:
        return this.createAccount({
          address,
          block,
        });
      case FlowCoreEventType.ACCOUNT_KEY_ADDED:
        return this.processAccountKeyAddedEvent(event);
      case FlowCoreEventType.ACCOUNT_KEY_REMOVED:
        return this.processAccountKeyRemovedEvent(event);
      case FlowCoreEventType.ACCOUNT_CONTRACT_ADDED:
      case FlowCoreEventType.ACCOUNT_CONTRACT_UPDATED:
      case FlowCoreEventType.ACCOUNT_CONTRACT_REMOVED:
        // TODO: Stop re-fetching all contracts and instead use event.data.contract to get the removed/updated/added contract
        // return this.createAccount({ address, block });
    }

    switch (true) {
      case isFlowTokenWithdrawnEvent(event.type):
        const tokenWithdrawnData = event.data as {from: string; amount: number}
        // New emulator accounts are initialized
        // with a default Flow balance coming from null address.
        return tokenWithdrawnData.from
          ? this.updateAccountBalance(tokenWithdrawnData.from)
          : undefined;
      case isFlowTokenDepositedEvent(event.type):
        const tokenDepositedData = event.data as {to: string; amount: number}
        return this.updateAccountBalance(tokenDepositedData.to);
    }
  }

  private async processAccountKeyAddedEvent(event: FlowAccountKeyEvent) {
    const publicKey = this.decodeUint8PublicKey(event.data.publicKey.publicKey);
    const account = await this.flowGatewayService.getAccount(event.data.address);
    const key = account.keys.find(key => key.publicKey === publicKey);

    if (key === undefined) {
      throw new Error("Cannot find key from event")
    }

    // Use `upsert` instead of `create` because a key
    // may have already been created by wallet service.
    // In that case we want to update everything except for the `privateKey field.
    return this.accountKeyIndex.upsert(this.createKeyEntity({
      key,
      address: account.address
    }))
  }

  private async processAccountKeyRemovedEvent(event: FlowAccountKeyEvent) {
    const publicKey = this.decodeUint8PublicKey(event.data.publicKey.publicKey);
    const keyId = this.buildKeyId({
      address: event.data.address,
      publicKey: publicKey
    });
    await this.accountKeyIndex.delete({id: keyId})
  }

  private decodeUint8PublicKey(encodedKey: string[]) {
    return Buffer.from(new Uint8Array(encodedKey.map(Number))).toString("hex");
  }

  private async processNewTransaction(options: {
    block: flowResource.FlowBlock;
    transaction: flowResource.FlowTransaction;
    transactionStatus: flowResource.FlowTransactionStatus;
  }) {
    const parsedInteraction = await this.flowInteractionsService.parse(
      options.transaction.script
    );
    if (parsedInteraction.error) {
      this.logger.error(
        `Unexpected interaction parsing error: ${parsedInteraction.error}`
      );
    }
    return this.transactionIndex.create(
      this.createTransactionEntity({ ...options, parsedInteraction })
    );
  }

  private async updateAccountBalance(address: string) {
    const flowAccount = await this.flowGatewayService.getAccount(address);
    // Use `upsert` instead of `create` because we are processing a batch
    // of events (which may include "account created" event) in parallel.
    await this.accountIndex.upsert(this.createAccountEntity(flowAccount))
  }

  private async createAccount(options: {
    address: string;
    block: flowResource.FlowBlock;
  }) {
    const { address, block } = options;
    const flowAccount = await this.flowGatewayService.getAccount(address);

    await Promise.all([
      // We need to use `upsert` instead of `create`,
      // mainly because this account was possibly already created by wallet service.
      this.accountIndex.upsert(this.createAccountEntity(flowAccount)),
      Promise.all(flowAccount.keys.map(key => this.accountKeyIndex.create(this.createKeyEntity({
        address,
        key
      })))),
      Promise.all(
        Object.keys(flowAccount.contracts).map((name) =>
          this.contractIndex.create(
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
      `Processing storages for accounts: ${allAccounts.map(e => e.address).join(", ")}`
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
      storages.map((storage) => this.accountStorageIndex.upsert(storage))
    );
  }

  private async processWellKnownAccounts() {
    // TODO(restructure): Early exit if accounts already processed?

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
      this.getAllWellKnownAddresses()
        .filter(address => this.accountIndex.findOneById(address) !== undefined)
        .map((address) =>
          this.createAccount({
            address,
            block: nonExistingBlock,
          }).catch(error => {
            // Most likely an account not found error monotonic/non-monotonic addresses.
            // Can be safely ignored.
            // TODO(restructure): Smarter handling of monotonic/non-monotonic addresses
          })
        )
    );
  }

  /**
   * Well known addresses have predefined roles
   * and are used to deploy common/core flow contracts.
   *
   * For more info, see source code:
   * - https://github.com/onflow/flow-emulator/blob/ebb90a8e721344861bb7e44b58b934b9065235f9/server/server.go#L163-L169
   * - https://github.com/onflow/flow-emulator/blob/ebb90a8e721344861bb7e44b58b934b9065235f9/emulator/contracts.go#L17-L60
   */
  private getAllWellKnownAddresses() {
    // When "simple-addresses" flag is provided,
    // a monotonic address generation mechanism is used:
    // https://github.com/onflow/flow-emulator/blob/ebb90a8e721344861bb7e44b58b934b9065235f9/emulator/blockchain.go#L336-L342

    return [
      // Service account address
      "0x0000000000000001",
      "0xf8d6e0586b0a20c7",
      // Fungible token address
      "0x0000000000000002",
      "0xee82856bf20e2aa6",
      // Flow token address
      "0x0000000000000003",
      "0x0ae53cb6e3f42a79",
      // Flow fees address
      "0x0000000000000004",
      "0xe5a8b7f23e8b548f",
    ];
  }

  private createAccountEntity(account: flowResource.FlowAccount): flowserResource.FlowAccount {
    const address = ensurePrefixedAddress(account.address);

    const tags: flowserResource.FlowAccountTag[] = [];

    const isDefaultAccount = this.getAllWellKnownAddresses().includes(address);

    if (isDefaultAccount) {
      tags.push({
        name: "Default",
        description: "This account was created automatically by the emulator."
      })
    }

    const isServiceAccount = [
      "0xf8d6e0586b0a20c7",
      "0x0000000000000001", // When using monotonic addresses setting
    ].includes(address);

    // https://developers.flow.com/concepts/flow-token/concepts#flow-service-account
    if (isServiceAccount) {
      tags.push({
        name: "Service",
        description:
          "A special account in Flow that has special permissions to manage system contracts. It is able to mint tokens, set fees, and update network-level contracts.",
      });
    }

    return {
      id: address,
      balance: account.balance,
      address,
      tags,
      code: account.code,
      // TODO(restructure): Maybe the index should be the one dealing with these dates
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: undefined,
    };
  }

  private createKeyEntity(options: {
    address:string;
    key: flowResource.FlowKey;
  }): flowserResource.FlowAccountKey {
    const { address, key } = options;

    const signAlgoLookup = new Map([
      [0, SignatureAlgorithm.ECDSA_P256],
      [1, SignatureAlgorithm.ECDSA_secp256k1],
    ]);

    const hashAlgoLookup = new Map([
      [0, HashAlgorithm.SHA2_256],
      [1, HashAlgorithm.SHA3_256],
    ]);

    return {
      id: this.buildKeyId({
        address,
        publicKey: key.publicKey
      }),
      index: key.index,
      address: address,
      publicKey: key.publicKey,
      signAlgo: signAlgoLookup.get(key.signAlgo),
      hashAlgo: hashAlgoLookup.get(key.hashAlgo),
      weight: key.weight,
      sequenceNumber: key.sequenceNumber,
      revoked: key.revoked,
      // Do not include `privateKey` field here,
      // otherwise it may override private key that was created by wallet service.
      createdAt: new Date(),
      deletedAt: undefined,
      updatedAt: new Date(),
    };
  }

  private buildKeyId(options: {
    address: string;
    publicKey: string
  }) {
    const accountAddress = ensurePrefixedAddress(options.address);
    return `${accountAddress}.${options.publicKey}`
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
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: undefined,
    };
  }

  private createBlockEntity(options: {
    block: flowResource.FlowBlock;
  }): flowserResource.FlowBlock {
    const { block } = options;
    return {
      id: block.id,
      height: block.height,
      collectionGuarantees: block.collectionGuarantees,
      blockSeals: block.blockSeals,
      // TODO(milestone-x): "signatures" field is not present in block response
      // https://github.com/onflow/fcl-js/issues/1355
      signatures: block.signatures ?? [],
      timestamp: new Date(block.timestamp),
      blockHeight: block.height,
      parentId: block.parentId,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: undefined,
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
      // TODO(restructure): Populate local config if applicable
      localConfig: undefined,
      name: name,
      code: code,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: undefined,
    };
  }

  private createTransactionEntity(options: {
    block: flowResource.FlowBlock;
    transaction: flowResource.FlowTransaction;
    transactionStatus: flowResource.FlowTransactionStatus;
    parsedInteraction: ParsedInteractionOrError;
  }): flowserResource.FlowTransaction {
    const { block, transaction, transactionStatus, parsedInteraction } =
      options;

    // FCL-JS returns type-annotated argument values.
    // But we don't need the type info since we already have
    // our own system of representing types with `CadenceType` message.
    function fromTypeAnnotatedFclArguments(
      object: flowResource.FlowTypeAnnotatedValue
    ): FclValue {
      const { type, value } = object;
      // Available type values are listed here:
      // https://developers.flow.com/tooling/fcl-js/api#ftype
      switch (type) {
        case "Dictionary":
          // TODO(restructure): Double check this
          // @ts-ignore
          return value?.map((entry: any) => ({
            key: fromTypeAnnotatedFclArguments(entry.key),
            value: fromTypeAnnotatedFclArguments(entry.value),
          }));
        case "Array":
          // TODO(restructure): Double check this
          // @ts-ignore
          return value?.map((element: any) =>
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
          (parameter, index): flowserResource.FclArgumentWithMetadata => ({
            identifier: parameter.identifier,
            type: parameter.type,
            value:  fromTypeAnnotatedFclArguments(transaction.args[index]),
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
      deletedAt: undefined,
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
