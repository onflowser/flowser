export interface IResourceIndexReader<Resource> {
  fetchAll(): Promise<Resource[]>;
  search(): Promise<Resource[]>;
}

export interface IResourceIndexWriter<Resource> {
  add(resource: Resource): Promise<void>;
  update(resource: Resource): Promise<void>;
  delete(resource: Resource): Promise<void>;
}

// TODO: Consider defining resource-specific interfaces for fetchers
export interface IResourceFetcher<Resource> {
  fetchById(id: string): Promise<Resource>;
}
