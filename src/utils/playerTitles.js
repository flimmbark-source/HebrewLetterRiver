import playerTitlesData from '../data/playerTitles.json';

/**
 * Get player title based on current level
 * Titles are alliterative pairs (both words start with same letter)
 * First word changes every level, second word changes every 5 levels
 *
 * @param {number} level - Player's current level (1-based)
 * @returns {string} - Title like "Patient Paddler" or "Swift Surfer"
 */
export function getPlayerTitle(level) {
  // Default fallback for level 0 or invalid
  if (!level || level < 1) {
    return 'River Explorer';
  }

  // Find the title group for this level
  const titleGroup = playerTitlesData.find(group =>
    group.levels.includes(level)
  );

  // If level is beyond our defined range, return last title with level indicator
  if (!titleGroup) {
    const lastGroup = playerTitlesData[playerTitlesData.length - 1];
    const lastAdjective = lastGroup.adjectives[lastGroup.adjectives.length - 1];
    return `${lastAdjective} ${lastGroup.baseWord}`;
  }

  // Find which adjective to use (based on position in the group)
  const indexInGroup = titleGroup.levels.indexOf(level);
  const adjective = titleGroup.adjectives[indexInGroup];

  return `${adjective} ${titleGroup.baseWord}`;
}
