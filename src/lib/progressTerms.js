/**
 * PATH-06: Terminology Audit
 * Single source of truth for progression terminology, colors, and helper functions.
 */

export const PROGRESS_TERMS = {
  stages: {
    letters: { label: 'Letters', icon: 'sort_by_alpha' },
    words: { label: 'Words', icon: 'extension' },
    reading: { label: 'Reading', icon: 'menu_book' },
    conversation: { label: 'Conversation', icon: 'forum' }
  },
  mastery: {
    weak: { label: 'Needs practice', color: '#E57373' },
    growing: { label: 'Growing', color: '#FFB74D' },
    strong: { label: 'Strong', color: '#81C784' },
    mastered: { label: 'Mastered', color: '#D4A017' }
  },
  status: {
    not_started: { label: 'Not started' },
    in_progress: { label: 'In progress' },
    review: { label: 'Ready for review' },
    mastered: { label: 'Mastered' }
  }
};

/**
 * Determine a mastery level from accuracy and attempt count.
 * @param {number} accuracy - 0-100 percentage
 * @param {number} attempts - total attempts
 * @returns {'weak'|'growing'|'strong'|'mastered'}
 */
export function getMasteryLevel(accuracy, attempts) {
  const safeAccuracy = Number.isFinite(accuracy) ? accuracy : 0;
  const safeAttempts = Number.isFinite(attempts) ? attempts : 0;

  if (safeAccuracy > 90 && safeAttempts >= 10) return 'mastered';
  if (safeAccuracy >= 70) return 'strong';
  if (safeAccuracy >= 40) return 'growing';
  return 'weak';
}

/**
 * Map an SRS maturity string to the app's mastery level.
 * @param {string} srsMaturity - one of 'new', 'learning', 'young', 'mature'
 * @returns {'weak'|'growing'|'strong'|'mastered'}
 */
export function masteryFromSRS(srsMaturity) {
  switch (srsMaturity) {
    case 'mature': return 'mastered';
    case 'young': return 'strong';
    case 'learning': return 'growing';
    default: return 'weak';
  }
}

/**
 * Determine which journey stage a user is currently in.
 * @param {Object} player - player object from ProgressContext
 * @param {Object} srsStats - statistics from SRSContext
 * @returns {'letters'|'words'|'reading'|'conversation'}
 */
export function getStageForUser(player, srsStats) {
  const sessions = player?.totals?.sessions ?? 0;
  const letterEntries = Object.entries(player?.letters ?? {});
  const totalLetterAttempts = letterEntries.reduce(
    (sum, [, s]) => sum + (s.correct ?? 0) + (s.incorrect ?? 0),
    0
  );
  const totalLetterCorrect = letterEntries.reduce(
    (sum, [, s]) => sum + (s.correct ?? 0),
    0
  );
  const letterAccuracy = totalLetterAttempts > 0
    ? (totalLetterCorrect / totalLetterAttempts) * 100
    : 0;

  const matureItems = srsStats?.matureItems ?? 0;
  const totalItems = srsStats?.totalItems ?? 0;
  const vocabMastery = totalItems > 0 ? (matureItems / totalItems) * 100 : 0;

  // Conversation: reading attempted and vocab is building
  if (sessions >= 20 && letterAccuracy >= 70 && vocabMastery >= 20) return 'conversation';

  // Reading: vocab is growing, ready for reading
  if (sessions >= 15 && letterAccuracy >= 60 && totalItems >= 10) return 'reading';

  // Words: decent letter knowledge, time to build vocabulary
  if (sessions >= 10 || letterAccuracy >= 50) return 'words';

  // Letters: still learning the alphabet
  return 'letters';
}

/**
 * Return the highest completed stage index (0-based) for progress display.
 * Stages: letters(0), words(1), reading(2), conversation(3)
 */
export function getCompletedStageIndex(player, srsStats) {
  const stage = getStageForUser(player, srsStats);
  const order = ['letters', 'words', 'reading', 'conversation'];
  return Math.max(0, order.indexOf(stage) - 1);
}

