import { IdentifiableResource } from "./resources";

export interface IResourceIndexReader<Resource> {
  fetchAll(): Promise<Resource[]>;
  // TODO(restructure): Add searching capabilities
  // search(): Promise<Resource[]>;
}

export interface IResourceIndexWriter<Resource> {
  add(resource: Resource): Promise<void>;
  update(resource: Resource): Promise<void>;
  delete(resource: Resource): Promise<void>;
}

// TODO(restructure): Consider defining resource-specific interfaces for fetchers
export interface IResourceFetcher<Resource> {
  fetchById(id: string): Promise<Resource>;
}
