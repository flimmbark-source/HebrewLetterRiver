/**
 * Learning Journey — single source of truth for the guided progression that
 * connects the game modes into one path:
 *
 *   letters (Letter River) → words (Bridge Builder / Loose Planks)
 *     → reading (Sentences & Reading) → conversation (Cafe Talk)
 *
 * Deep Script and Daily Review are reinforcement modes that run alongside
 * every unlocked stage rather than being stages themselves.
 *
 * Stage unlocks are deterministic (computed from real progress data) and
 * ratchet forward: once a stage is unlocked it stays unlocked. The persisted
 * ratchet lives in `player.journey` (see ProgressContext), so a criteria dip
 * (e.g. switching letter sets) never re-locks a stage.
 */
import { bridgeBuilderPacks } from '../data/bridgeBuilderPacks.js';
import {
  getAllPackCompletions,
  getAllWordProgress,
  getPackProgress
} from './bridgeBuilderStorage.js';
import { getStageForUser } from './progressTerms.js';

export const JOURNEY_STAGE_ORDER = ['letters', 'words', 'reading', 'conversation'];

/** Share of the alphabet that must be practiced before Words unlocks. */
export const WORDS_UNLOCK_LETTER_RATIO = 0.6;
/** Vocab packs that must be completed before Sentences & Reading unlocks. */
export const READING_UNLOCK_PACKS = 2;
/** Packs whose sentence/reading content must be completed before Conversation unlocks. */
export const CONVERSATION_UNLOCK_SCENES = 2;

/** Minimum skill-check accuracy to test out of a locked stage's requirement. */
export const TEST_OUT_PASS_RATIO = 0.7;

/**
 * Stage definitions. Copy entries are [i18nKey, englishFallback] pairs,
 * resolved through `t` in getJourneyStageStates so every surface shows the
 * same wording.
 */
export const JOURNEY_STAGES = {
  letters: {
    id: 'letters',
    order: 0,
    icon: 'waves',
    copy: {
      label: ['journey.stages.letters.label', 'Letters'],
      tagline: ['journey.stages.letters.tagline', 'Recognize the alphabet'],
      what: [
        'journey.stages.letters.what',
        'The shape and sound of every letter and vowel, until you recognize them instantly.'
      ],
      how: [
        'journey.stages.letters.how',
        'Letter River calls out a sound and floats letters past you. Catching the right one over and over builds automatic recognition — the foundation every later stage stands on.'
      ]
    },
    modes: [{ id: 'letterRiver', icon: 'waves', name: ['journey.modes.letterRiver', 'Letter River'] }]
  },
  words: {
    id: 'words',
    order: 1,
    icon: 'foundation',
    copy: {
      label: ['journey.stages.words.label', 'Words'],
      tagline: ['journey.stages.words.tagline', 'Pronounce & build vocabulary'],
      what: [
        'journey.stages.words.what',
        'Your first vocabulary: how real words are spelled, pronounced, and what they mean.'
      ],
      how: [
        'journey.stages.words.how',
        'Bridge Builder introduces themed word packs plank by plank, and Loose Planks makes you rebuild them from memory. Reading each word aloud connects spelling to pronunciation.'
      ]
    },
    modes: [
      { id: 'bridgeBuilder', icon: 'foundation', name: ['journey.modes.bridgeBuilder', 'Bridge Builder'] },
      { id: 'loosePlanks', icon: 'water', name: ['journey.modes.loosePlanks', 'Loose Planks'] }
    ]
  },
  reading: {
    id: 'reading',
    order: 2,
    icon: 'menu_book',
    copy: {
      label: ['journey.stages.reading.label', 'Sentences & Reading'],
      tagline: ['journey.stages.reading.tagline', 'Read & build sentences'],
      what: [
        'journey.stages.reading.what',
        'How words fit together: sentence structure, word order, and reading full lines with understanding.'
      ],
      how: [
        'journey.stages.reading.how',
        'Reading scenes put the words you learned into short texts and sentence practice. You already know the vocabulary — now you learn how the language arranges it.'
      ]
    },
    modes: [
      { id: 'reading', icon: 'menu_book', name: ['journey.modes.reading', 'Reading Scenes'] },
      { id: 'sentences', icon: 'notes', name: ['journey.modes.sentences', 'Sentence Practice'] }
    ]
  },
  conversation: {
    id: 'conversation',
    order: 3,
    icon: 'chat_bubble',
    copy: {
      label: ['journey.stages.conversation.label', 'Conversation'],
      tagline: ['journey.stages.conversation.tagline', 'Use it in dialogue'],
      what: [
        'journey.stages.conversation.what',
        'Putting everything to work: understanding and responding in real back-and-forth dialogue.'
      ],
      how: [
        'journey.stages.conversation.how',
        'Cafe Talk scenarios walk you through realistic conversations beat by beat, using the sentences and vocabulary from earlier stages — first with support, then in both roles.'
      ]
    },
    modes: [{ id: 'conversation', icon: 'chat_bubble', name: ['journey.modes.conversation', 'Cafe Talk'] }]
  }
};

