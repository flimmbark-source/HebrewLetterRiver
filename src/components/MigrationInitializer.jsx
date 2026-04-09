import { useEffect, useState } from 'react';
import { needsMigration, migrateToIndexedDB, getMigrationVersion } from '../lib/storageMigration';
import { getOnlineStatusManager } from '../lib/offlineQueue';
import { probeStorageCapability, setStartupFlag } from '../lib/storageCapability';

/**
 * Migration Initializer Component
 * Handles automatic migration from localStorage to IndexedDB
 */
export default function MigrationInitializer({ children }) {
  const [migrationComplete, setMigrationComplete] = useState(true);
  const [migrationError, setMigrationError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    let migrationGuardTimer;

    const finalizeMigration = (errorMessage = null) => {
      if (cancelled) return;
      if (migrationGuardTimer) {
        clearTimeout(migrationGuardTimer);
      }
      if (errorMessage) {
        setMigrationError(errorMessage);
      }
      setMigrationComplete(true);
    };

    async function runMigration() {
      if (!cancelled) {
        setMigrationComplete(false);
      }

      const capability = await probeStorageCapability();
      if (!capability.isMigrationSafe) {
        const warningMessage = `[Migration] Storage capability check failed (localStorage: ${capability.localStorageAvailable}, indexedDB: ${capability.indexedDBAvailable}). Migration skipped. ${capability.warnings.join(' | ')}`;
        console.warn(warningMessage);
        setStartupFlag('storageMigrationSkipped', true);
        setStartupFlag('storageCapability', capability);
        finalizeMigration('Storage migration was skipped because persistent browser storage is unavailable.');
        return;
      }

      let shouldMigrate = false;

      try {
        shouldMigrate = needsMigration();
      } catch (error) {
        console.warn('[Migration] Failed to check migration status, continuing without migration:', error);
        finalizeMigration(error.message);
        return;
      }

      if (!shouldMigrate) {
        console.log('[Migration] No migration needed, current version:', getMigrationVersion());
        finalizeMigration();
        return;
      }

      console.log('[Migration] Starting migration...');
      try {
        const result = await migrateToIndexedDB();

        if (result.success) {
          console.log('[Migration] Migration completed successfully');
          finalizeMigration();
        } else {
          console.error('[Migration] Migration failed:', result.error);
          // Continue anyway - app can still work with localStorage
          finalizeMigration(result.error);
        }
      } catch (error) {
        console.error('[Migration] Migration error:', error);
        // Continue anyway
        finalizeMigration(error.message);
      }
    }

    // Initialize online status manager
    getOnlineStatusManager();

    migrationGuardTimer = setTimeout(() => {
      if (cancelled) return;
      console.warn('[Migration] Migration initialization timed out. Continuing with app startup.');
      finalizeMigration('Storage initialization timed out. Continuing with limited persistence support.');
    }, 8000);

    runMigration();
    return () => {
      cancelled = true;
      clearTimeout(migrationGuardTimer);
    };
  }, []);

  if (!migrationComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin text-6xl mb-4">⚙️</div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Initializing...
          </h2>
          <p className="text-slate-300">
            Setting up your data storage
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {migrationError && (
        <div className="mx-4 mt-4 rounded-lg border border-amber-400/40 bg-amber-500/10 p-3 text-sm text-amber-100">
          <strong className="font-semibold">Storage warning:</strong> {migrationError}
        </div>
      )}
      {children}
    </>
  );
}
