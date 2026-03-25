const STORAGE_STARTUP_FLAG_KEY = '__hlrStartupFlags';

function getGlobalObject() {
  if (typeof window !== 'undefined') {
    return window;
  }

  if (typeof globalThis !== 'undefined') {
    return globalThis;
  }

  return null;
}

function ensureStartupFlags() {
  const globalObj = getGlobalObject();
  if (!globalObj) {
    return {};
  }

  if (!globalObj[STORAGE_STARTUP_FLAG_KEY]) {
    globalObj[STORAGE_STARTUP_FLAG_KEY] = {};
  }

  return globalObj[STORAGE_STARTUP_FLAG_KEY];
}

export function setStartupFlag(flagKey, value) {
  const flags = ensureStartupFlags();
  flags[flagKey] = value;
}

function probeLocalStorage() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return {
        available: false,
        reason: 'localStorage is not available in this runtime.'
      };
    }

    const probeKey = '__hlr.localstorage.probe__';
    window.localStorage.setItem(probeKey, '1');
    window.localStorage.removeItem(probeKey);

    return { available: true, reason: null };
  } catch (error) {
    return {
      available: false,
      reason: `localStorage probe failed: ${error?.message || 'unknown error'}`
    };
  }
}

function probeIndexedDB() {
  return new Promise((resolve) => {
    try {
      if (typeof window === 'undefined' || !window.indexedDB) {
        resolve({
          available: false,
          reason: 'IndexedDB is not available in this runtime.'
        });
        return;
      }

      const dbName = '__hlr.idb.probe__';
      const request = window.indexedDB.open(dbName, 1);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('probe')) {
          db.createObjectStore('probe');
        }
      };

      request.onsuccess = () => {
        const db = request.result;
        db.close();
        window.indexedDB.deleteDatabase(dbName);
        resolve({ available: true, reason: null });
      };

      request.onerror = () => {
        resolve({
          available: false,
          reason: `IndexedDB open failed: ${request.error?.message || 'unknown error'}`
        });
      };
    } catch (error) {
      resolve({
        available: false,
        reason: `IndexedDB probe failed: ${error?.message || 'unknown error'}`
      });
    }
  });
}

export async function probeStorageCapability() {
  const localStorageResult = probeLocalStorage();
  const indexedDBResult = await probeIndexedDB();
  const isMigrationSafe = localStorageResult.available && indexedDBResult.available;

  const warnings = [];
  if (!localStorageResult.available) {
    warnings.push(localStorageResult.reason);
  }
  if (!indexedDBResult.available) {
    warnings.push(indexedDBResult.reason);
  }

  return {
    localStorageAvailable: localStorageResult.available,
    indexedDBAvailable: indexedDBResult.available,
    isMigrationSafe,
    warnings
  };
}
