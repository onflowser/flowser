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
  constructor(public readonly indexes: BlockchainIndexes) {}

  clear() {
    this.findAll().forEach((index) => index.clear());
  }

  private findAll(): IResourceIndex<
    IdentifiableResource & TimestampedResource
  >[] {
    return Object.values(this.indexes);
  }
}
