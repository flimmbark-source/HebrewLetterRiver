import { useEffect, useState } from 'react';
import { needsMigration, migrateToIndexedDB, getMigrationVersion } from '../lib/storageMigration';
import { getOnlineStatusManager } from '../lib/offlineQueue';

/**
 * Migration Initializer Component
 * Handles automatic migration from localStorage to IndexedDB
 */
export default function MigrationInitializer({ children }) {
  const [migrationComplete, setMigrationComplete] = useState(true);
  const [migrationError, setMigrationError] = useState(null);

  useEffect(() => {
    async function runMigration() {
      setMigrationComplete(false);

      let shouldMigrate = false;

      try {
        shouldMigrate = needsMigration();
      } catch (error) {
        console.warn('[Migration] Failed to check migration status, continuing without migration:', error);
        setMigrationError(error.message);
        setMigrationComplete(true);
        return;
      }

      if (!shouldMigrate) {
        console.log('[Migration] No migration needed, current version:', getMigrationVersion());
        setMigrationComplete(true);
        return;
      }

      console.log('[Migration] Starting migration...');
      try {
        const result = await migrateToIndexedDB();

        if (result.success) {
          console.log('[Migration] Migration completed successfully');
          setMigrationComplete(true);
        } else {
          console.error('[Migration] Migration failed:', result.error);
          setMigrationError(result.error);
          // Continue anyway - app can still work with localStorage
          setMigrationComplete(true);
        }
      } catch (error) {
        console.error('[Migration] Migration error:', error);
        setMigrationError(error.message);
        // Continue anyway
        setMigrationComplete(true);
      }
    }

    // Initialize online status manager
    getOnlineStatusManager();

    runMigration();
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

  return children;
}
