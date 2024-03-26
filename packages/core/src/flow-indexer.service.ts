import * as flowResource from "./flow-gateway.service";
import * as flowserResource from "@onflowser/api";
import {
  IResourceIndex,
  HashAlgorithm,
  SignatureAlgorithm,
  ParsedInteractionOrError,
  OmitTimestamps,
} from "@onflowser/api";
import { IFlowInteractions } from "./flow-interactions.service";
import { FlowAccountStorageService } from "./flow-storage.service";
import {
  FlowGatewayService,
  FlowAccountKeyEvent,
  FlowAccountContractEvent,
  FlowCoreEventType,
} from "./flow-gateway.service";
import { ensurePrefixedAddress } from "./utils";
import { IFlowserLogger } from "./logger";
import { FclValue } from "./fcl-value";

type UnprocessedBlockInfo = {
  nextBlockHeightToProcess: number;
  latestUnprocessedBlockHeight: number;
};

export type BlockchainIndexes = {
  accountStorage: IResourceIndex<flowserResource.FlowAccountStorage>;
  contract: IResourceIndex<flowserResource.FlowContract>;
  accountKey: IResourceIndex<flowserResource.FlowAccountKey>;
  block: IResourceIndex<flowserResource.FlowBlock>;
  event: IResourceIndex<flowserResource.FlowEvent>;
  transaction: IResourceIndex<flowserResource.FlowTransaction>;
  account: IResourceIndex<flowserResource.FlowAccount>;
};

export class FlowIndexerService {
  constructor(
    private readonly logger: IFlowserLogger,
    private flowStorageService: FlowAccountStorageService,
    private flowGatewayService: FlowGatewayService,
    private flowInteractionsService: IFlowInteractions,
    private indexes: BlockchainIndexes
  ) {}

  public async processBlockchain(): Promise<void> {
    const isGatewayOnline = await this.flowGatewayService.isRestApiReachable();

    if (!isGatewayOnline) {
      this.logger.debug("Gateway offline, pausing processing.");
      return;
    }

    const [unprocessedBlocksInfo] = await Promise.all([
      this.getUnprocessedBlocksInfo(),
      this.maybeProcessWellKnownAccounts(),
    ]);

      for (
        let height = unprocessedBlocksInfo.nextBlockHeightToProcess;
        height <= unprocessedBlocksInfo.latestUnprocessedBlockHeight;
        height++
      ) {
        try {
          this.logger.debug(`Processing block: ${height}`);
          const block = await this.flowGatewayService.getBlockByHeight(height);
          // TODO: Can we now process blocks in parallel?
          // Blocks must be processed in sequential order (not in parallel)
          // because objects on subsequent blocks can reference objects from previous blocks
          // (e.g. a transaction may reference an account from previous block)
          await Promise.all([
            this.processBlock(block, {
              indexTransactions: true
            }),
            // We don't know when account storage changed
            // without parsing transaction source code.
            // For now just re-index storage of all accounts.
            this.reIndexAllAccountStorage(),
          ]);
        } catch (e) {
          this.logger.error(`Failed to process block (#${height}) data`, e);
        }
      }
  }

  private async getUnprocessedBlocksInfo(): Promise<UnprocessedBlockInfo> {
    const [indexedBlocks, latestBlock] = await Promise.all([
      this.indexes.block.findAll(),
      this.flowGatewayService.getLatestBlock(),
    ]);
    const lastIndexedBlock = this.findLatestBlock(indexedBlocks);
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

  public async processBlock(block: flowResource.FlowBlock, options: {
    // Should index all block transaction
    indexTransactions: boolean;
  }): Promise<void> {

    await this.indexes.block
      .create(this.createBlockEntity({ block }))
      .catch((e: unknown) => this.logger.error("block save error", e));

    if (!options.indexTransactions) {
      return;
    }

    const collections = await Promise.all(
      block.collectionGuarantees.map(async (guarantee) =>
        this.flowGatewayService.getCollectionById(guarantee.collectionId),
      ),
    );
    const transactionIds = collections
      .map((collection) => collection.transactionIds)
      .flat();

    const [transactions, statuses] = await Promise.all([
      Promise.all(transactionIds.map((txId) =>
        this.flowGatewayService.getTransactionById(txId),
      )),
      Promise.all(transactionIds.map((txId) =>
        this.flowGatewayService.getTransactionStatusById(txId),
      )),
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
        })),
      )
      .flat();