/**
 * Build a recommendation object describing what the user should do next.
 * @param {Object} player
 * @param {Object} srsStats
 * @param {Object} daily
 * @param {Object} streak
 * @returns {{ type: string, icon: string, title: string, description: string, route: string|null, action: string }}
 */
export function getRecommendation(player, srsStats, daily, streak) {
  // 1. SRS items due today
  const dueToday = srsStats?.dueToday ?? 0;
  if (dueToday > 0) {
    return {
      type: 'srs_review',
      icon: 'auto_awesome',
      title: `Review ${dueToday} item${dueToday === 1 ? '' : 's'}`,
      description: 'Spaced repetition items are ready for review',
      route: null,
      action: 'open_game'
    };
  }

  // 2. Incomplete daily quest
  const incompleteTasks = (daily?.tasks ?? []).filter(t => !t.completed);
  if (incompleteTasks.length > 0) {
    return {
      type: 'daily_quest',
      icon: 'task_alt',
      title: 'Complete today\'s quest',
      description: `${incompleteTasks.length} quest${incompleteTasks.length === 1 ? '' : 's'} remaining`,
      route: '/daily',
      action: 'navigate'
    };
  }

  // 3. Hasn't played today
  const todayKey = _getTodayKey();
  if (streak?.lastPlayedDateKey !== todayKey) {
    return {
      type: 'start_session',
      icon: 'play_circle',
      title: 'Start today\'s session',
      description: 'Keep your streak alive with a quick practice',
      route: null,
      action: 'open_game'
    };
  }

  // 4. Weak letter (accuracy < 50% with 5+ attempts)
  const weakLetter = _findWeakLetter(player);
  if (weakLetter) {
    return {
      type: 'weak_letter',
      icon: 'trending_up',
      title: `Practice ${weakLetter.symbol}`,
      description: `${weakLetter.name} needs more practice (${weakLetter.accuracy}% accuracy)`,
      route: null,
      action: 'open_game'
    };
  }

  // 5. Default
  return {
    type: 'keep_practicing',
    icon: 'school',
    title: 'Keep practicing',
    description: 'Choose a game mode to continue learning',
    route: null,
    action: 'open_modal'
  };
}

/**
 * Build a recommendation taking recent session results into account.
 * @param {Object} sessionResults - { correctCount, incorrectCount, lettersPracticed, lettersImproved, weakLetters }
 * @param {Object} player
 * @param {Object} srsStats
 * @param {Object} daily
 * @param {Object} streak
 * @returns {{ type: string, icon: string, title: string, description: string, route: string|null, action: string }}
 */
export function getSessionRecommendation(sessionResults, player, srsStats, daily, streak) {
  const weakLetters = sessionResults?.weakLetters ?? [];

  // If there are weak letters from this session, suggest practicing them
  if (weakLetters.length > 0) {
    return {
      type: 'practice_weak',
      icon: 'trending_up',
      title: 'Practice weak letters',
      description: `${weakLetters.length} letter${weakLetters.length === 1 ? '' : 's'} still need${weakLetters.length === 1 ? 's' : ''} work`,
      route: null,
      action: 'open_game'
    };
  }

  // Fall back to the general recommendation
  return getRecommendation(player, srsStats, daily, streak);
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function _getTodayKey() {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Jerusalem',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    return formatter.format(new Date());
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

function _findWeakLetter(player) {
  const letters = player?.letters ?? {};
  let weakest = null;
  let lowestAccuracy = 50;

  for (const [id, stats] of Object.entries(letters)) {
    const total = (stats.correct ?? 0) + (stats.incorrect ?? 0);
    if (total < 5) continue;
    const accuracy = Math.round(((stats.correct ?? 0) / total) * 100);
    if (accuracy < lowestAccuracy) {
      lowestAccuracy = accuracy;
      weakest = { id, accuracy, symbol: id, name: id };
    }
  }
  return weakest;
}
