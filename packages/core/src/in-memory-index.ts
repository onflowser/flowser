import {
  IdentifiableResource,
  IResourceIndexReader,
  IResourceIndexWriter,
} from "api";

export class InMemoryIndex<Resource extends IdentifiableResource>
  implements IResourceIndexReader<Resource>, IResourceIndexWriter<Resource>
{
  private readonly lookup: Map<string, Resource>;

  constructor() {
    this.lookup = new Map();
  }

  async add(resource: Resource): Promise<void> {
    if (this.lookup.has(resource.id)) {
      throw new Error("Resource already exists");
    } else {
      this.lookup.set(resource.id, resource);
    }
  }

  async delete(resource: Resource): Promise<void> {
    if (!this.lookup.has(resource.id)) {
      throw new Error("Resource not found");
    }
    this.lookup.delete(resource.id);
  }

  async update(resource: Resource): Promise<void> {
    if (!this.lookup.has(resource.id)) {
      throw new Error("Resource not found");
    }
    this.lookup.set(resource.id, resource);
  }

  async fetchAll(): Promise<Resource[]> {
    return Array.from(this.lookup.values());
  }
}
