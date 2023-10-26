import { IdentifiableResource } from "./resources";

export type RequireOnly<Resource, Key extends keyof Resource> = Pick<
  Resource,
  Key
> &
  Partial<Omit<Resource, Key>>;

export interface IResourceIndexReader<Resource> {
  findOneById(id: string): Promise<Resource | undefined>;
  findAll(): Promise<Resource[]>;
  // TODO(restructure): Add searching capabilities
  // search(): Promise<Resource[]>;
}

export interface IResourceIndexWriter<Resource extends IdentifiableResource> {
  create(resource: Resource): Promise<void>;
  upsert(resource: Resource): Promise<void>;
  update(resource: RequireOnly<Resource, "id">): Promise<void>;
  delete(resource: RequireOnly<Resource, "id">): Promise<void>;
  clear(): Promise<void>;
}

export interface IResourceIndex<Resource extends IdentifiableResource>
  extends IResourceIndexReader<Resource>,
    IResourceIndexWriter<Resource> {}
