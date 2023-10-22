import { IdentifiableResource } from '@onflowser/api';
import { InMemoryIndex } from '@onflowser/core';
import { FlowserIndexes } from '../services/flowser-app.service';

export class IpcIndex<
  Resource extends IdentifiableResource,
> extends InMemoryIndex<Resource> {
  constructor(private readonly indexName: keyof FlowserIndexes) {
    super();

    // TODO(restructure): Maybe manually handle this from react app instead
    this.syncOnInterval();
  }

  syncOnInterval() {
    setInterval(() => this.sync(), 1000);
  }

  async sync() {
    const resources = await window.electron.indexes.getAll(this.indexName);

    await Promise.allSettled(
      resources.map((resource: Resource) => this.add(resource)),
    );
  }
}
