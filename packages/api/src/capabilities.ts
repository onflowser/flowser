import { IdentifiableResource } from "./resources";

export type RequireOnly<Resource, Key extends keyof Resource> = Pick<
  Resource,
  Key
> &
  Partial<Resource>;

export interface IResourceIndexReader<Resource> {
  findOneById(id: string): Promise<Resource | undefined>;
  findAll(): Promise<Resource[]>;
  // TODO(restructure): Add searching capabilities
  // search(): Promise<Resource[]>;
}

export interface IResourceIndexWriter<Resource extends IdentifiableResource> {
  add(resource: Resource): Promise<void>;
  update(resource: RequireOnly<Resource, "id">): Promise<void>;
  delete(resource: RequireOnly<Resource, "id">): Promise<void>;
}

export interface IResourceIndex<Resource extends IdentifiableResource>
  extends IResourceIndexReader<Resource>,
    IResourceIndexWriter<Resource> {}

// TODO(restructure): Consider defining resource-specific interfaces for fetchers
export interface IResourceFetcher<Resource> {
  fetchById(id: string): Promise<Resource>;
}
