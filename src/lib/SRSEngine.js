/**
 * SRS Engine - Implements the SM-2 Spaced Repetition Algorithm
 *
 * The SM-2 algorithm optimizes learning by scheduling reviews at increasing intervals
 * based on how well the user recalls the information.
 *
 * @see https://www.supermemo.com/en/archives1990-2015/english/ol/sm2
 */

/**
 * Response quality grades for SM-2 algorithm
 */
export const GRADE = {
  AGAIN: 0,      // Complete blackout, wrong response
  HARD: 1,       // Correct response recalled with serious difficulty
  HARD_PLUS: 2,  // Correct response after hesitation
  GOOD: 3,       // Correct response with some effort
  GOOD_PLUS: 4,  // Correct response after moment of hesitation
  EASY: 5        // Perfect response, immediate recall
};

/**
 * Item maturity states
 */
export const MATURITY = {
  NEW: 'new',           // Never reviewed (interval = 0)
  LEARNING: 'learning', // In learning phase (interval < 21 days)
  YOUNG: 'young',       // Young mature (21 <= interval < 100 days)
  MATURE: 'mature'      // Mature (interval >= 100 days)
};

/**
 * Priority weights for queue sorting
 */
const PRIORITY_WEIGHTS = {
  overdueDays: 10,      // Each day overdue adds 10 points
  itemType: {
    letter: 30,         // Letters get highest priority
    vocabulary: 20,     // Vocabulary second
    grammar: 10         // Grammar third
  },
  maturity: {
    [MATURITY.NEW]: 5,
    [MATURITY.LEARNING]: 15,
    [MATURITY.YOUNG]: 10,
    [MATURITY.MATURE]: 5
  }
};

export class SRSEngine {
  /**
   * Create a new SRS Engine
   * @param {Object} options - Configuration options
   * @param {number} options.minEaseFactor - Minimum ease factor (default: 1.3)
   * @param {number} options.initialEaseFactor - Starting ease factor (default: 2.5)
   * @param {number} options.easyBonus - Bonus multiplier for easy responses (default: 1.3)
   * @param {number} options.hardInterval - Multiplier for hard responses (default: 1.2)
   * @param {number} options.maxReviewsPerDay - Daily review limit (default: 200)
   * @param {number} options.maxNewPerDay - Daily new items limit (default: 20)
   */
  constructor(options = {}) {
    this.minEaseFactor = options.minEaseFactor ?? 1.3;
    this.initialEaseFactor = options.initialEaseFactor ?? 2.5;
    this.easyBonus = options.easyBonus ?? 1.3;
    this.hardInterval = options.hardInterval ?? 1.2;
    this.maxReviewsPerDay = options.maxReviewsPerDay ?? 200;
    this.maxNewPerDay = options.maxNewPerDay ?? 20;
  }

  /**
   * Calculate the new ease factor using SM-2 algorithm
   * Formula: EF' = EF + (0.1 - (5-q) * (0.08 + (5-q) * 0.02))
   *
   * @param {number} currentEF - Current ease factor
   * @param {number} grade - Response quality (0-5)
   * @returns {number} New ease factor (minimum 1.3)
   */
  calculateEaseFactor(currentEF, grade) {
    if (grade < 0 || grade > 5) {
      throw new Error(`Grade must be between 0 and 5, got ${grade}`);
    }

    // SM-2 formula: EF' = EF + (0.1 - (5-q) * (0.08 + (5-q) * 0.02))
    const delta = 0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02);
    const newEF = currentEF + delta;

