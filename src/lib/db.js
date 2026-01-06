/**
 * IndexedDB wrapper for Letter River
 * Provides versioned storage with automatic migrations
 */

import { openDB } from 'idb';

const DB_NAME = 'HebrewLetterRiver';
const DB_VERSION = 2;

// Store names
export const STORES = {
  PROGRESS: 'progress',
  BADGES: 'badges',
  DAILY_QUESTS: 'dailyQuests',
  STREAKS: 'streaks',
  GAME_SETTINGS: 'gameSettings',
  PREFERENCES: 'preferences',
  OFFLINE_QUEUE: 'offlineQueue',
  SRS_PROGRESS: 'srsProgress'
};

/**
 * Initialize the database with proper schema
 */
export async function initDB() {
  try {
    const db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion, transaction) {
        console.log(`[DB] Upgrading from version ${oldVersion} to ${newVersion}`);

        // Version 1: Initial schema
        if (oldVersion < 1) {
          // Progress store: keyed by languageId
          if (!db.objectStoreNames.contains(STORES.PROGRESS)) {
            const progressStore = db.createObjectStore(STORES.PROGRESS, { keyPath: 'languageId' });
            progressStore.createIndex('lastUpdated', 'lastUpdated', { unique: false });
          }

          // Badges store: keyed by languageId
          if (!db.objectStoreNames.contains(STORES.BADGES)) {
            const badgesStore = db.createObjectStore(STORES.BADGES, { keyPath: 'languageId' });
            badgesStore.createIndex('lastUpdated', 'lastUpdated', { unique: false });
          }

          // Daily quests store: keyed by languageId
          if (!db.objectStoreNames.contains(STORES.DAILY_QUESTS)) {
            const dailyStore = db.createObjectStore(STORES.DAILY_QUESTS, { keyPath: 'languageId' });
            dailyStore.createIndex('dateKey', 'dateKey', { unique: false });
          }

          // Streaks store: keyed by languageId
          if (!db.objectStoreNames.contains(STORES.STREAKS)) {
            const streaksStore = db.createObjectStore(STORES.STREAKS, { keyPath: 'languageId' });
            streaksStore.createIndex('lastUpdated', 'lastUpdated', { unique: false });
          }

          // Game settings store: single object with 'default' key
          if (!db.objectStoreNames.contains(STORES.GAME_SETTINGS)) {
            db.createObjectStore(STORES.GAME_SETTINGS);
          }

          // Preferences store: single object with 'default' key
          if (!db.objectStoreNames.contains(STORES.PREFERENCES)) {
            db.createObjectStore(STORES.PREFERENCES);
          }

          // Offline queue: auto-incrementing id
          if (!db.objectStoreNames.contains(STORES.OFFLINE_QUEUE)) {
            const queueStore = db.createObjectStore(STORES.OFFLINE_QUEUE, {
              keyPath: 'id',
              autoIncrement: true
            });
            queueStore.createIndex('timestamp', 'timestamp', { unique: false });
            queueStore.createIndex('processed', 'processed', { unique: false });
          }
        }

        // Version 2: Add SRS (Spaced Repetition System) support
        if (oldVersion < 2) {
          // SRS Progress store: keyed by languageId
          if (!db.objectStoreNames.contains(STORES.SRS_PROGRESS)) {
            const srsStore = db.createObjectStore(STORES.SRS_PROGRESS, { keyPath: 'languageId' });
            srsStore.createIndex('lastUpdated', 'lastUpdated', { unique: false });
            srsStore.createIndex('lastReviewDate', 'lastReviewDate', { unique: false });
          }
        }
      }
    });

    return db;
  } catch (error) {
    console.error('[DB] Failed to initialize database:', error);
    throw error;
  }
}

// Singleton database instance
let dbInstance = null;

/**
 * Get or create the database instance
 */
export async function getDB() {
  if (!dbInstance) {
    dbInstance = await initDB();
  }
  return dbInstance;
}

/**
 * Generic get operation
 */
export async function dbGet(storeName, key) {
  try {
    const db = await getDB();
    return await db.get(storeName, key);
  } catch (error) {
    console.error(`[DB] Error getting ${key} from ${storeName}:`, error);
    return null;
  }
}

/**
 * Generic put operation (upsert)
 */
export async function dbPut(storeName, value) {
  try {
    const db = await getDB();
    await db.put(storeName, value);
    return true;
  } catch (error) {
    console.error(`[DB] Error putting to ${storeName}:`, error);
    return false;
  }
}

/**
 * Generic delete operation
 */
export async function dbDelete(storeName, key) {
  try {
    const db = await getDB();
    await db.delete(storeName, key);
    return true;
  } catch (error) {
    console.error(`[DB] Error deleting ${key} from ${storeName}:`, error);
    return false;
  }
}

/**
 * Get all items from a store
 */
export async function dbGetAll(storeName) {
  try {
    const db = await getDB();
    return await db.getAll(storeName);
  } catch (error) {
    console.error(`[DB] Error getting all from ${storeName}:`, error);
    return [];
  }
}

/**
 * Clear all data from a store
 */
export async function dbClear(storeName) {
  try {
    const db = await getDB();
    await db.clear(storeName);
    return true;
  } catch (error) {
    console.error(`[DB] Error clearing ${storeName}:`, error);
    return false;
  }
}

/**
 * Progress-specific operations
 */