/** Reinforcement lane — surfaced next to every stage, never a stage itself. */
export const REINFORCEMENT_MODES = [
  {
    id: 'deepScript',
    icon: 'explore',
    name: ['journey.modes.deepScript', 'Deep Script'],
    tagline: ['journey.reinforcement.deepScript', 'Dungeon runs that reinforce letters, words, and sentences']
  },
  {
    id: 'dailyReview',
    icon: 'event_available',
    name: ['journey.modes.dailyReview', 'Daily Review'],
    tagline: ['journey.reinforcement.dailyReview', 'Spaced repetition on everything you have learned']
  }
];

/* ═══════════════════════════════════════════════════════════
   Persisted journey state (stored on player.journey)
   ═══════════════════════════════════════════════════════════ */

export function createDefaultJourney() {
  return {
    unlockedStages: ['letters'],
    // Letters needs no intro modal — onboarding covers it.
    introsSeen: ['letters'],
    advancedAt: {}
  };
}

/**
 * Normalize a stored journey object (drops unknown stages, guarantees the
 * first stage, keeps stage order canonical).
 */
export function normalizeJourney(source) {
  if (!source || typeof source !== 'object') return createDefaultJourney();
  const unlockedSet = new Set(
    (Array.isArray(source.unlockedStages) ? source.unlockedStages : []).filter((id) =>
      JOURNEY_STAGE_ORDER.includes(id)
    )
  );
  unlockedSet.add('letters');
  const introsSeen = new Set(
    (Array.isArray(source.introsSeen) ? source.introsSeen : []).filter((id) =>
      JOURNEY_STAGE_ORDER.includes(id)
    )
  );
  introsSeen.add('letters');
  return {
    unlockedStages: JOURNEY_STAGE_ORDER.filter((id) => unlockedSet.has(id)),
    introsSeen: JOURNEY_STAGE_ORDER.filter((id) => introsSeen.has(id)),
    advancedAt: source.advancedAt && typeof source.advancedAt === 'object' ? source.advancedAt : {}
  };
}

/**
 * Migration: seed journey state for a player saved before the journey
 * existed. Uses the legacy stage heuristic so nobody regresses, and marks
 * the seeded stages' intros as seen so existing users aren't greeted with a
 * wall of "stage unlocked!" celebrations.
 */
export function seedJourneyFromLegacyPlayer(source) {
  const legacyStage = getStageForUser(source, null);
  const index = Math.max(0, JOURNEY_STAGE_ORDER.indexOf(legacyStage));
  const unlockedStages = JOURNEY_STAGE_ORDER.slice(0, index + 1);
  return {
    unlockedStages,
    introsSeen: [...unlockedStages],
    advancedAt: {}
  };
}

/* ═══════════════════════════════════════════════════════════
   Deterministic unlock evaluation
   ═══════════════════════════════════════════════════════════ */

