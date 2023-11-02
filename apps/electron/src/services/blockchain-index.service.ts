import {
  FlowAccount,
  FlowAccountStorage,
  FlowAccountKey,
  FlowBlock,
  FlowContract,
  FlowEvent,
  FlowTransaction,
  IdentifiableResource,
  IResourceIndex,
  TimestampedResource,
} from '@onflowser/api';
import { InMemoryIndex } from '@onflowser/core';

export type BlockchainIndexes = {
  accountStorage: IResourceIndex<FlowAccountStorage>;
  contract: IResourceIndex<FlowContract>;
  accountKey: IResourceIndex<FlowAccountKey>;
  block: IResourceIndex<FlowBlock>;
  event: IResourceIndex<FlowEvent>;
  transaction: IResourceIndex<FlowTransaction>;
  account: IResourceIndex<FlowAccount>;
};

export class BlockchainIndexService {
  public readonly indexes: BlockchainIndexes;

  constructor() {
    this.indexes = {
      accountKey: new InMemoryIndex(),
      transaction: new InMemoryIndex(),
      block: new InMemoryIndex(),
      account: new InMemoryIndex(),
      event: new InMemoryIndex(),
      contract: new InMemoryIndex(),
      accountStorage: new InMemoryIndex(),
    };
  }

  clear() {
    this.findAll().forEach((index) => index.clear());
  }

  private findAll(): IResourceIndex<
    IdentifiableResource & TimestampedResource
  >[] {
    return Object.values(this.indexes);
  }
}