    // Enforce minimum ease factor
    return Math.max(this.minEaseFactor, newEF);
  }

  /**
   * Calculate the next interval based on SM-2 algorithm
   *
   * @param {Object} item - Current SRS item
   * @param {number} item.interval - Current interval in days
   * @param {number} item.easeFactor - Current ease factor
   * @param {number} item.reviewCount - Number of times reviewed
   * @param {number} grade - Response quality (0-5)
   * @returns {number} Next interval in days
   */
  calculateInterval(item, grade) {
    const { interval, easeFactor, reviewCount } = item;

    // Grade < 3 means failure - reset to learning
    if (grade < 3) {
      return 0; // Review again immediately
    }

    // Special handling for hard responses (grade 3)
    if (grade === 3 && interval > 0) {
      // For hard responses, increase interval more conservatively
      return Math.round(interval * this.hardInterval);
    }

    // First successful review
    if (interval === 0 || reviewCount === 0) {
      return 1; // 1 day
    }

    // Second successful review
    if (interval === 1) {
      return 6; // 6 days
    }

    // Subsequent reviews use ease factor
    let nextInterval = Math.round(interval * easeFactor);

    // Easy responses get bonus multiplier
    if (grade === 5) {
      nextInterval = Math.round(nextInterval * this.easyBonus);
    }

    return nextInterval;
  }

  /**
   * Process a review and update the item
   *
   * @param {Object} item - SRS item to review
   * @param {number} grade - Response quality (0-5)
   * @param {number} timestamp - Review timestamp (default: now)
   * @returns {Object} Updated item with new SRS parameters
   */
  processReview(item, grade, timestamp = Date.now()) {
    if (!item) {
      throw new Error('Item is required');
    }

    // Calculate new ease factor
    const newEaseFactor = this.calculateEaseFactor(item.easeFactor, grade);

    // Calculate new interval
    const newInterval = this.calculateInterval(item, grade);

    // Calculate due date (interval in days -> milliseconds)
    const intervalMs = newInterval * 24 * 60 * 60 * 1000;
    const newDueDate = timestamp + intervalMs;

    // Track recent grades (keep last 10)
    const recentGrades = [...(item.recentGrades || []), grade].slice(-10);

    // Update counters
    const isLapse = grade < 3;
    const lapseCount = item.lapseCount + (isLapse ? 1 : 0);
    const reviewCount = item.reviewCount + 1;

    return {
      ...item,
      easeFactor: newEaseFactor,
      interval: newInterval,
      dueDate: newDueDate,
      lastReviewDate: timestamp,
      reviewCount,
      lapseCount,
      recentGrades
    };
  }

  /**
   * Get the maturity level of an item
   *
   * @param {Object} item - SRS item
   * @returns {string} Maturity level (new, learning, young, mature)
   */
  getMaturity(item) {
    if (item.reviewCount === 0 || item.interval === 0) {
      return MATURITY.NEW;
    }
    if (item.interval < 21) {
      return MATURITY.LEARNING;
    }
    if (item.interval < 100) {
      return MATURITY.YOUNG;
    }
    return MATURITY.MATURE;
  }

  /**
   * Calculate priority score for queue sorting
   * Higher score = higher priority
   *
   * @param {Object} item - SRS item
   * @param {number} now - Current timestamp
   * @returns {number} Priority score
   */
  calculatePriority(item, now = Date.now()) {
    let score = 0;

    // Add points for how overdue the item is
    if (item.dueDate < now) {
      const overdueDays = Math.floor((now - item.dueDate) / (24 * 60 * 60 * 1000));
      score += overdueDays * PRIORITY_WEIGHTS.overdueDays;
    }

    // Add points based on item type
    score += PRIORITY_WEIGHTS.itemType[item.itemType] || 0;

    // Add points based on maturity (learning items get highest priority)
    const maturity = this.getMaturity(item);
    score += PRIORITY_WEIGHTS.maturity[maturity] || 0;

    return score;
  }

  /**
   * Get daily review queue with intelligent sorting
   *
   * @param {Object[]} allItems - All SRS items
   * @param {Object} options - Queue options
   * @param {number} options.maxReviews - Max reviews to return (default: engine's maxReviewsPerDay)
   * @param {number} options.now - Current timestamp (default: Date.now())
   * @param {boolean} options.includeNew - Include new items in queue (default: false)
   * @param {number} options.maxNew - Max new items to include (default: engine's maxNewPerDay)
   * @returns {Object} Queue with due items and statistics
   */
  getDailyQueue(allItems, options = {}) {
    const {
      maxReviews = this.maxReviewsPerDay,
      now = Date.now(),
      includeNew = false,
      maxNew = this.maxNewPerDay
    } = options;

    // Separate due items and new items
    const dueItems = [];
    const newItems = [];

    allItems.forEach(item => {
      if (item.reviewCount === 0) {
        newItems.push(item);
      } else if (item.dueDate <= now) {
        dueItems.push(item);
      }
    });

    // Sort due items by priority (highest first)
    const sortedDueItems = dueItems
      .map(item => ({
        item,
        priority: this.calculatePriority(item, now)
      }))
      .sort((a, b) => b.priority - a.priority)
      .map(({ item }) => item);

    // Build queue
    let queue = sortedDueItems.slice(0, maxReviews);

    // Add new items if requested and space available
    if (includeNew && queue.length < maxReviews) {
      const newSlots = Math.min(maxNew, maxReviews - queue.length);
      const selectedNew = newItems.slice(0, newSlots);
      queue = [...queue, ...selectedNew];
    }

    // Calculate statistics
    const stats = {
      totalDue: dueItems.length,
      totalNew: newItems.length,
      queueSize: queue.length,
      overdueCount: dueItems.filter(item =>
        (now - item.dueDate) > 24 * 60 * 60 * 1000
      ).length,
      byType: {
        letter: queue.filter(item => item.itemType === 'letter').length,
        vocabulary: queue.filter(item => item.itemType === 'vocabulary').length,
        grammar: queue.filter(item => item.itemType === 'grammar').length
      },
      byMaturity: {
        new: queue.filter(item => this.getMaturity(item) === MATURITY.NEW).length,
        learning: queue.filter(item => this.getMaturity(item) === MATURITY.LEARNING).length,
        young: queue.filter(item => this.getMaturity(item) === MATURITY.YOUNG).length,
        mature: queue.filter(item => this.getMaturity(item) === MATURITY.MATURE).length
      }
    };

    return {
      queue,
      stats,
      hasOverflow: dueItems.length > maxReviews
    };
  }

  /**
   * Get forecast for future reviews
   *
   * @param {Object[]} allItems - All SRS items
   * @param {number} days - Number of days to forecast (default: 7)
   * @returns {Object[]} Forecast by day
   */
  getForecast(allItems, days = 7) {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const forecast = [];

    for (let i = 0; i < days; i++) {
      const dayStart = now + (i * dayMs);
      const dayEnd = dayStart + dayMs;

      const dueCount = allItems.filter(item =>
        item.dueDate >= dayStart && item.dueDate < dayEnd
      ).length;

      forecast.push({
        day: i,
        date: new Date(dayStart),
        dueCount
      });
    }

    return forecast;
  }

  /**
   * Get study statistics for an item
   *
   * @param {Object} item - SRS item
   * @returns {Object} Statistics
   */
  getItemStats(item) {
    const recentGrades = item.recentGrades || [];
    const totalReviews = item.reviewCount || 0;
    const successRate = totalReviews > 0
      ? ((totalReviews - item.lapseCount) / totalReviews) * 100
      : 0;

    const avgRecentGrade = recentGrades.length > 0
      ? recentGrades.reduce((sum, g) => sum + g, 0) / recentGrades.length
      : 0;

    return {
      maturity: this.getMaturity(item),
      successRate: Math.round(successRate),
      totalReviews,
      lapseCount: item.lapseCount || 0,
      currentStreak: this.getCurrentStreak(recentGrades),
      avgRecentGrade: Math.round(avgRecentGrade * 10) / 10,
      nextReviewIn: item.dueDate > Date.now()
        ? Math.ceil((item.dueDate - Date.now()) / (24 * 60 * 60 * 1000))
        : 0
    };
  }

  /**
   * Calculate current streak of successful reviews
   *
   * @param {number[]} recentGrades - Recent grade history
   * @returns {number} Current streak
   */
  getCurrentStreak(recentGrades) {
    if (!recentGrades || recentGrades.length === 0) return 0;

    let streak = 0;
    for (let i = recentGrades.length - 1; i >= 0; i--) {
      if (recentGrades[i] >= 3) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }
}

/**
 * Create a default SRS engine instance
 */
export function createDefaultEngine() {
  return new SRSEngine({
    minEaseFactor: 1.3,
    initialEaseFactor: 2.5,
    easyBonus: 1.3,
    hardInterval: 1.2,
    maxReviewsPerDay: 200,
    maxNewPerDay: 20
  });
}

// Export singleton instance
export const defaultEngine = createDefaultEngine();
