/**
 * Spaced Repetition System (SRS) Type Definitions
 * Based on the SM-2 algorithm for optimal learning intervals
 */

/**
 * @typedef {Object} SRSItem
 * @property {string} itemId - Unique identifier for the item (e.g., letter ID, word ID)
 * @property {'letter' | 'vocabulary' | 'grammar'} itemType - Type of learning item
 * @property {number} easeFactor - Multiplier for interval calculation (default: 2.5, min: 1.3)
 * @property {number} interval - Days until next review (0 = new, 1 = 1 day, etc.)
 * @property {number} dueDate - Timestamp when item is due for review
 * @property {number} reviewCount - Total number of times reviewed
 * @property {number} lapseCount - Number of times forgotten/failed
 * @property {number} lastReviewDate - Timestamp of last review
 * @property {number} createdAt - Timestamp when item was added to SRS
 * @property {number[]} [recentGrades] - Last 5 review grades (0-5) for analytics
 */

/**
 * @typedef {Object.<string, SRSItem>} LetterProgress
 * Map of letter IDs to their SRS data
 */

/**
 * @typedef {Object.<string, SRSItem>} VocabularyProgress
 * Map of vocabulary word IDs to their SRS data
 */

/**
 * @typedef {Object.<string, SRSItem>} GrammarProgress
 * Map of grammar concept IDs to their SRS data
 */

/**
 * @typedef {Object} SRSSettings
 * @property {number} newCardsPerDay - Maximum new items to introduce per day
 * @property {number} reviewsPerDay - Maximum reviews to show per day
 * @property {boolean} enabled - Whether SRS is active
 * @property {number[]} intervalModifiers - Multipliers for [again, hard, good, easy] buttons
 */

/**
 * @typedef {Object} SRSStatistics
 * @property {number} totalItems - Total items in the system
 * @property {number} newItems - Items never reviewed
 * @property {number} learningItems - Items in learning phase (interval < 21 days)
 * @property {number} matureItems - Items with interval >= 21 days
 * @property {number} dueToday - Items due for review today
 * @property {number} reviewedToday - Items reviewed today
 * @property {number} accuracy - Overall accuracy percentage
 */

/**
 * @typedef {Object} UserProgress
 * @property {LetterProgress} letters - Letter-specific SRS progress
 * @property {VocabularyProgress} vocabulary - Vocabulary SRS progress
 * @property {GrammarProgress} grammar - Grammar SRS progress
 * @property {SRSSettings} settings - User's SRS preferences
 * @property {SRSStatistics} statistics - Computed statistics
 * @property {number} lastReviewDate - Timestamp of last review session
 */

/**
 * @typedef {Object} ReviewResult
 * @property {string} itemId - ID of reviewed item
 * @property {number} grade - Quality of recall (0-5: 0=complete fail, 5=perfect)
 * @property {number} timeSpent - Milliseconds spent on review
 * @property {number} timestamp - When review occurred
 */

/**
 * Default SRS settings
 * @type {SRSSettings}
 */
export const defaultSRSSettings = {
  newCardsPerDay: 20,
  reviewsPerDay: 100,
  enabled: true,
  intervalModifiers: [0, 0.5, 1, 1.3] // again, hard, good, easy
};

/**
 * Create a new SRS item with default values
 * @param {string} itemId - Unique identifier
 * @param {'letter' | 'vocabulary' | 'grammar'} itemType - Type of item
 * @returns {SRSItem}
 */
export function createSRSItem(itemId, itemType) {
  const now = Date.now();
  return {
    itemId,
    itemType,
    easeFactor: 2.5,
    interval: 0,
    dueDate: now,
    reviewCount: 0,
    lapseCount: 0,
    lastReviewDate: 0,
    createdAt: now,
    recentGrades: []
  };
}

/**
 * Calculate next review using SM-2 algorithm
 * @param {SRSItem} item - Current SRS item
 * @param {number} grade - Quality of recall (0-5)
 * @returns {SRSItem} Updated SRS item
 */
export function calculateNextReview(item, grade) {
  const now = Date.now();
  const updated = { ...item };

  // Update recent grades (keep last 5)
  updated.recentGrades = [...(item.recentGrades || []), grade].slice(-5);
  updated.lastReviewDate = now;
  updated.reviewCount += 1;

  // Grade < 3 is a lapse (incorrect answer)
  if (grade < 3) {
    updated.lapseCount += 1;
    updated.interval = 0; // Reset to beginning
    updated.dueDate = now; // Due immediately
  } else {
    // Update ease factor based on grade
    const efDelta = 0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02);
    updated.easeFactor = Math.max(1.3, item.easeFactor + efDelta);

    // Calculate new interval
    if (item.interval === 0) {
      // First successful review
      updated.interval = 1;
    } else if (item.interval === 1) {
      // Second successful review
      updated.interval = 6;
    } else {
      // Subsequent reviews
      updated.interval = Math.round(item.interval * updated.easeFactor);
    }

    // Set due date
    updated.dueDate = now + updated.interval * 24 * 60 * 60 * 1000;
  }

  return updated;
}

/**
 * Check if an item is due for review
 * @param {SRSItem} item - SRS item to check
 * @param {number} [now=Date.now()] - Current timestamp
 * @returns {boolean}
 */
export function isDue(item, now = Date.now()) {
  return item.dueDate <= now;
}

/**
 * Get items due for review
 * @param {Object.<string, SRSItem>} items - Map of items
 * @param {number} [limit] - Maximum items to return
 * @returns {SRSItem[]}
 */
export function getDueItems(items, limit) {
  const now = Date.now();
  const dueItems = Object.values(items)
    .filter(item => isDue(item, now))
    .sort((a, b) => a.dueDate - b.dueDate); // Oldest due first

  return limit ? dueItems.slice(0, limit) : dueItems;
}

/**
 * Calculate SRS statistics from progress data
 * @param {UserProgress} progress - User's SRS progress
 * @returns {SRSStatistics}
 */
export function calculateStatistics(progress) {
  const now = Date.now();
  const todayStart = new Date().setHours(0, 0, 0, 0);

  const allItems = [
    ...Object.values(progress.letters || {}),
    ...Object.values(progress.vocabulary || {}),
    ...Object.values(progress.grammar || {})
  ];

  const stats = {
    totalItems: allItems.length,
    newItems: 0,
    learningItems: 0,
    matureItems: 0,
    dueToday: 0,
    reviewedToday: 0,
    accuracy: 0
  };

  let totalReviews = 0;
  let correctReviews = 0;

  allItems.forEach(item => {
    // Categorize by maturity
    if (item.reviewCount === 0) {
      stats.newItems++;
    } else if (item.interval < 21) {
      stats.learningItems++;
    } else {
      stats.matureItems++;
    }

    // Check if due
    if (isDue(item, now)) {
      stats.dueToday++;
    }

    // Check if reviewed today
    if (item.lastReviewDate >= todayStart) {
      stats.reviewedToday++;
    }

    // Calculate accuracy
    if (item.reviewCount > 0) {
      totalReviews += item.reviewCount;
      correctReviews += item.reviewCount - item.lapseCount;
    }
  });

  stats.accuracy = totalReviews > 0 ? Math.round((correctReviews / totalReviews) * 100) : 0;

  return stats;
}
