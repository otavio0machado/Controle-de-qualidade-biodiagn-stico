
import { QCDataPoint, QCConfig } from '../types';

const DB_NAME = 'LabGuardQC_V2';
const DB_VERSION = 1;
const STORE_DATA = 'qc_values';
const STORE_CONFIG = 'qc_config';

interface QCValueRecord {
  id: string;
  date: string;
  value: number;
  comment?: string;
}

interface QCConfigRecord {
  id: string;
  mean: number;
  sd: number;
  unit: string;
}

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_DATA)) {
        const store = db.createObjectStore(STORE_DATA, { keyPath: 'id' });
        store.createIndex('date', 'date', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_CONFIG)) {
        db.createObjectStore(STORE_CONFIG, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const qcStorage = {
  // --- Data Operations ---
  async getAllValues(): Promise<QCValueRecord[]> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_DATA, 'readonly');
      const store = tx.objectStore(STORE_DATA);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async addValue(record: QCValueRecord): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_DATA, 'readwrite');
      const store = tx.objectStore(STORE_DATA);
      const request = store.put(record);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  async deleteValue(id: string): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_DATA, 'readwrite');
      const store = tx.objectStore(STORE_DATA);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },

  // --- Config Operations ---
  async getConfig(): Promise<QCConfigRecord | undefined> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_CONFIG, 'readonly');
      const store = tx.objectStore(STORE_CONFIG);
      const request = store.get('default_config');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async saveConfig(config: QCConfigRecord): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_CONFIG, 'readwrite');
      const store = tx.objectStore(STORE_CONFIG);
      // Force ID to ensure singleton config for this simple module
      const request = store.put({ ...config, id: 'default_config' });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
};
