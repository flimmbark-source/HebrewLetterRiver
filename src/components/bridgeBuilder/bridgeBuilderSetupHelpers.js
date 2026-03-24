/**
 * Helper functions for BridgeBuilderSetup — pack selection logic.
 *
 * These are pure functions that operate on the packData array
 * produced by BridgeBuilderSetup's useMemo.
 *
 * packData item shape:
 *   { pack, progress: { wordsIntroducedCount, totalWords, completed, ... }, unlocked, completion }
 */

/** How many packs to show in the preview (including the featured one). */
export const PREVIEW_LIMIT = 3;

/**
 * Get the recommended "Quick Start" pack for a section.
 * Prefers the first unlocked pack that is in-progress (some words introduced, not completed).
 * Falls back to the first unlocked pack in the section.
 *
 * @param {Array} packData — array of { pack, progress, unlocked, completion }
 * @returns {Object|null} — the packData item, or null if section is empty / all locked
 */
export function getRecommendedPack(packData) {
  const unlocked = packData.filter(pd => pd.unlocked);
  if (unlocked.length === 0) return null;

  // In-progress = some words introduced but not all
  const inProgress = unlocked.find(
    pd => pd.progress.wordsIntroducedCount > 0 && !pd.progress.completed
  );
  if (inProgress) return inProgress;

  // Fall back to first unlocked pack
  return unlocked[0];
}

/**
 * Get the preview packs to show below the Quick Start card.
 * Returns up to (PREVIEW_LIMIT - 1) packs that are NOT the recommended pack.
 *
 * @param {Array} packData — full pack list for the section
 * @param {string} recommendedPackId — ID of the recommended/featured pack
 * @param {number} [limit=PREVIEW_LIMIT] — total visible packs including featured
 * @returns {Array} — packData items for preview
 */
export function getPreviewPacks(packData, recommendedPackId, limit = PREVIEW_LIMIT) {
  const rest = packData.filter(pd => pd.pack.id !== recommendedPackId);
  return rest.slice(0, limit - 1);
}

/**
 * Get the number of remaining packs not shown in the preview.
 *
 * @param {Array} packData — full pack list for the section
 * @param {number} [limit=PREVIEW_LIMIT] — total visible packs including featured
 * @returns {number}
 */
export function getRemainingCount(packData, limit = PREVIEW_LIMIT) {
  return Math.max(0, packData.length - limit);
}

/**
 * Determine the button label for a pack based on its progress.
 * "Continue" if in-progress, "Play" otherwise (new or completed).
 *
 * @param {{ wordsIntroducedCount: number, completed: boolean }} progress
 * @returns {string}
 */
export function getPackButtonLabel(progress) {
  if (progress.wordsIntroducedCount > 0 && !progress.completed) {
    return 'Continue';
  }
  return 'Play';
}
