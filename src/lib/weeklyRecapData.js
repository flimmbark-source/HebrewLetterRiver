/**
 * Weekly Recap Data Generator (SHARE-05)
 * Computes a summary of the past 7 days for the weekly recap card.
 */

const MODE_LABELS = {
  letter_river: 'Letter River',
  letterRiver: 'Letter River',
  bridge_builder: 'Bridge Builder',
  bridgeBuilder: 'Bridge Builder',
  loose_planks: 'Loose Planks',
  deep_script: 'Deep Script',
  deepScript: 'Deep Script',
  vocab: 'Vocabulary',
};

/**
 * Normalize a mode ID that might be a Letter River submode into its parent label.
 * @param {string} modeId
 * @returns {string}
 */
function normalizeModeLabel(modeId) {
  const explicit = MODE_LABELS[modeId];
  if (explicit) return explicit;

  if (
    modeId?.includes('consonants') ||
    modeId?.includes('forms') ||
    modeId?.includes('niqqud') ||
    modeId?.includes('vowel')
  ) {
    return 'Letter River';
  }

  return modeId || 'Unknown';
}

/**
 * Generate weekly recap data from player and streak state.
 *
 * @param {Object} player - Player object from useProgress()
 * @param {Object} streak - Streak object from useProgress()
 * @returns {{
 *   sessionsThisWeek: number,
 *   lettersImproved: number,
 *   streakCurrent: number,
 *   topMode: string | null,
 *   starsEarnedThisWeek: number
 * }}
 */
export function generateWeeklyRecap(player, streak) {
  const now = Date.now();
  const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
  const weekAgo = now - oneWeekMs;

  // Stars earned this week from recentAchievementClaims
  const claims = Array.isArray(player?.recentAchievementClaims)
    ? player.recentAchievementClaims
    : [];

  let starsEarnedThisWeek = 0;
  claims.forEach((claim) => {
    const claimedAtMs = claim?.claimedAt ? new Date(claim.claimedAt).getTime() : 0;
    if (claimedAtMs && claimedAtMs >= weekAgo) {
      const stars = Number.isFinite(claim?.stars) ? claim.stars : 0;
      if (stars > 0) starsEarnedThisWeek += stars;
    }
  });

  // Sessions this week: We approximate from total sessions.
  // Since we don't have per-session timestamps, we use the recentModesPlayed
  // array as a proxy for recent activity count.
  const recentModes = player?.recentModesPlayed ?? player?.modesPlayed ?? [];
  const sessionsThisWeek = recentModes.length;

  // Letters improved: count of letters the player has practiced
  const lettersImproved = Object.keys(player?.letters ?? {}).length;

  // Top mode: most frequently played mode from recent history
  const modeCounts = {};
  recentModes.forEach((modeId) => {
    const label = normalizeModeLabel(modeId);
    modeCounts[label] = (modeCounts[label] ?? 0) + 1;
  });

  let topMode = null;
  let topCount = 0;
  Object.entries(modeCounts).forEach(([label, count]) => {
    if (count > topCount) {
      topCount = count;
      topMode = label;
    }
  });

  const streakCurrent = streak?.current ?? 0;

  return {
    sessionsThisWeek,
    lettersImproved,
    streakCurrent,
    topMode,
    starsEarnedThisWeek,
  };
}