export const Progress = {
  async get(languageId) {
    const data = await dbGet(STORES.PROGRESS, languageId);
    return data || null;
  },

  async save(languageId, progressData) {
    const data = {
      languageId,
      ...progressData,
      lastUpdated: Date.now()
    };
    return await dbPut(STORES.PROGRESS, data);
  },

  async getAll() {
    return await dbGetAll(STORES.PROGRESS);
  }
};

/**
 * Badges-specific operations
 */
export const Badges = {
  async get(languageId) {
    const data = await dbGet(STORES.BADGES, languageId);
    return data || null;
  },

  async save(languageId, badgesData) {
    const data = {
      languageId,
      ...badgesData,
      lastUpdated: Date.now()
    };
    return await dbPut(STORES.BADGES, data);
  }
};

/**
 * Daily quests-specific operations
 */
export const DailyQuests = {
  async get(languageId) {
    const data = await dbGet(STORES.DAILY_QUESTS, languageId);
    return data || null;
  },

  async save(languageId, dailyData) {
    const data = {
      languageId,
      ...dailyData,
      lastUpdated: Date.now()
    };
    return await dbPut(STORES.DAILY_QUESTS, data);
  }
};

/**
 * Streaks-specific operations
 */
export const Streaks = {
  async get(languageId) {
    const data = await dbGet(STORES.STREAKS, languageId);
    return data || null;
  },

  async save(languageId, streakData) {
    const data = {
      languageId,
      ...streakData,
      lastUpdated: Date.now()
    };
    return await dbPut(STORES.STREAKS, data);
  }
};

/**
 * Game settings operations
 */
export const GameSettings = {
  async get() {
    return await dbGet(STORES.GAME_SETTINGS, 'default');
  },

  async save(settings) {
    return await dbPut(STORES.GAME_SETTINGS, { key: 'default', ...settings });
  }
};

/**
 * Preferences operations
 */
export const Preferences = {
  async get() {
    return await dbGet(STORES.PREFERENCES, 'default');
  },

  async save(preferences) {
    return await dbPut(STORES.PREFERENCES, { key: 'default', ...preferences });
  }
};

/**
 * SRS Progress operations
 */
export const SRSProgress = {
  async get(languageId) {
    const data = await dbGet(STORES.SRS_PROGRESS, languageId);
    return data || null;
  },

  async save(languageId, srsData) {
    const data = {
      languageId,
      ...srsData,
      lastUpdated: Date.now()
    };
    return await dbPut(STORES.SRS_PROGRESS, data);
  },

  async getAll() {
    return await dbGetAll(STORES.SRS_PROGRESS);
  },

  /**
   * Update a single item within the SRS progress
   * @param {string} languageId - Language identifier
   * @param {'letters' | 'vocabulary' | 'grammar'} itemType - Type of item
   * @param {string} itemId - Item identifier
   * @param {Object} itemData - SRS item data
   */
  async updateItem(languageId, itemType, itemId, itemData) {
    const progress = await this.get(languageId) || {
      letters: {},
      vocabulary: {},
      grammar: {},
      settings: {},
      statistics: {},
      lastReviewDate: 0
    };

    // Update the specific item
    if (!progress[itemType]) {
      progress[itemType] = {};
    }
    progress[itemType][itemId] = itemData;

    // Update lastReviewDate if this was a review
    if (itemData.lastReviewDate > progress.lastReviewDate) {
      progress.lastReviewDate = itemData.lastReviewDate;
    }

    return await this.save(languageId, progress);
  },

  /**
   * Get items due for review
   * @param {string} languageId - Language identifier
   * @param {number} limit - Maximum items to return
   */
  async getDueItems(languageId, limit = 20) {
    const progress = await this.get(languageId);
    if (!progress) return [];

    const now = Date.now();
    const allItems = [
      ...Object.values(progress.letters || {}),
      ...Object.values(progress.vocabulary || {}),
      ...Object.values(progress.grammar || {})
    ];

    return allItems
      .filter(item => item.dueDate <= now)
      .sort((a, b) => a.dueDate - b.dueDate)
      .slice(0, limit);
  }
};

/**
 * Export all data (for backup)
 */
export async function exportAllData() {
  try {
    const db = await getDB();
    const data = {};

    for (const storeName of Object.values(STORES)) {
      if (storeName !== STORES.OFFLINE_QUEUE) {
        data[storeName] = await db.getAll(storeName);
      }
    }

    return {
      version: DB_VERSION,
      timestamp: Date.now(),
      data
    };
  } catch (error) {
    console.error('[DB] Error exporting data:', error);
    throw error;
  }
}

/**
 * Import data (for restore)
 */
export async function importAllData(exportedData) {
  try {
    const db = await getDB();

    // Clear existing data
    for (const storeName of Object.values(STORES)) {
      if (storeName !== STORES.OFFLINE_QUEUE) {
        await db.clear(storeName);
      }
    }

    // Import new data
    for (const [storeName, items] of Object.entries(exportedData.data)) {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);

      for (const item of items) {
        await store.put(item);
      }

      await tx.done;
    }

    return true;
  } catch (error) {
    console.error('[DB] Error importing data:', error);
    throw error;
  }
}

/**
 * Clear all data (useful for testing/reset)
 */
export async function clearAllData() {
  try {
    const db = await getDB();

    for (const storeName of Object.values(STORES)) {
      await db.clear(storeName);
    }

    return true;
  } catch (error) {
    console.error('[DB] Error clearing all data:', error);
    return false;
  }
}
