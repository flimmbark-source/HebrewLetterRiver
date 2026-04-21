/**
 * Bridge Builder — display-model layer.
 *
 * Derived selectors that normalize pack and section state into a single
 * consistent shape for UI rendering. This centralizes the "status",
 * "ctaLabel", "progressLabel", etc. logic that was previously spread
 * across BridgeBuilderSetup.jsx and its helpers.
 *
 * These functions are pure: all inputs (word progress, pack completions,
 * unlock flags) are passed in via a context object. The UI owns the
 * memoization; this module owns the shape.
 *
 * INTENTIONALLY does NOT change any stored data or persistence schema —
 * it only composes existing selectors (getPackProgress, getPackState, …)
 * into a stable display shape a future section-hub UI can consume.
 */
/* eslint-disable no-unused-vars */

import { getPackProgress } from './bridgeBuilderStorage.js';
import { getPackState, PACK_STATES } from './packProgression.js';
import { buildPackProgressCopy } from './packProgressCopy.js';

// ─── Section visual metadata ────────────────────────────────
// Moved here from BridgeBuilderSetup.jsx so both the current setup screen
// and any future section-hub UI render the same accent/icon for a section.

export const SECTION_META = {
  foundations: { icon: 'school', accent: 'primary' },
  daily_life: { icon: 'home', accent: 'secondary' },
  people_social: { icon: 'groups', accent: 'tertiary' },
  meaning_builders: { icon: 'auto_stories', accent: 'primary' },
  cafe_talk: { icon: 'coffee', accent: 'secondary' },
};

const DEFAULT_SECTION_META = { icon: 'category', accent: 'primary' };

export function getSectionMeta(sectionId) {
  return SECTION_META[sectionId] || DEFAULT_SECTION_META;
}

// ─── Status + label dictionaries ────────────────────────────
// Keep every status/cta string in one place so future copy changes
// (localization, A/B tests) touch a single table.

export const PACK_STATUS = {
  NEW: 'new',
  STARTED: 'started',
  INTRODUCED: 'introduced',
  LEARNED: 'learned',
  MASTERED: 'mastered',
  REVIEW: 'review',
  LOCKED: 'locked',
};

const DEFAULT_CTA_BY_STATUS = {
  [PACK_STATUS.NEW]: 'Start',
  [PACK_STATUS.STARTED]: 'Continue',
  [PACK_STATUS.INTRODUCED]: 'Continue',
  [PACK_STATUS.LEARNED]: 'Practice',
  [PACK_STATUS.MASTERED]: 'Practice',
  [PACK_STATUS.REVIEW]: 'Review',
  [PACK_STATUS.LOCKED]: 'Why locked',
};

const DEFAULT_COMPLETION = Object.freeze({
  bridgeBuilderComplete: false,
  loosePlanksComplete: false,
  deepScriptComplete: false,
});

// ─── Internal helpers ───────────────────────────────────────

function formatMinutes(seconds = 0) {
  const safe = Math.max(0, Number(seconds) || 0);
  if (safe === 0) return '— min';
  const minutes = Math.max(1, Math.round(safe / 60));
  return `${minutes} min`;
}

function packHasAnyQuizKnown(pack, allWordProgress) {
  for (const wordId of pack.wordIds) {
    if (allWordProgress?.[wordId]?.quizKnown) return true;
  }
  return false;
}

function countReviewDueInPack(pack, dueReviewWordIdSet) {
  if (!dueReviewWordIdSet) return 0;
  let n = 0;
  for (const wordId of pack.wordIds) {
    if (dueReviewWordIdSet.has(wordId)) n += 1;
  }
  return n;
}

function defaultUnlockReason(pack) {
  if (pack?.unlockAfter) {
    return `Complete the previous pack to unlock`;
  }
  return 'Not yet available';
}

// ─── getPackDisplayModel ────────────────────────────────────

/**
 * Build a normalized display model for a single pack.
 *
 * @param {Object} pack — pack definition (from bridgeBuilderPacks)
 * @param {Object} context
 * @param {Object} [context.allWordProgress]        — map of wordId → WordProgress
 * @param {Object} [context.packCompletions]        — map of packId → PackCompletion
 * @param {Set<string>|null} [context.dueReviewWordIdSet] — due review word IDs
 * @param {boolean} [context.isUnlocked=true]       — whether the pack is gated
 * @param {string}  [context.unlockReason]          — override unlock copy
 * @param {number|null} [context.packIndex=null]    — 0-based index within section
 * @param {number|null} [context.totalPacksInSection=null]
 * @param {boolean} [context.isCurrent=false]       — is this the "active" pack
 * @param {Object}  [context.ctaOverrides]          — status → label overrides
 * @returns {PackDisplayModel}
 */
