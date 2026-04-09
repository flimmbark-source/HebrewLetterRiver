/**
 * Share Service (SHARE-02)
 * Handles sharing game results via Web Share API with clipboard fallback.
 */

const LANGUAGE_FLAGS = {
  hebrew: '🇮🇱', english: '🇬🇧', spanish: '🇪🇸', french: '🇫🇷',
  portuguese: '🇧🇷', russian: '🇷🇺', arabic: '🇸🇦', hindi: '🇮🇳',
  bengali: '🇧🇩', mandarin: '🇨🇳', japanese: '🇯🇵', amharic: '🇪🇹',
};

const LANGUAGE_NAMES = {
  hebrew: 'Hebrew', english: 'English', spanish: 'Spanish', french: 'French',
  portuguese: 'Portuguese', russian: 'Russian', arabic: 'Arabic', hindi: 'Hindi',
  bengali: 'Bengali', mandarin: 'Mandarin', japanese: 'Japanese', amharic: 'Amharic',
};

const MODE_LABELS = {
  letter_river: 'Letter River',
  letterRiver: 'Letter River',
  bridge_builder: 'Bridge Builder',
  bridgeBuilder: 'Bridge Builder',
  deep_script: 'Deep Script',
  deepScript: 'Deep Script',
};

/**
 * Check if the native Web Share API is available.
 * @returns {boolean}
 */
export function canNativeShare() {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function';
}

/**
 * Generate a plain-text share summary from session/achievement data.
 *
 * @param {Object} data
 * @param {string} data.mode - Game mode identifier
 * @param {number} [data.score] - Session score
 * @param {number} [data.accuracy] - Accuracy percentage (0-100)
 * @param {number} [data.streakCount] - Current streak length
 * @param {string} [data.languageId] - Language being learned
 * @param {string} [data.playerName] - Player display name
 * @param {Object} [data.details] - Mode-specific details
 * @param {string} [data.type] - 'session' | 'achievement' | 'weekly'
 * @param {string} [data.badgeName] - For achievement shares
 * @param {Object} [data.weeklyData] - For weekly recap shares
 * @returns {string}
 */
export function generateShareText(data = {}) {
  const flag = LANGUAGE_FLAGS[data.languageId] || '🌐';
  const langName = LANGUAGE_NAMES[data.languageId] || data.languageId || 'a language';
  const modeLabel = MODE_LABELS[data.mode] || data.mode || 'Letter River';
  const streak = data.streakCount ?? 0;
  const streakLine = streak > 0 ? `🔥 ${streak}-day streak! ` : '';

  // Achievement share
  if (data.type === 'achievement' && data.badgeName) {
    const lines = [
      `🏆 Just unlocked "${data.badgeName}" on Letter River! ${flag}`,
      streak > 0 ? `🔥 ${streak}-day streak learning ${langName}!` : `Learning ${langName}!`,
      '#LetterRiver #Learn' + capitalize(langName),
    ];
    return lines.join('\n');
  }

  // Weekly recap share
  if (data.type === 'weekly' && data.weeklyData) {
    const w = data.weeklyData;
    const lines = [
      `📊 My week on Letter River ${flag}`,
      `${w.sessionsThisWeek} sessions | ${streak > 0 ? `🔥 ${streak}-day streak` : 'Building a streak'}`,
      w.starsEarnedThisWeek > 0 ? `⭐ ${w.starsEarnedThisWeek} stars earned this week` : '',
      w.topMode ? `Most played: ${w.topMode}` : '',
      '#LetterRiver #Learn' + capitalize(langName),
    ];
    return lines.filter(Boolean).join('\n');
  }

  // Session share (default)
  if (modeLabel === 'Letter River') {
    const lettersCount = data.details?.lettersLearned ?? data.details?.totalLetters ?? 0;
    const lines = [
      `${streakLine}Just scored ${data.score ?? 0} on Letter River ${flag}`,
      lettersCount > 0 ? `Learned ${lettersCount} ${langName} letters today!` : `Practicing ${langName}!`,
      '#LetterRiver #Learn' + capitalize(langName),
    ];
    return lines.join('\n');
  }

  if (modeLabel === 'Bridge Builder') {
    const wordsCount = data.details?.wordsCompleted ?? 0;
    const packName = data.details?.packName || '';
    const lines = [
      `${streakLine}Completed ${wordsCount} words on Bridge Builder ${flag}`,
      packName ? `Pack: ${packName}` : `Building ${langName} vocabulary!`,
      '#LetterRiver #Learn' + capitalize(langName),
    ];
    return lines.join('\n');
  }

  if (modeLabel === 'Deep Script') {
    const floors = data.details?.floorsCleared ?? 0;
    const result = data.details?.runResult || '';
    const lines = [
      `${streakLine}Cleared ${floors} floors in Deep Script ${flag}`,
      result ? `Result: ${result}` : `Exploring ${langName} vocabulary!`,
      '#LetterRiver #Learn' + capitalize(langName),
    ];
    return lines.join('\n');
  }

  // Generic fallback
  const lines = [
    `${streakLine}Just played ${modeLabel} on Letter River ${flag}`,
    `Learning ${langName}!`,
    '#LetterRiver #Learn' + capitalize(langName),
  ];
  return lines.join('\n');
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Attempt to share result data. Tries native share first, then clipboard, then returns status.
 *
 * @param {Object} data - Share data (same shape as generateShareText)
 * @returns {Promise<{ method: 'native' | 'clipboard' | 'none', success: boolean }>}
 */
export async function shareResult(data) {
  const text = generateShareText(data);
  const title = 'Letter River';

  // Try native share
  if (canNativeShare()) {
    const shareData = { title, text };
    try {
      const canShare = typeof navigator.canShare === 'function' ? navigator.canShare(shareData) : true;
      if (canShare) {
        await navigator.share(shareData);
        return { method: 'native', success: true };
      }
    } catch (err) {
      // AbortError means user dismissed — not a failure
      if (err.name === 'AbortError') {
        return { method: 'native', success: false };
      }
      // Fall through to clipboard
    }
  }

  // Try clipboard
  if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(text);
      return { method: 'clipboard', success: true };
    } catch {
      // Fall through
    }
  }

  // Nothing worked
  return { method: 'none', success: false };
}

/**
 * Stub for image capture. The share card is designed for on-screen display
 * and users can screenshot it. We rely on text sharing for the actual share flow.
 *
 * @param {React.RefObject} _elementRef - Unused, kept for API compatibility
 * @returns {Promise<null>}
 */
export async function captureShareImage(_elementRef) {
  // No html2canvas dependency — card is visual-only, sharing is text-based
  return null;
}
