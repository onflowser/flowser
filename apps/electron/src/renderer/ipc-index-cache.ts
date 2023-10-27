import { IndexableResource, IResourceIndexReader } from '@onflowser/api';
import { BlockchainIndexes } from '../services/blockchain-index.service';

export class IpcIndexCache<Resource extends IndexableResource>
  implements IResourceIndexReader<Resource>
{
  private cachedResources: Resource[];

  constructor(private readonly indexName: keyof BlockchainIndexes) {
    this.cachedResources = [];
    // TODO(restructure): Maybe manually handle this from react app instead
    this.syncOnInterval();
  }

  async findOneById(id: string): Promise<Resource | undefined> {
    return this.cachedResources.find((resource) => resource.id === id);
  }

  async findAll(): Promise<Resource[]> {
    return this.cachedResources.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }

  syncOnInterval() {
    setInterval(() => this.sync(), 1000);
  }

  async sync() {
    this.cachedResources = await window.electron.indexes.getAll(this.indexName);
  }
}
