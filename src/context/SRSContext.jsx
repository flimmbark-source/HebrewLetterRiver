import React, { createContext, useContext, useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useLanguage } from './LanguageContext.jsx';
import { useLocalization } from './LocalizationContext.jsx';
import { SRSProgress } from '../lib/db.js';
import {
  defaultSRSSettings,
  createSRSItem,
  calculateNextReview,
  getDueItems,
  calculateStatistics,
  isDue
} from '../lib/srsTypes.js';
import { emit } from '../lib/eventBus.js';

const SRSContext = createContext(null);

/**
 * Default user progress structure
 */
const defaultUserProgress = {
  letters: {},
  vocabulary: {},
  grammar: {},
  settings: { ...defaultSRSSettings },
  statistics: {
    totalItems: 0,
    newItems: 0,
    learningItems: 0,
    matureItems: 0,
    dueToday: 0,
    reviewedToday: 0,
    accuracy: 0
  },
  lastReviewDate: 0
};

/**
 * SRS Context Provider
 * Manages spaced repetition progress for letters, vocabulary, and grammar
 */
export function SRSProvider({ children }) {
  const { languagePack } = useLocalization();
  const languageId = languagePack?.id || 'hebrew';

  const hydratedLanguageRef = useRef(languageId);
  const isInitialHydrationRef = useRef(true);
  const [isHydrationComplete, setIsHydrationComplete] = useState(false);

  /**
   * Load SRS progress from IndexedDB
   */
  const hydrateProgress = useCallback(async () => {
    try {
      const stored = await SRSProgress.get(languageId);
      if (!stored) {
        return { ...defaultUserProgress };
      }

      // Merge with defaults to ensure all fields exist
      return {
        ...defaultUserProgress,
        ...stored,
        letters: stored.letters || {},
        vocabulary: stored.vocabulary || {},
        grammar: stored.grammar || {},
        settings: { ...defaultSRSSettings, ...(stored.settings || {}) },
        statistics: { ...defaultUserProgress.statistics, ...(stored.statistics || {}) }
      };
    } catch (error) {
      console.error('[SRS] Error hydrating progress:', error);
      return { ...defaultUserProgress };
    }
  }, [languageId]);

  // State initialization
  const [progress, setProgress] = useState(defaultUserProgress);
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate on mount and language change
  useEffect(() => {
    hydratedLanguageRef.current = languageId;
    setIsHydrationComplete(false);
  }, [languageId]);

  useEffect(() => {
    async function loadProgress() {
      if (isInitialHydrationRef.current) {
        isInitialHydrationRef.current = false;
        const loaded = await hydrateProgress();
        setProgress(loaded);
        setIsLoading(false);
        setIsHydrationComplete(true);
        return;
      }

      // Language changed, reload
      const loaded = await hydrateProgress();
      setProgress(loaded);
      if (hydratedLanguageRef.current === languageId) {
        setIsHydrationComplete(true);
      }
    }

    loadProgress();
  }, [hydrateProgress, languageId]);

  // Auto-persist progress changes to IndexedDB
  useEffect(() => {
    if (!isHydrationComplete || isLoading) return;

    async function saveProgress() {
      try {
        await SRSProgress.save(languageId, progress);
      } catch (error) {
        console.error('[SRS] Error saving progress:', error);
      }
    }

    saveProgress();
  }, [progress, languageId, isHydrationComplete, isLoading]);

  /**
   * Add a new item to the SRS system
   * @param {string} itemId - Unique identifier
   * @param {'letter' | 'vocabulary' | 'grammar'} itemType - Type of item
   */
  const addItem = useCallback((itemId, itemType) => {
    setProgress(prev => {
      // Check if item already exists
      if (prev[itemType]?.[itemId]) {
        console.warn('[SRS] Item already exists:', itemId);
        return prev;
      }

      const newItem = createSRSItem(itemId, itemType);
      const updated = {
        ...prev,
        [itemType]: {
          ...prev[itemType],
          [itemId]: newItem
        }
      };

      // Recalculate statistics
      updated.statistics = calculateStatistics(updated);

      emit('srs:item-added', { itemId, itemType, languageId });

      return updated;
    });
  }, [languageId]);

  /**
   * Record a review for an item
   * @param {string} itemId - Item identifier
   * @param {'letter' | 'vocabulary' | 'grammar'} itemType - Type of item
   * @param {number} grade - Quality of recall (0-5)
   * @param {number} timeSpent - Time spent on review in ms
   * @returns {Object} Updated item data
   */
  const reviewItem = useCallback((itemId, itemType, grade, timeSpent = 0) => {
    let updatedItem = null;

    setProgress(prev => {
      const currentItem = prev[itemType]?.[itemId];

      if (!currentItem) {
        console.error('[SRS] Item not found for review:', itemId, itemType);
        return prev;
      }

      // Calculate next review using SM-2 algorithm
      updatedItem = calculateNextReview(currentItem, grade);

      const updated = {
        ...prev,
        [itemType]: {
          ...prev[itemType],
          [itemId]: updatedItem
        },
        lastReviewDate: Math.max(prev.lastReviewDate, updatedItem.lastReviewDate)
      };

      // Recalculate statistics
      updated.statistics = calculateStatistics(updated);

      // Emit event for other systems to react
      emit('srs:item-reviewed', {
        itemId,
        itemType,
        grade,
        timeSpent,
        newInterval: updatedItem.interval,
        nextDueDate: updatedItem.dueDate,
        languageId
      });

      return updated;
    });

    return updatedItem;
  }, [languageId]);

  /**
   * Get items that are due for review
   * @param {'letter' | 'vocabulary' | 'grammar' | 'all'} itemType - Type filter
   * @param {number} limit - Maximum items to return
   * @returns {Array} Due items
   */
  const getDueItemsForType = useCallback((itemType = 'all', limit = 20) => {
    if (itemType === 'all') {
      return getDueItems({
        ...progress.letters,
        ...progress.vocabulary,
        ...progress.grammar
      }, limit);
    }

    return getDueItems(progress[itemType] || {}, limit);
  }, [progress]);

  /**
   * Get new items that haven't been reviewed yet
   * @param {'letter' | 'vocabulary' | 'grammar' | 'all'} itemType - Type filter
   * @param {number} limit - Maximum items to return
   * @returns {Array} New items
   */
  const getNewItems = useCallback((itemType = 'all', limit = 20) => {
    const items = itemType === 'all'
      ? [...Object.values(progress.letters), ...Object.values(progress.vocabulary), ...Object.values(progress.grammar)]
      : Object.values(progress[itemType] || {});

    return items
      .filter(item => item.reviewCount === 0)
      .slice(0, limit);
  }, [progress]);

  /**
   * Update SRS settings
   * @param {Partial<SRSSettings>} newSettings - Settings to update
   */
  const updateSettings = useCallback((newSettings) => {
    setProgress(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        ...newSettings
      }
    }));

    emit('srs:settings-updated', { settings: newSettings, languageId });
  }, [languageId]);

  /**
   * Reset progress for a specific item
   * @param {string} itemId - Item identifier
   * @param {'letter' | 'vocabulary' | 'grammar'} itemType - Type of item
   */
  const resetItem = useCallback((itemId, itemType) => {
    setProgress(prev => {
      const currentItem = prev[itemType]?.[itemId];
      if (!currentItem) return prev;

      const resetItem = createSRSItem(itemId, itemType);

      const updated = {
        ...prev,
        [itemType]: {
          ...prev[itemType],
          [itemId]: resetItem
        }
      };

      updated.statistics = calculateStatistics(updated);

      emit('srs:item-reset', { itemId, itemType, languageId });

      return updated;
    });
  }, [languageId]);

  /**
   * Remove an item from the SRS system
   * @param {string} itemId - Item identifier
   * @param {'letter' | 'vocabulary' | 'grammar'} itemType - Type of item
   */
  const removeItem = useCallback((itemId, itemType) => {
    setProgress(prev => {
      const { [itemId]: removed, ...remaining } = prev[itemType] || {};

      const updated = {
        ...prev,
        [itemType]: remaining
      };

      updated.statistics = calculateStatistics(updated);

      emit('srs:item-removed', { itemId, itemType, languageId });

      return updated;
    });
  }, [languageId]);

  /**
   * Check if a specific item is due for review
   * @param {string} itemId - Item identifier
   * @param {'letter' | 'vocabulary' | 'grammar'} itemType - Type of item
   * @returns {boolean}
   */
  const isItemDue = useCallback((itemId, itemType) => {
    const item = progress[itemType]?.[itemId];
    return item ? isDue(item) : false;
  }, [progress]);

  /**
   * Get a specific item's SRS data
   * @param {string} itemId - Item identifier
   * @param {'letter' | 'vocabulary' | 'grammar'} itemType - Type of item
   * @returns {SRSItem|null}
   */
  const getItem = useCallback((itemId, itemType) => {
    return progress[itemType]?.[itemId] || null;
  }, [progress]);

  /**
   * Reset all progress (useful for testing or starting over)
   * @param {'letter' | 'vocabulary' | 'grammar' | 'all'} itemType - What to reset
   */
  const resetProgress = useCallback(async (itemType = 'all') => {
    if (itemType === 'all') {
      setProgress({ ...defaultUserProgress });
      emit('srs:progress-reset', { itemType: 'all', languageId });
    } else {
      setProgress(prev => {
        const updated = {
          ...prev,
          [itemType]: {}
        };
        updated.statistics = calculateStatistics(updated);
        emit('srs:progress-reset', { itemType, languageId });
        return updated;
      });
    }
  }, [languageId]);

  const value = useMemo(
    () => ({
      progress,
      isLoading,
      addItem,
      reviewItem,
      getDueItems: getDueItemsForType,
      getNewItems,
      updateSettings,
      resetItem,
      removeItem,
      isItemDue,
      getItem,
      resetProgress,
      statistics: progress.statistics,
      settings: progress.settings
    }),
    [
      progress,
      isLoading,
      addItem,
      reviewItem,
      getDueItemsForType,
      getNewItems,
      updateSettings,
      resetItem,
      removeItem,
      isItemDue,
      getItem,
      resetProgress
    ]
  );

  return <SRSContext.Provider value={value}>{children}</SRSContext.Provider>;
}

/**
 * Hook to access SRS context
 * @returns {Object} SRS context value
 */
export function useSRS() {
  const ctx = useContext(SRSContext);
  if (!ctx) {
    throw new Error('useSRS must be used within SRSProvider');
  }
  return ctx;
}
