/**
 * Enhanced Storage Layer V2
 * Provides unified interface for localStorage and IndexedDB
 * with automatic fallback and migration support
 */

import { GameSettings, Preferences } from './db';
import { storage as legacyStorage } from './storage';

/**
 * Enhanced storage wrapper with IndexedDB support
 */
class StorageV2 {
  constructor() {
    this.useIndexedDB = true;
    this.initPromise = this.checkIndexedDBSupport();
  }

  /**
   * Check if IndexedDB is supported and available
   */
  async checkIndexedDBSupport() {
    try {
      if (!window.indexedDB) {
        console.warn('[StorageV2] IndexedDB not supported, falling back to localStorage');
        this.useIndexedDB = false;
        return false;
      }

      // Test if we can actually use IndexedDB
      const testDB = await window.indexedDB.open('test', 1);
      testDB.close();
      return true;
    } catch (error) {
      console.warn('[StorageV2] IndexedDB not available, falling back to localStorage:', error);
      this.useIndexedDB = false;
      return false;
    }
  }

  /**
   * Ensure initialization is complete
   */
  async ensureReady() {
    await this.initPromise;
  }

  /**
   * Get game settings
   */
  async getGameSettings() {
    await this.ensureReady();

    if (this.useIndexedDB) {
      try {
        const settings = await GameSettings.get();
        if (settings) {
          // Remove the 'key' property used by IndexedDB
          const { key, ...actualSettings } = settings;
          return actualSettings;
        }
      } catch (error) {
        console.error('[StorageV2] Error getting game settings from IndexedDB:', error);
      }
    }

    // Fallback to localStorage
    return legacyStorage.get('gameSettings') || null;
  }

  /**
   * Save game settings
   */
  async saveGameSettings(settings) {
    await this.ensureReady();

    // Save to both for redundancy during migration
    legacyStorage.set('gameSettings', settings);

    if (this.useIndexedDB) {
      try {
        await GameSettings.save(settings);
        return true;
      } catch (error) {
        console.error('[StorageV2] Error saving game settings to IndexedDB:', error);
        return false;
      }
    }

    return true;
  }

  /**
   * Get preferences
   */
  async getPreferences() {
    await this.ensureReady();

    if (this.useIndexedDB) {
      try {
        const prefs = await Preferences.get();
        if (prefs) {
          const { key, ...actualPrefs } = prefs;
          return actualPrefs;
        }
      } catch (error) {
        console.error('[StorageV2] Error getting preferences from IndexedDB:', error);
      }
    }

    // Fallback to localStorage
    const practiceLanguage = legacyStorage.get('hlr.preferences.practiceLanguage');
    const appLanguage = legacyStorage.get('hlr.preferences.appLanguage');

    if (practiceLanguage || appLanguage) {
      return { practiceLanguage, appLanguage };
    }

    return null;
  }

  /**
   * Save preferences
   */
  async savePreferences(preferences) {
    await this.ensureReady();

    // Save to localStorage for backward compatibility
    if (preferences.practiceLanguage) {
      legacyStorage.set('hlr.preferences.practiceLanguage', preferences.practiceLanguage);
    }
    if (preferences.appLanguage) {
      legacyStorage.set('hlr.preferences.appLanguage', preferences.appLanguage);
    }

    // Save to IndexedDB
    if (this.useIndexedDB) {
      try {
        await Preferences.save(preferences);
        return true;
      } catch (error) {
        console.error('[StorageV2] Error saving preferences to IndexedDB:', error);
        return false;
      }
    }

    return true;
  }

  /**
   * Generic get with automatic source selection
   */
  get(key) {
    return legacyStorage.get(key);
  }

  /**
   * Generic set with automatic source selection
   */
  set(key, value) {
    return legacyStorage.set(key, value);
  }

  /**
   * Remove item
   */
  remove(key) {
    return legacyStorage.remove(key);
  }

  /**
   * Clear all storage
   */
  async clearAll() {
    await this.ensureReady();

    // Clear localStorage
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (key.startsWith('hlr.') || key === 'gameSettings') {
        localStorage.removeItem(key);
      }
    }

    // Clear IndexedDB
    if (this.useIndexedDB) {
      try {
        const { clearAllData } = await import('./db');
        await clearAllData();
      } catch (error) {
        console.error('[StorageV2] Error clearing IndexedDB:', error);
      }
    }

    return true;
  }
}

// Singleton instance
export const storageV2 = new StorageV2();
