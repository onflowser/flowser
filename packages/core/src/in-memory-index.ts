import {
  IndexableResource,
  IResourceIndex,
  OmitTimestamps,
  RequireOnly,
} from "@onflowser/api";

export class InMemoryIndex<Resource extends IndexableResource>
  implements IResourceIndex<Resource>
{
  protected lookup: Map<string, Resource>;

  constructor() {
    this.lookup = new Map();
  }

  async create(resource: OmitTimestamps<Resource>): Promise<void> {
    if (this.lookup.has(resource.id)) {
      throw new Error("Resource already exists");
    } else {
      // @ts-ignore Not entirely sure what this type error is about.
      this.lookup.set(resource.id, {
        ...resource,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }

  async upsert(resource: OmitTimestamps<Resource>): Promise<void> {
    if (this.lookup.has(resource.id)) {
      await this.update(resource);
    } else {
      await this.create(resource);
    }
  }

  async delete(
    resource: OmitTimestamps<RequireOnly<Resource, "id">>,
  ): Promise<void> {
    if (!this.lookup.has(resource.id)) {
      throw new Error("Resource not found");
    }
    this.lookup.delete(resource.id);
  }

  async update(
    resource: OmitTimestamps<RequireOnly<Resource, "id">>,
  ): Promise<void> {
    const existingResource = this.lookup.get(resource.id);
    if (!existingResource) {
      throw new Error("Resource not found");
    }
    this.lookup.set(resource.id, {
      ...existingResource,
      ...resource,
      updatedAt: new Date(),
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