export function getPackDisplayModel(pack, context = {}) {
  const {
    allWordProgress = {},
    packCompletions = {},
    dueReviewWordIdSet = null,
    isUnlocked = true,
    unlockReason = null,
    packIndex = null,
    totalPacksInSection = null,
    isCurrent = false,
    ctaOverrides = null,
    isGatingEnforced = false,
  } = context;

  // Sanity: the underlying data should always give us these.
  // If a caller hands us a half-built pack, surface it loudly rather than
  // silently producing a weird display model.
  if (!pack || !Array.isArray(pack.wordIds)) {
    throw new Error('[bridgeBuilderDisplayModel] getPackDisplayModel: invalid pack');
  }

  const progress = getPackProgress(pack, allWordProgress);
  const completion = packCompletions[pack.id] || DEFAULT_COMPLETION;
  const packState = getPackState(pack, allWordProgress, packCompletions);

  // Map the existing 4-state progression (unseen/introduced/learned/mastered)
  // into the wider "display" status space, folding in the unlocked flag.
  let status;
  if (!isUnlocked) {
    status = PACK_STATUS.LOCKED;
  } else if (packState === PACK_STATES.MASTERED) {
    status = PACK_STATUS.MASTERED;
  } else if (packState === PACK_STATES.LEARNED) {
    status = PACK_STATUS.LEARNED;
  } else if (packState === PACK_STATES.INTRODUCED) {
    status = PACK_STATUS.INTRODUCED;
  } else if (progress.wordsIntroducedCount > 0) {
    // Defensive: packState shouldn't leave a pack in this state but the
    // older gameplay code has produced it on occasion. Treat as "started".
    status = PACK_STATUS.STARTED;
  } else {
    status = PACK_STATUS.NEW;
  }

  const reviewDueCount = countReviewDueInPack(pack, dueReviewWordIdSet);

  // "Review" is surfaced as an overlay status: a pack can be mastered AND
  // have review-due words. We keep the primary `status` as "mastered" (so
  // the UI's color/icon stays stable) and expose `isReviewDue` separately,
  // but the CTA is bumped to "Review" to guide the player there.
  const isReviewDue = reviewDueCount > 0 && (status === PACK_STATUS.MASTERED || status === PACK_STATUS.LEARNED);

  const copy = buildPackProgressCopy({
    pack,
    progress,
    completion,
    isUnlocked,
    isGatingEnforced,
    dueReviewCount: reviewDueCount,
  });

  const ctaLabel =
    (ctaOverrides && ctaOverrides[status]) ||
    (isReviewDue ? 'Review due' : DEFAULT_CTA_BY_STATUS[status]) ||
    'Start';

  const progressLabel = `${copy.primaryLabel} · ${copy.secondaryLabel}`;

  return {
    // Identity
    id: pack.id,
    title: pack.title,
    description: pack.description || '',
    subtitle: pack.description || '',
    sectionId: pack.sectionId,
    packIndex,
    totalPacksInSection,

    // Content metadata
    wordCount: pack.wordIds.length,
    targetsNewCount: pack.targetsNewCount ?? pack.wordIds.length,
    supportReviewCount: pack.supportReviewCount ?? 0,
    estimatedTimeSec: pack.estimatedTimeSec || 0,
    estimatedTimeLabel: formatMinutes(pack.estimatedTimeSec || 0),
    difficulty: pack.difficultyBand || 'Core',
    primaryType: pack.primaryType || 'mixed',
    goalTags: Array.isArray(pack.goalTags) ? pack.goalTags : [],
    whyItMatters: pack.whyItMatters || '',
    visualToken: pack.theme || null,

    // Derived status
    status,
    isCurrent: !!isCurrent && status !== PACK_STATUS.LOCKED,
    isReviewDue,
    ctaLabel,
    progressLabel,
    stageLabel: copy.stageLabel,
    stageTone: copy.stageTone,
    wordsIntroducedLabel: copy.wordsIntroducedLabel,
    modesCompleteLabel: copy.modesCompleteLabel,
    reviewDueLabel: copy.reviewDueLabel,
    sentenceReadyLabel: copy.sentenceReadyLabel,
    unlockReasonLabel: copy.unlockReasonLabel,

    // Mode-by-mode completion, normalized to short keys for UI rendering.
    modeCompletion: {
      bridgeBuilder: !!completion.bridgeBuilderComplete,
      loosePlanks: !!completion.loosePlanksComplete,
      deepScript: !!completion.deepScriptComplete,
    },

    // Optional quiz / sentence-ready signals from existing storage.
    sentenceReady: !!completion.sentenceReady,
    quizPassed: !!completion.quizMastered,
    quizKnown: packHasAnyQuizKnown(pack, allWordProgress),
    reviewDueCount,

    unlockReason: !isUnlocked ? (unlockReason || defaultUnlockReason(pack)) : null,

    // Raw refs so UI code that still wants to pass the original pack /
    // progress / completion object around doesn't have to re-lookup.
    pack,
    progress,
    completion,
    packState,
  };
}

