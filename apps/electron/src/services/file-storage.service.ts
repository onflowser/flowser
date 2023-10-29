import { PersistentStorage } from '@onflowser/core/src/persistent-storage';
import fs from 'fs/promises';
import path from 'path';
import { app } from 'electron';

export class FileStorageService implements PersistentStorage {
  private fileName: string | undefined;

  constructor(fileName?: string) {
    this.fileName = fileName;
  }

  setFileName(fileName: string) {
    this.fileName = fileName;
  }

  async read(): Promise<string | undefined> {
    try {
      return await fs.readFile(this.getStorageFilePath(), {
        encoding: 'utf-8',
      });
    } catch (error) {
      // Assume file not found error
      return undefined;
    }
  }

  async write(data: string): Promise<void> {
    await fs.writeFile(this.getStorageFilePath(), data);
  }

  private getStorageFilePath() {
    if (this.fileName === undefined) {
      throw new Error('File name is not set');
    }
    return path.join(app.getPath('userData'), `${this.fileName}`);
  }
}
