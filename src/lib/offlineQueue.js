/**
 * Offline Queue System
 * Handles operations when offline and syncs when connection is restored
 */

import { getDB, STORES } from './db';

/**
 * Queue operation types
 */
export const OPERATION_TYPES = {
  PROGRESS_UPDATE: 'progress_update',
  BADGE_UPDATE: 'badge_update',
  DAILY_QUEST_UPDATE: 'daily_quest_update',
  STREAK_UPDATE: 'streak_update',
  SETTINGS_UPDATE: 'settings_update',
  PREFERENCES_UPDATE: 'preferences_update'
};

/**
 * Add operation to the queue
 */
export async function queueOperation(type, data) {
  try {
    const db = await getDB();
    const operation = {
      type,
      data,
      timestamp: Date.now(),
      processed: false,
      retries: 0
    };

    const id = await db.add(STORES.OFFLINE_QUEUE, operation);
    console.log(`[OfflineQueue] Queued operation ${type} with id ${id}`);
    return id;
  } catch (error) {
    console.error('[OfflineQueue] Failed to queue operation:', error);
    return null;
  }
}

/**
 * Get all unprocessed operations
 */
export async function getUnprocessedOperations() {
  try {
    const db = await getDB();
    const tx = db.transaction(STORES.OFFLINE_QUEUE, 'readonly');
    const index = tx.objectStore(STORES.OFFLINE_QUEUE).index('processed');
    const operations = await index.getAll(false);

    return operations.sort((a, b) => a.timestamp - b.timestamp);
  } catch (error) {
    console.error('[OfflineQueue] Failed to get unprocessed operations:', error);
    return [];
  }
}

/**
 * Mark operation as processed
 */
export async function markAsProcessed(operationId) {
  try {
    const db = await getDB();
    const operation = await db.get(STORES.OFFLINE_QUEUE, operationId);

    if (operation) {
      operation.processed = true;
      operation.processedAt = Date.now();
      await db.put(STORES.OFFLINE_QUEUE, operation);
      console.log(`[OfflineQueue] Marked operation ${operationId} as processed`);
      return true;
    }

    return false;
  } catch (error) {
    console.error('[OfflineQueue] Failed to mark operation as processed:', error);
    return false;
  }
}

/**
 * Increment retry count for an operation
 */
export async function incrementRetryCount(operationId) {
  try {
    const db = await getDB();
    const operation = await db.get(STORES.OFFLINE_QUEUE, operationId);

    if (operation) {
      operation.retries = (operation.retries || 0) + 1;
      operation.lastRetryAt = Date.now();
      await db.put(STORES.OFFLINE_QUEUE, operation);
      return operation.retries;
    }

    return 0;
  } catch (error) {
    console.error('[OfflineQueue] Failed to increment retry count:', error);
    return 0;
  }
}

/**
 * Remove operation from queue
 */
export async function removeOperation(operationId) {
  try {
    const db = await getDB();
    await db.delete(STORES.OFFLINE_QUEUE, operationId);
    console.log(`[OfflineQueue] Removed operation ${operationId}`);
    return true;
  } catch (error) {
    console.error('[OfflineQueue] Failed to remove operation:', error);
    return false;
  }
}

/**
 * Clear old processed operations (older than 7 days)
 */
export async function clearOldOperations() {
  try {
    const db = await getDB();
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const allOperations = await db.getAll(STORES.OFFLINE_QUEUE);

    let cleared = 0;
    for (const operation of allOperations) {
      if (operation.processed && operation.processedAt < sevenDaysAgo) {
        await db.delete(STORES.OFFLINE_QUEUE, operation.id);
        cleared++;
      }
    }

    if (cleared > 0) {
      console.log(`[OfflineQueue] Cleared ${cleared} old operations`);
    }

    return cleared;
  } catch (error) {
    console.error('[OfflineQueue] Failed to clear old operations:', error);
    return 0;
  }
}

/**
 * Get queue statistics
 */
export async function getQueueStats() {
  try {
    const db = await getDB();
    const allOperations = await db.getAll(STORES.OFFLINE_QUEUE);

    const stats = {
      total: allOperations.length,
      pending: 0,
      processed: 0,
      failed: 0
    };

    for (const operation of allOperations) {
      if (operation.processed) {
        stats.processed++;
      } else if (operation.retries >= 3) {
        stats.failed++;
      } else {
        stats.pending++;
      }
    }

    return stats;
  } catch (error) {
    console.error('[OfflineQueue] Failed to get queue stats:', error);
    return { total: 0, pending: 0, processed: 0, failed: 0 };
  }
}

/**
 * Online status manager
 */
class OnlineStatusManager {
  constructor() {
    this.isOnline = navigator.onLine;
    this.listeners = new Set();
    this.processingQueue = false;

    // Listen for online/offline events
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
  }

  handleOnline() {
    console.log('[OfflineQueue] Connection restored');
    this.isOnline = true;
    this.notifyListeners(true);
    this.processQueue();
  }

  handleOffline() {
    console.log('[OfflineQueue] Connection lost');
    this.isOnline = false;
    this.notifyListeners(false);
  }

  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners(isOnline) {
    this.listeners.forEach(callback => {
      try {
        callback(isOnline);
      } catch (error) {
        console.error('[OfflineQueue] Listener error:', error);
      }
    });
  }

  async processQueue() {
    if (this.processingQueue || !this.isOnline) {
      return;
    }

    this.processingQueue = true;
    console.log('[OfflineQueue] Processing queue...');

    try {
      const operations = await getUnprocessedOperations();
      console.log(`[OfflineQueue] Found ${operations.length} operations to process`);

      for (const operation of operations) {
        // Skip operations that have failed too many times
        if (operation.retries >= 3) {
          console.warn(`[OfflineQueue] Skipping operation ${operation.id} (too many retries)`);
          continue;
        }

        try {
          // Process the operation
          const success = await this.processOperation(operation);

          if (success) {
            await markAsProcessed(operation.id);
          } else {
            await incrementRetryCount(operation.id);
          }
        } catch (error) {
          console.error(`[OfflineQueue] Error processing operation ${operation.id}:`, error);
          await incrementRetryCount(operation.id);
        }
      }

      // Clear old processed operations
      await clearOldOperations();

      console.log('[OfflineQueue] Queue processing complete');
    } catch (error) {
      console.error('[OfflineQueue] Queue processing failed:', error);
    } finally {
      this.processingQueue = false;
    }
  }

  async processOperation(operation) {
    // In a real implementation, this would sync with a backend
    // For now, we just log the operation
    console.log('[OfflineQueue] Processing operation:', operation.type);

    // Simulate processing
    // In a real app, you would:
    // 1. Send data to backend API
    // 2. Handle errors and retry logic
    // 3. Update local state if needed

    // For now, just mark as successful since we don't have a backend
    return true;
  }
}

// Singleton instance
let onlineStatusManager = null;

/**
 * Get or create the online status manager
 */
export function getOnlineStatusManager() {
  if (!onlineStatusManager) {
    onlineStatusManager = new OnlineStatusManager();
  }
  return onlineStatusManager;
}

/**
 * Check if currently online
 */
export function isOnline() {
  return getOnlineStatusManager().isOnline;
}

/**
 * Add listener for online/offline status changes
 */
export function addOnlineStatusListener(callback) {
  return getOnlineStatusManager().addListener(callback);
}

/**
 * Manually trigger queue processing
 */
export function processOfflineQueue() {
  return getOnlineStatusManager().processQueue();
}