// ─── getSectionDisplayModel ─────────────────────────────────

/**
 * Build a normalized display model for a section.
 *
 * Pack display models are either computed on the fly from `context.packs`
 * or taken from the precomputed `context.packModels` (preferred when the
 * caller has already built them for its own memoized pipeline).
 *
 * @param {Object} section — section definition
 * @param {Object} context
 * @param {Object[]}  [context.packs]            — ordered packs in section
 * @param {Object[]}  [context.packModels]       — precomputed pack models
 * @param {Object}    [context.allWordProgress]
 * @param {Object}    [context.packCompletions]
 * @param {Set<string>|null} [context.dueReviewWordIdSet]
 * @param {boolean}   [context.isUnlocked=true]
 * @param {Object|null} [context.previousSection=null] — for nextUnlockLabel
 * @param {number}    [context.previewLimit=3]
 * @param {Object}    [context.meta]             — { icon, accent } override
 * @returns {SectionDisplayModel}
 */
export function getSectionDisplayModel(section, context = {}) {
  const {
    packs = null,
    packModels: providedModels = null,
    allWordProgress = {},
    packCompletions = {},
    dueReviewWordIdSet = null,
    isUnlocked = true,
    previousSection = null,
    previewLimit = 3,
    meta = getSectionMeta(section.id),
    isGatingEnforced = false,
  } = context;

  let packModels;
  if (providedModels) {
    packModels = providedModels;
  } else if (Array.isArray(packs)) {
    packModels = packs.map((pack, idx) =>
      getPackDisplayModel(pack, {
        allWordProgress,
        packCompletions,
        dueReviewWordIdSet,
        isUnlocked,
        isGatingEnforced,
        packIndex: idx,
        totalPacksInSection: packs.length,
      }),
    );
  } else {
    packModels = [];
  }

  const totalPacks = packModels.length;

  const masteredCount = packModels.filter((m) => m.status === PACK_STATUS.MASTERED).length;
  const learnedCount = packModels.filter((m) => m.status === PACK_STATUS.LEARNED).length;
  // "Started" here means the player has touched the pack but not completed
  // a mode yet — matches the INTRODUCED state of the progression model.
  const startedCount = packModels.filter(
    (m) => m.status === PACK_STATUS.INTRODUCED || m.status === PACK_STATUS.STARTED,
  ).length;
  // "Completed" = at least one mode done (learned OR mastered). This is
  // intentionally looser than the existing section-progress `packsCompleted`
  // (which is strictly mastered). Both are exposed so consumers can pick.
  const completedCount = masteredCount + learnedCount;

  // Current pack — first unlocked in-progress pack, or first actionable
  // pack if nothing's started yet. Mirrors activePackId selection in the
  // existing setup screen.
  const currentPack =
    packModels.find((m) => m.status === PACK_STATUS.INTRODUCED || m.status === PACK_STATUS.STARTED) ||
    packModels.find((m) => m.status !== PACK_STATUS.LOCKED && m.status !== PACK_STATUS.MASTERED) ||
    null;

  // For now, recommended == current. A future hub may want a different
  // heuristic (e.g. due review > in-progress > new); keep the hook.
  const recommendedPack = currentPack;

  const safePreviewLimit = Math.max(1, Math.min(previewLimit || 3, totalPacks || 1));
  const previewPacks = packModels.slice(0, safePreviewLimit);
  const remainingCount = Math.max(0, totalPacks - safePreviewLimit);

  const progressPercent =
    totalPacks > 0 ? Math.round((masteredCount / totalPacks) * 100) : 0;
  const progressLabel =
    totalPacks > 0 ? `${masteredCount} of ${totalPacks} mastered` : '0 of 0 mastered';

  const nextUnlockLabel =
    !isUnlocked && previousSection
      ? `Complete ${previousSection.title} to unlock`
      : null;

  return {
    id: section.id,
    title: section.title,
    description: section.description || '',
    icon: meta.icon,
    accent: meta.accent,
    isUnlocked,

    totalPacks,
    masteredCount,
    learnedCount,
    startedCount,
    completedCount,

    currentPack,
    recommendedPack,
    previewPacks,
    remainingCount,

    progressPercent,
    progressLabel,
    nextUnlockLabel,

    packModels,
    section,
  };
}

