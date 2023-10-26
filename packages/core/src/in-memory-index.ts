import {
  IdentifiableResource,
  IResourceIndex,
  RequireOnly
} from "@onflowser/api";

export class InMemoryIndex<Resource extends IdentifiableResource>
  implements IResourceIndex<Resource>
{
  private readonly lookup: Map<string, Resource>;

  constructor() {
    this.lookup = new Map();
  }

  async create(resource: Resource): Promise<void> {
    if (this.lookup.has(resource.id)) {
      throw new Error("Resource already exists");
    } else {
      this.lookup.set(resource.id, resource);
    }
  }

  async upsert(resource: Resource): Promise<void> {
    if (this.lookup.has(resource.id)) {
      await this.update(resource);
    } else {
      await this.create(resource);
    }
  }

  async delete(resource: RequireOnly<Resource, "id">): Promise<void> {
    if (!this.lookup.has(resource.id)) {
      throw new Error("Resource not found");
    }
    this.lookup.delete(resource.id);
  }

  async update(resource: RequireOnly<Resource, "id">): Promise<void> {
    const existingResource = this.lookup.get(resource.id);
    if (!existingResource) {
      throw new Error("Resource not found");
    }
    this.lookup.set(resource.id, {
      ...existingResource,
      ...resource,
    });
  }

  async findAll(): Promise<Resource[]> {
    return Array.from(this.lookup.values());
  }

  async findOneById(id: string): Promise<Resource | undefined> {
    return this.lookup.get(id);
  }

  async clear(): Promise<void> {
    this.lookup.clear();
  }
}
