
import { QCDataMap, QCConfigMap } from '../types';

const DB_NAME = 'LabGuardDB';
const STORE_NAME = 'QCData';
const CONFIG_STORE_NAME = 'QCConfig'; // New store for configs
const DATA_KEY = 'QCPointsMap'; // Key for the big map object
const CONFIG_KEY = 'QCConfigsMap';

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 2); // Version bumped
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
      if (!db.objectStoreNames.contains(CONFIG_STORE_NAME)) {
        db.createObjectStore(CONFIG_STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const saveAllQCData = async (dataMap: QCDataMap) => {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.objectStore(STORE_NAME).put(dataMap, DATA_KEY);
  });
};

export const loadAllQCData = async (): Promise<QCDataMap> => {
  const db = await openDB();
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).get(DATA_KEY);
    req.onsuccess = () => resolve(req.result || {});
    req.onerror = () => resolve({});
  });
};

export const saveAllConfigs = async (configMap: QCConfigMap) => {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(CONFIG_STORE_NAME, 'readwrite');
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.objectStore(CONFIG_STORE_NAME).put(configMap, CONFIG_KEY);
  });
};

export const loadAllConfigs = async (): Promise<QCConfigMap | null> => {
  const db = await openDB();
  return new Promise((resolve) => {
    const tx = db.transaction(CONFIG_STORE_NAME, 'readonly');
    const req = tx.objectStore(CONFIG_STORE_NAME).get(CONFIG_KEY);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => resolve(null);
  });
};