function getAttempts(stats = {}) {
  return (stats.correct ?? 0) + (stats.incorrect ?? 0);
}

function getAlphabetPool(languagePack) {
  // Base letters only (not the synthesized letter+vowel syllables in
  // allItems) — the Words stage unlocks on alphabet familiarity, not on
  // exhausting every syllable combination.
  const baseItems = Array.isArray(languagePack?.items) ? languagePack.items : [];
  const consonants = Array.isArray(languagePack?.consonants) ? languagePack.consonants : [];
  const pool = baseItems.length > 0 ? baseItems : consonants;
  const seen = new Set();
  return pool.filter((entry) => {
    const id = entry?.id || entry?.symbol;
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

function countPracticedLetters(player, languagePack) {
  const pool = getAlphabetPool(languagePack);
  const validIds = new Set(pool.map((item) => item.id || item.symbol));
  const practiced = Object.entries(player?.letters ?? {}).filter(
    ([id, stats]) => (validIds.size === 0 || validIds.has(id)) && getAttempts(stats) > 0
  ).length;
  return { practiced, total: pool.length };
}

function countPackMilestones() {
  const completions = getAllPackCompletions();
  const allProgress = getAllWordProgress();
  let packsCompleted = 0;
  let scenesCompleted = 0;
  for (const pack of bridgeBuilderPacks) {
    const completion = completions[pack.id] || {};
    const progress = getPackProgress(pack, allProgress);
    if (completion.bridgeBuilderComplete || progress.completed) packsCompleted += 1;
    if (completion.packSceneComplete || completion.sentenceReady) scenesCompleted += 1;
  }
  return { packsCompleted, scenesCompleted, totalPacks: bridgeBuilderPacks.length };
}

function toPercent(current, target) {
  if (!target) return 100;
  return Math.max(0, Math.min(100, Math.round((current / target) * 100)));
}

/**
 * Evaluate every stage's unlock criteria from live progress data.
 * Returns { [stageId]: { criteriaMet, current, target, percent } }.
 */
export function evaluateJourneyCriteria({ player, languagePack }) {
  const letters = countPracticedLetters(player, languagePack);
  const packs = countPackMilestones();
  const lettersTarget = Math.max(1, Math.ceil(letters.total * WORDS_UNLOCK_LETTER_RATIO));

  return {
    letters: { criteriaMet: true, current: 0, target: 0, percent: 100 },
    words: {
      criteriaMet: letters.practiced >= lettersTarget,
      current: Math.min(letters.practiced, lettersTarget),
      target: lettersTarget,
      percent: toPercent(letters.practiced, lettersTarget)
    },
    reading: {
      criteriaMet: packs.packsCompleted >= READING_UNLOCK_PACKS,
      current: Math.min(packs.packsCompleted, READING_UNLOCK_PACKS),
      target: READING_UNLOCK_PACKS,
      percent: toPercent(packs.packsCompleted, READING_UNLOCK_PACKS)
    },
    conversation: {
      criteriaMet: packs.scenesCompleted >= CONVERSATION_UNLOCK_SCENES,
      current: Math.min(packs.scenesCompleted, CONVERSATION_UNLOCK_SCENES),
      target: CONVERSATION_UNLOCK_SCENES,
      percent: toPercent(packs.scenesCompleted, CONVERSATION_UNLOCK_SCENES)
    }
  };
}

function buildRequirementText(stageId, criteria, t) {
  const remaining = Math.max(0, criteria.target - criteria.current);
  switch (stageId) {
    case 'words':
      return {
        requirement: t('journey.unlock.words.requirement', 'Practice {{target}} letters in Letter River', {
          target: criteria.target
        }),
        progressLine: t('journey.unlock.words.progress', '{{current}} of {{target}} letters practiced', {
          current: criteria.current,
          target: criteria.target
        }),
        remainingLine: t('journey.unlock.words.remaining', '{{remaining}} more letters to unlock', { remaining })
      };
    case 'reading':
      return {
        requirement: t('journey.unlock.reading.requirement', 'Complete {{target}} word packs in Bridge Builder', {
          target: criteria.target
        }),
        progressLine: t('journey.unlock.reading.progress', '{{current}} of {{target}} word packs completed', {
          current: criteria.current,
          target: criteria.target
        }),
        remainingLine: t('journey.unlock.reading.remaining', '{{remaining}} more packs to unlock', { remaining })
      };
    case 'conversation':
      return {
        requirement: t('journey.unlock.conversation.requirement', 'Complete {{target}} reading scenes', {
          target: criteria.target
        }),
        progressLine: t('journey.unlock.conversation.progress', '{{current}} of {{target}} reading scenes completed', {
          current: criteria.current,
          target: criteria.target
        }),
        remainingLine: t('journey.unlock.conversation.remaining', '{{remaining}} more scenes to unlock', { remaining })
      };
    default:
      return {
        requirement: t('journey.unlock.letters.requirement', 'Available from the start'),
        progressLine: '',
        remainingLine: ''
      };
  }
}

/* ═══════════════════════════════════════════════════════════
   Combined view — evaluation + persisted ratchet + resolved copy
   ═══════════════════════════════════════════════════════════ */

const defaultT = (key, fallback, replacements = {}) =>
  Object.entries(replacements).reduce(
    (text, [token, value]) => text.replaceAll(`{{${token}}}`, String(value)),
    fallback ?? key
  );

function resolveCopy(pair, t) {
  return t(pair[0], pair[1]);
}

/**
 * Build the full journey view used by the home screen and mode surfaces.
 *
 * @returns {{
 *   stages: Array<{
 *     id, index, icon, label, tagline, what, how,
 *     modes: Array<{ id, icon, name }>,
 *     unlocked, criteriaMet, persistedUnlocked, introSeen, isCurrent,
 *     unlockProgress: { current, target, percent },
 *     requirement, progressLine, remainingLine
 *   }>,
 *   currentStageId: string
 * }}
 */
export function getJourneyStageStates({ player, languagePack, t = defaultT }) {
  const criteria = evaluateJourneyCriteria({ player, languagePack });
  const journey = normalizeJourney(player?.journey);
  const unlockedSet = new Set(journey.unlockedStages);
  const introsSeen = new Set(journey.introsSeen);

  const stages = JOURNEY_STAGE_ORDER.map((id, index) => {
    const stage = JOURNEY_STAGES[id];
    const stageCriteria = criteria[id];
    const persistedUnlocked = unlockedSet.has(id);
    const unlocked = index === 0 || persistedUnlocked || stageCriteria.criteriaMet;
    const texts = buildRequirementText(id, stageCriteria, t);
    return {
      id,
      index,
      icon: stage.icon,
      label: resolveCopy(stage.copy.label, t),
      tagline: resolveCopy(stage.copy.tagline, t),
      what: resolveCopy(stage.copy.what, t),
      how: resolveCopy(stage.copy.how, t),
      modes: stage.modes.map((mode) => ({ id: mode.id, icon: mode.icon, name: resolveCopy(mode.name, t) })),
      unlocked,
      criteriaMet: stageCriteria.criteriaMet,
      persistedUnlocked,
      introSeen: introsSeen.has(id),
      unlockProgress: {
        current: stageCriteria.current,
        target: stageCriteria.target,
        percent: stageCriteria.percent
      },
      ...texts
    };
  });

  // The current stage is the frontier: the highest unlocked stage.
  const currentStageId = [...stages].reverse().find((stage) => stage.unlocked)?.id ?? 'letters';
  const withCurrent = stages.map((stage) => ({ ...stage, isCurrent: stage.id === currentStageId }));

  return { stages: withCurrent, currentStageId };
}

export function getReinforcementModes(t = defaultT) {
  return REINFORCEMENT_MODES.map((mode) => ({
    id: mode.id,
    icon: mode.icon,
    name: resolveCopy(mode.name, t),
    tagline: resolveCopy(mode.tagline, t)
  }));
}