    const transactionPromises = Promise.all(
      transactionsWithStatuses.map((transaction) =>
        this.processTransaction({
          transaction: transaction,
          transactionStatus: transaction.status,
        }).catch((e: any) =>
          this.logger.error(`transaction save error: ${e.message}`, e.stack),
        ),
      ),
    );

    const eventPromises = Promise.all(
      events.map((event) =>
        this.processEvent(event).catch((e) => {
          this.logger.error(
            `Event handling error: ${e.message} (${JSON.stringify(event)})`,
            e.stack,
          );
        }),
      ),
    );

    await Promise.all([
      transactionPromises,
      eventPromises,
    ]);
  }

  public async processEvent(event: flowResource.FlowEvent) {
    this.logger.debug(`Processing event: ${JSON.stringify(event)}`);

    await this.indexes.event.create(this.createEventEntity(event))

    const isFlowTokenWithdrawnEvent = (eventId: string) =>
      /A\..*\.FlowToken\.TokensWithdrawn/.test(eventId);
    const isFlowTokenDepositedEvent = (eventId: string) =>
      /A\..*\.FlowToken\.TokensDeposited/.test(eventId);

    const address = ensurePrefixedAddress(event.data.address);
    switch (event.type) {
      case FlowCoreEventType.ACCOUNT_CREATED:
        return this.createAccount(address);
      case FlowCoreEventType.ACCOUNT_KEY_ADDED:
        return this.onAccountKeyAddedEvent(event);
      case FlowCoreEventType.ACCOUNT_KEY_REMOVED:
        return this.onAccountKeyRemovedEvent(event);
      case FlowCoreEventType.ACCOUNT_CONTRACT_ADDED:
        return this.onAccountContractAdded(event);
      case FlowCoreEventType.ACCOUNT_CONTRACT_UPDATED:
        return this.onAccountContractUpdated(event);
      case FlowCoreEventType.ACCOUNT_CONTRACT_REMOVED:
        return this.onAccountContractRemoved(event);
    }

    switch (true) {
      case isFlowTokenWithdrawnEvent(event.type):
        const tokenWithdrawnData = event.data as {
          from: string;
          amount: number;
        };
        // New emulator accounts are initialized
        // with a default Flow balance coming from null address.
        return tokenWithdrawnData.from
          ? this.updateAccountBalance(tokenWithdrawnData.from)
          : undefined;
      case isFlowTokenDepositedEvent(event.type):
        const tokenDepositedData = event.data as { to: string; amount: number };
        return this.updateAccountBalance(tokenDepositedData.to);
    }
  }

  private async onAccountContractAdded(event: FlowAccountContractEvent) {
    const account = await this.flowGatewayService.getAccount(
      event.data.address,
    );

    await this.indexes.contract.create(
      this.createContractEntity({
        account,
        name: event.data.contract,
      }),
    );
  }

  private async onAccountContractUpdated(event: FlowAccountContractEvent) {
    const account = await this.flowGatewayService.getAccount(
      event.data.address,
    );

    await this.indexes.contract.update(
      this.createContractEntity({
        account,
        name: event.data.contract,
      }),
    );
  }

  private async onAccountContractRemoved(event: FlowAccountContractEvent) {
    const account = await this.flowGatewayService.getAccount(
      event.data.address,
    );

    await this.indexes.contract.delete(
      this.createContractEntity({
        account,
        name: event.data.contract,
      }),
    );
  }

  private async onAccountKeyAddedEvent(event: FlowAccountKeyEvent) {
    const publicKey = this.decodeUint8PublicKey(event.data.publicKey.publicKey);
    const account = await this.flowGatewayService.getAccount(
      event.data.address,
    );
    const key = account.keys.find((key) => key.publicKey === publicKey);

    if (key === undefined) {
      throw new Error("Cannot find key from event");
    }

    return this.indexes.accountKey.create(
      this.createKeyEntity({
        key,
        address: account.address,
      }),
    );
  }

  private async onAccountKeyRemovedEvent(event: FlowAccountKeyEvent) {
    const publicKey = this.decodeUint8PublicKey(event.data.publicKey.publicKey);
    const keyId = this.buildKeyId({
      address: event.data.address,
      publicKey: publicKey,
    });
    await this.indexes.accountKey.delete({ id: keyId });
  }

  private decodeUint8PublicKey(encodedKey: string[]) {
    return Buffer.from(new Uint8Array(encodedKey.map(Number))).toString("hex");
  }

  public async processTransaction(options: {
    transaction: flowResource.FlowTransaction;
    transactionStatus: flowResource.FlowTransactionStatus;
  }) {
    const parsedInteraction = await this.flowInteractionsService.parse(
      options.transaction.script,
    );
    if (parsedInteraction.error) {
      this.logger.error(
        `Unexpected interaction parsing error: ${parsedInteraction.error}`,
      );
    }

    this.subscribeToTransactionStatusUpdates(options.transaction.id).then(() => {
      // Ignore waiting for status update completion
    });

    return this.indexes.transaction.create(
      this.createTransactionEntity({ ...options, parsedInteraction }),
    );
  }

  private async subscribeToTransactionStatusUpdates(
    transactionId: string,
  ): Promise<void> {
    const unsubscribe = this.flowGatewayService
      .getTxStatusSubscription(transactionId)
      .subscribe(async (newStatus) => {
        const indexedBlock = await this.indexes.block.findOneById(newStatus.blockId)

        // When initial status is fetched,
        // transaction may not be included in the block yet.
        if (newStatus.blockId && indexedBlock === undefined) {
          const block = await this.flowGatewayService.getBlockById(newStatus.blockId);
          await this.processBlock(block, {
            indexTransactions: false
          })
        }

        await this.indexes.transaction.update({
          id: transactionId,
          blockId: newStatus.blockId,
          status: {
            errorMessage: newStatus.errorMessage,
            grcpStatus: this.reMapGrcpStatus(newStatus.statusCode),
            executionStatus: newStatus.status
          }
        });
      });
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

  private async updateAccountBalance(address: string) {
    const flowAccount = await this.flowGatewayService.getAccount(address);
    // Use `upsert` instead of `create` because we are processing a batch
    // of events (which may include "account created" event) in parallel.
    await this.indexes.account.upsert(this.createAccountEntity(flowAccount));
  }

  private async createAccount(address: string) {
    const account = await this.flowGatewayService.getAccount(address);

    await Promise.all([
      // Use `upsert` instead of `create` because we are processing a batch
      // of events (which may include "token balance updated" event) in parallel.
      this.indexes.account.upsert(this.createAccountEntity(account)),
      Promise.all(
        account.keys.map((key) =>
          this.indexes.accountKey.create(
            this.createKeyEntity({
              address,
              key,
            }),
          ),
        ),
      ),
      Promise.all(
        Object.keys(account.contracts).map((name) =>
          this.indexes.contract.create(
            this.createContractEntity({
              account,
              name,
            }),
          ),
        ),
      ),
    ]);
  }

  private async reIndexAllAccountStorage() {
    const allAccounts = await this.indexes.account.findAll();
    this.logger.debug(
      `Processing storages for accounts: ${allAccounts
        .map((e) => e.address)
        .join(", ")}`,
    );
    await Promise.all(
      allAccounts.map((account: flowserResource.FlowAccount) =>
        this.reIndexAccountStorage(account.address),
      ),
    );
  }

  private async reIndexAccountStorage(address: string) {
    const storages =
      await this.flowStorageService.getAccountStorageItems(address);
    return Promise.all(
      storages.map((storage) => this.indexes.accountStorage.upsert(storage)),
    );
  }

  private async maybeProcessWellKnownAccounts() {
    await Promise.all(
      this.getAllWellKnownAddresses()
        .filter(
          (address) => this.indexes.account.findOneById(address) !== undefined,
        )
        .map((address) =>
          this.createAccount(address).catch((error) => {
            // Most likely an account not found error monotonic/non-monotonic addresses.
            // Can be safely ignored.
          }),
        ),
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

  private createAccountEntity(
    account: flowResource.FlowAccount,
  ): OmitTimestamps<flowserResource.FlowAccount> {
    const address = ensurePrefixedAddress(account.address);

    const tags: flowserResource.FlowAccountTag[] = [];

    const isDefaultAccount = this.getAllWellKnownAddresses().includes(address);

    if (isDefaultAccount) {
      tags.push({
        name: "Default",
        description: "This account was created automatically by the emulator.",
      });
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
    };
  }

  private createKeyEntity(options: {
    address: string;
    key: flowResource.FlowKey;
  }): OmitTimestamps<flowserResource.FlowAccountKey> {
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
        publicKey: key.publicKey,
      }),
      index: key.index,
      address: address,
      publicKey: key.publicKey,
      signAlgo: signAlgoLookup.get(key.signAlgo),
      hashAlgo: hashAlgoLookup.get(key.hashAlgo),
      weight: key.weight,
      sequenceNumber: key.sequenceNumber,
      revoked: key.revoked,
    };
  }

  private buildKeyId(options: { address: string; publicKey: string }) {
    const accountAddress = ensurePrefixedAddress(options.address);
    return `${accountAddress}.${options.publicKey}`;
  }

  private createEventEntity(
    event: flowResource.FlowEvent,
  ): OmitTimestamps<flowserResource.FlowEvent> {
    return {
      id: `${event.transactionId}.${event.eventIndex}`,
      type: event.type,
      transactionIndex: event.transactionIndex,
      transactionId: event.transactionId,
      eventIndex: event.eventIndex,
      data: event.data,
    };
  }

  private createBlockEntity(options: {
    block: flowResource.FlowBlock;
  }): OmitTimestamps<flowserResource.FlowBlock> {
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
    };
  }

  private createContractEntity(options: {
    account: flowResource.FlowAccount;
    name: string;
  }): OmitTimestamps<flowserResource.FlowContract> {
    const { account, name } = options;
    return {
      id: `${account.address}.${name}`,
      address: ensurePrefixedAddress(account.address),
      name: name,
      code: account.contracts[name],
    };
  }

  private createTransactionEntity(options: {
    transaction: flowResource.FlowTransaction;
    transactionStatus: flowResource.FlowTransactionStatus;
    parsedInteraction: ParsedInteractionOrError;
  }): OmitTimestamps<flowserResource.FlowTransaction> {
    const { transaction, transactionStatus, parsedInteraction } =
      options;

    // FCL-JS returns type-annotated argument values.
    // But we don't need the type info since we already have
    // our own system of representing types with `CadenceType` message.
    function fromTypeAnnotatedFclArguments(
      object: flowResource.FlowTypeAnnotatedValue,
    ): FclValue {
      const { type, value } = object;
      // Available type values are listed here:
      // https://developers.flow.com/tooling/fcl-js/api#ftype
      switch (type) {
        case "Dictionary":
          // @ts-ignore
          return value?.map((entry: any) => ({
            key: fromTypeAnnotatedFclArguments(entry.key),
            value: fromTypeAnnotatedFclArguments(entry.value),
          }));
        case "Array":
          // @ts-ignore
          return value?.map((element: any) =>
            fromTypeAnnotatedFclArguments(element),
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
      blockId: transactionStatus.blockId,
      referenceBlockId: transaction.referenceBlockId,
      gasLimit: transaction.gasLimit,
      authorizers: transaction.authorizers.map((address) =>
        ensurePrefixedAddress(address),
      ),
      arguments:
        parsedInteraction.interaction?.parameters.map(
          (parameter, index): flowserResource.FclArgumentWithMetadata => ({
            identifier: parameter.identifier,
            type: parameter.type,
            value: fromTypeAnnotatedFclArguments(transaction.args[index]),
          }),
        ) ?? [],
      proposalKey: {
        ...transaction.proposalKey,
        address: ensurePrefixedAddress(transaction.proposalKey.address),
      },
      envelopeSignatures: this.deserializeSignableObjects(
        transaction.envelopeSignatures,
      ),
      payloadSignatures: this.deserializeSignableObjects(
        transaction.payloadSignatures,
      ),
      status: {
        errorMessage: transactionStatus.errorMessage,
        grcpStatus: this.reMapGrcpStatus(transactionStatus.statusCode),
        executionStatus: transactionStatus.status,
      },
    };
  }

  private reMapGrcpStatus(statusCode: number) {
    // Older versions of the emulator use incorrect statusCode values.
    // See: https://github.com/onflow/flow-go/issues/4494#issuecomment-1601995168
    return [0, 1].includes(statusCode) ? statusCode : 1;
  }

  private deserializeSignableObjects(
    signableObjects: flowResource.FlowSignableObject[],
  ): flowserResource.SignableObject[] {
    return signableObjects.map((signable) => ({
      ...signable,
      address: ensurePrefixedAddress(signable.address),
    }));
  }
}
