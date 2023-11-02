export interface PersistentStorage {
  // Returns `undefined` if storage is empty.
  read(): Promise<string | undefined>;
  write(data: string): Promise<void>;
}
