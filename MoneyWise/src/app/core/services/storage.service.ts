import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private _storage: Storage | null = null;

  constructor(private storage: Storage) {}

  async init(): Promise<void> {
    this._storage = await this.storage.create();
  }

  async get(key: string): Promise<any> {
    return this._storage?.get(key);
  }

  async set(key: string, value: any): Promise<any> {
    return this._storage?.set(key, value);
  }

  async remove(key: string): Promise<any> {
    return this._storage?.remove(key);
  }

  async clear(): Promise<void> {
    await this._storage?.clear();
  }
}