// ─── Convenience top-level builder ──────────────────────────

/**
 * Build every section + pack display model in one pass.
 * The existing setup screen can drop this in where it currently builds
 * `sectionData`; a future section-hub UI can consume the same output.
 *
 * @param {Object} input
 * @param {Object[]} input.sections                  — ordered sections
 * @param {(sectionId: string) => Object[]} input.getPacksForSection
 * @param {Object}   input.allWordProgress
 * @param {Object}   input.packCompletions
 * @param {string[]} [input.dueReviewWordIds]
 * @param {(pack, section) => boolean} [input.isPackUnlocked=() => true]
 * @param {(section) => boolean}       [input.isSectionUnlocked=() => true]
 * @param {number}   [input.previewLimit=3]
 * @returns {{ sections: SectionDisplayModel[], packsById: Object }}
 */
export function buildDisplayModel(input) {
  const {
    sections,
    getPacksForSection,
    allWordProgress = {},
    packCompletions = {},
    dueReviewWordIds = [],
    isPackUnlocked = () => true,
    isSectionUnlocked = () => true,
    previewLimit = 3,
  } = input;

  const dueReviewWordIdSet = new Set(dueReviewWordIds);

  const sectionModels = [];
  const packsById = {};

  for (let sIdx = 0; sIdx < sections.length; sIdx += 1) {
    const section = sections[sIdx];
    const previousSection = sIdx > 0 ? sections[sIdx - 1] : null;
    const sectionUnlocked = !!isSectionUnlocked(section);

    const packs = getPacksForSection(section.id) || [];
    const packModels = packs.map((pack, pIdx) => {
      const unlocked = sectionUnlocked && !!isPackUnlocked(pack, section);
      const model = getPackDisplayModel(pack, {
        allWordProgress,
        packCompletions,
        dueReviewWordIdSet,
        isUnlocked: unlocked,
        packIndex: pIdx,
        totalPacksInSection: packs.length,
      });
      packsById[pack.id] = model;
      return model;
    });

    sectionModels.push(
      getSectionDisplayModel(section, {
        packs,
        packModels,
        allWordProgress,
        packCompletions,
        dueReviewWordIdSet,
        isUnlocked: sectionUnlocked,
        previousSection,
        previewLimit,
      }),
    );
  }

  return { sections: sectionModels, packsById };
}

/**
 * @typedef {Object} PackDisplayModel
 * @property {string}  id
 * @property {string}  title
 * @property {string}  description
 * @property {string}  subtitle
 * @property {string}  sectionId
 * @property {number|null} packIndex
 * @property {number|null} totalPacksInSection
 * @property {number}  wordCount
 * @property {number}  targetsNewCount
 * @property {number}  supportReviewCount
 * @property {number}  estimatedTimeSec
 * @property {string}  estimatedTimeLabel
 * @property {string}  difficulty
 * @property {string}  primaryType
 * @property {string[]} goalTags
 * @property {string}  whyItMatters
 * @property {string|null} visualToken
 * @property {'new'|'started'|'introduced'|'learned'|'mastered'|'review'|'locked'} status
 * @property {boolean} isCurrent
 * @property {boolean} isReviewDue
 * @property {string}  ctaLabel
 * @property {string}  progressLabel
 * @property {{ bridgeBuilder: boolean, loosePlanks: boolean, deepScript: boolean }} modeCompletion
 * @property {boolean} sentenceReady
 * @property {boolean} quizPassed
 * @property {boolean} quizKnown
 * @property {number}  reviewDueCount
 * @property {string|null} unlockReason
 * @property {Object}  pack
 * @property {Object}  progress
 * @property {Object}  completion
 * @property {string}  packState
 */

/**
 * @typedef {Object} SectionDisplayModel
 * @property {string}  id
 * @property {string}  title
 * @property {string}  description
 * @property {string}  icon
 * @property {string}  accent
 * @property {boolean} isUnlocked
 * @property {number}  totalPacks
 * @property {number}  masteredCount
 * @property {number}  learnedCount
 * @property {number}  startedCount
 * @property {number}  completedCount
 * @property {PackDisplayModel|null} currentPack
 * @property {PackDisplayModel|null} recommendedPack
 * @property {PackDisplayModel[]}    previewPacks
 * @property {number}  remainingCount
 * @property {number}  progressPercent
 * @property {string}  progressLabel
 * @property {string|null} nextUnlockLabel
 * @property {PackDisplayModel[]} packModels
 * @property {Object}  section
 */
