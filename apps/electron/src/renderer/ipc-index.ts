import { IdentifiableResource, TimestampedResource } from '@onflowser/api';
import { InMemoryIndex } from '@onflowser/core';

import { BlockchainIndexes } from '../services/blockchain-index.service';

type IdentifiableAndTimestampedResource = IdentifiableResource &
  TimestampedResource;

export class IpcIndex<
  Resource extends IdentifiableAndTimestampedResource,
> extends InMemoryIndex<Resource> {
  constructor(private readonly indexName: keyof BlockchainIndexes) {
    super();

    // TODO(restructure): Maybe manually handle this from react app instead
    this.syncOnInterval();
  }

  async findAll(): Promise<Resource[]> {
    const allResources = await super.findAll();
    return allResources.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }

  syncOnInterval() {
    setInterval(() => this.sync(), 1000);
  }

  async sync() {
    const resources = await window.electron.indexes.getAll(this.indexName);

    // Clear in case the other index was also cleared.
    await this.clear();

    await Promise.allSettled(
      resources.map((resource: Resource) => this.create(resource)),
    );
  }
}
