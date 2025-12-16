/**
 * Storage Migration System
 * Handles migrating data from localStorage to IndexedDB
 * and managing version upgrades
 */

import { getDB, Progress, Badges, DailyQuests, Streaks, GameSettings, Preferences } from './db';
import { storage } from './storage';

const MIGRATION_VERSION_KEY = 'hlr.migration.version';
const CURRENT_MIGRATION_VERSION = 1;

/**
 * Check if migration is needed
 */
export function needsMigration() {
  const currentVersion = parseInt(localStorage.getItem(MIGRATION_VERSION_KEY) || '0', 10);
  return currentVersion < CURRENT_MIGRATION_VERSION;
}

/**
 * Get migration status
 */
export function getMigrationVersion() {
  return parseInt(localStorage.getItem(MIGRATION_VERSION_KEY) || '0', 10);
}

/**
 * Set migration version
 */
function setMigrationVersion(version) {
  localStorage.setItem(MIGRATION_VERSION_KEY, version.toString());
}

/**
 * Migrate data from localStorage to IndexedDB
 */
export async function migrateToIndexedDB() {
  console.log('[Migration] Starting migration to IndexedDB...');

  try {
    // Ensure DB is initialized
    await getDB();

    // Migrate progress data for all languages
    await migrateProgressData();

    // Migrate badges data
    await migrateBadgesData();

    // Migrate daily quests data
    await migrateDailyQuestsData();

    // Migrate streaks data
    await migrateStreaksData();

    // Migrate game settings
    await migrateGameSettings();

    // Migrate preferences
    await migratePreferences();

    // Mark migration as complete
    setMigrationVersion(CURRENT_MIGRATION_VERSION);

    console.log('[Migration] Migration completed successfully');
    return { success: true };
  } catch (error) {
    console.error('[Migration] Migration failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Migrate progress data
 */
async function migrateProgressData() {
  console.log('[Migration] Migrating progress data...');

  const languages = ['he', 'en', 'zh', 'hi', 'es', 'fr', 'ar', 'bn', 'pt', 'ru', 'ja', 'am'];

  for (const languageId of languages) {
    const playerKey = `hlr.progress.${languageId}.player`;
    const playerData = storage.get(playerKey);

    if (playerData) {
      await Progress.save(languageId, playerData);
      console.log(`[Migration] Migrated progress for language: ${languageId}`);
    }
  }
}

/**
 * Migrate badges data
 */
async function migrateBadgesData() {
  console.log('[Migration] Migrating badges data...');

  const languages = ['he', 'en', 'zh', 'hi', 'es', 'fr', 'ar', 'bn', 'pt', 'ru', 'ja', 'am'];

  for (const languageId of languages) {
    const badgesKey = `hlr.progress.${languageId}.badges`;
    const badgesData = storage.get(badgesKey);

    if (badgesData) {
      await Badges.save(languageId, badgesData);
      console.log(`[Migration] Migrated badges for language: ${languageId}`);
    }

    const activeBadgesKey = `hlr.progress.${languageId}.activeBadges`;
    const activeBadges = storage.get(activeBadgesKey);

    if (activeBadges) {
      await Badges.save(languageId, {
        ...(await Badges.get(languageId)),
        activeBadges
      });
    }
  }
}

/**
 * Migrate daily quests data
 */
async function migrateDailyQuestsData() {
  console.log('[Migration] Migrating daily quests data...');

  const languages = ['he', 'en', 'zh', 'hi', 'es', 'fr', 'ar', 'bn', 'pt', 'ru', 'ja', 'am'];

  for (const languageId of languages) {
    const dailyKey = `hlr.progress.${languageId}.daily`;
    const dailyData = storage.get(dailyKey);

    if (dailyData) {
      await DailyQuests.save(languageId, dailyData);
      console.log(`[Migration] Migrated daily quests for language: ${languageId}`);
    }
  }
}

/**
 * Migrate streaks data
 */
async function migrateStreaksData() {
  console.log('[Migration] Migrating streaks data...');

  const languages = ['he', 'en', 'zh', 'hi', 'es', 'fr', 'ar', 'bn', 'pt', 'ru', 'ja', 'am'];

  for (const languageId of languages) {
    const streakKey = `hlr.progress.${languageId}.streak`;
    const streakData = storage.get(streakKey);

    if (streakData) {
      await Streaks.save(languageId, streakData);
      console.log(`[Migration] Migrated streak for language: ${languageId}`);
    }
  }
}

/**
 * Migrate game settings
 */
async function migrateGameSettings() {
  console.log('[Migration] Migrating game settings...');

  const settingsData = storage.get('gameSettings');

  if (settingsData) {
    await GameSettings.save(settingsData);
    console.log('[Migration] Migrated game settings');
  }
}

/**
 * Migrate preferences
 */
async function migratePreferences() {
  console.log('[Migration] Migrating preferences...');

  const practiceLanguage = storage.get('hlr.preferences.practiceLanguage');
  const appLanguage = storage.get('hlr.preferences.appLanguage');

  if (practiceLanguage || appLanguage) {
    await Preferences.save({
      practiceLanguage,
      appLanguage
    });
    console.log('[Migration] Migrated preferences');
  }
}

/**
 * Create a backup of localStorage before migration
 */
export function createLocalStorageBackup() {
  const backup = {};
  const keys = Object.keys(localStorage);

  for (const key of keys) {
    if (key.startsWith('hlr.') || key === 'gameSettings') {
      try {
        backup[key] = localStorage.getItem(key);
      } catch (error) {
        console.warn(`[Migration] Could not backup key: ${key}`, error);
      }
    }
  }

  const backupString = JSON.stringify(backup);
  const blob = new Blob([backupString], { type: 'application/json' });

  return {
    blob,
    backup,
    timestamp: Date.now()
  };
}

/**
 * Download localStorage backup as file
 */
export function downloadBackup() {
  const { blob, timestamp } = createLocalStorageBackup();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = `letter-river-backup-${timestamp}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Restore from backup file
 */
export async function restoreFromBackup(file) {
  try {
    const text = await file.text();
    const backup = JSON.parse(text);

    // Restore to localStorage
    for (const [key, value] of Object.entries(backup)) {
      localStorage.setItem(key, value);
    }

    // Re-run migration to IndexedDB
    await migrateToIndexedDB();

    return { success: true };
  } catch (error) {
    console.error('[Migration] Restore failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Check storage usage
 */
export async function getStorageUsage() {
  if (!navigator.storage || !navigator.storage.estimate) {
    return null;
  }

  try {
    const estimate = await navigator.storage.estimate();
    return {
      usage: estimate.usage,
      quota: estimate.quota,
      percentUsed: ((estimate.usage / estimate.quota) * 100).toFixed(2)
    };
  } catch (error) {
    console.error('[Migration] Could not estimate storage:', error);
    return null;
  }
}

/**
 * Request persistent storage
 */
export async function requestPersistentStorage() {
  if (!navigator.storage || !navigator.storage.persist) {
    return false;
  }

  try {
    const isPersisted = await navigator.storage.persist();
    console.log(`[Migration] Persistent storage ${isPersisted ? 'granted' : 'denied'}`);
    return isPersisted;
  } catch (error) {
    console.error('[Migration] Could not request persistent storage:', error);
    return false;
  }
}

/**
 * Check if storage is already persistent
 */
export async function isStoragePersisted() {
  if (!navigator.storage || !navigator.storage.persisted) {
    return false;
  }

  try {
    return await navigator.storage.persisted();
  } catch (error) {
    console.error('[Migration] Could not check persistence:', error);
    return false;
  }
}
