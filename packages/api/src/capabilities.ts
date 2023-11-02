import { IdentifiableResource, TimestampedResource } from "./resources";

export type RequireOnly<Resource, Key extends keyof Resource> = Pick<
  Resource,
  Key
> &
  Partial<Omit<Resource, Key>>;

export type IndexableResource = IdentifiableResource & TimestampedResource;

export interface IResourceIndexReader<Resource extends TimestampedResource> {
  findOneById(id: string): Promise<Resource | undefined>;
  findAll(): Promise<Resource[]>;
  // TODO(global-search): Add searching capabilities
  // search(): Promise<Resource[]>;
}

// Index is responsible for managing lifecycle timestamps,
// so consumers shouldn't be passing in timestamps themselves.
export type OmitTimestamps<Resource> = Omit<
  Resource,
  keyof TimestampedResource
>;

export interface IResourceIndexWriter<Resource extends IndexableResource> {
  create(resource: OmitTimestamps<Resource>): Promise<void>;
  upsert(resource: OmitTimestamps<Resource>): Promise<void>;
  update(resource: OmitTimestamps<RequireOnly<Resource, "id">>): Promise<void>;
  delete(resource: OmitTimestamps<RequireOnly<Resource, "id">>): Promise<void>;
  clear(): Promise<void>;
}

export interface IResourceIndex<Resource extends IndexableResource>
  extends IResourceIndexReader<Resource>,
    IResourceIndexWriter<Resource> {}
