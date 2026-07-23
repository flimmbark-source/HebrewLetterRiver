import { HOME_ASSETS } from './homeAssets.js';
import { getStageForUser } from '../../lib/progressTerms.js';
import { bridgeBuilderPacks } from '../../data/bridgeBuilderPacks.js';
import { getAllWordProgress, getPackProgress, getDueReviewWordIds } from '../../lib/bridgeBuilderStorage.js';

const STAGE_ORDER = ['letters', 'words', 'reading', 'conversation'];

const STAGE_IMAGES = {
  letters: HOME_ASSETS.cardLetters,
  words: HOME_ASSETS.cardBridgeBuilder,
  reading: HOME_ASSETS.cardReading,
  conversation: HOME_ASSETS.cardReading
};

function clampPercent(value, fallback = 30) {
  const numeric = Number.isFinite(value) ? value : fallback;
  return Math.max(12, Math.min(100, Math.round(numeric)));
}

function getPracticeLetters(languagePack) {
  const baseItems = Array.isArray(languagePack?.items) ? languagePack.items : [];
  const allItems = Array.isArray(languagePack?.allItems) ? languagePack.allItems : [];
  const consonants = Array.isArray(languagePack?.consonants) ? languagePack.consonants : [];
  const vowels = Array.isArray(languagePack?.vowels?.markers) ? languagePack.vowels.markers : [];
  const pool = allItems.length > 0 ? allItems : baseItems.length > 0 ? baseItems : [...consonants, ...vowels];
  const seenIds = new Set();

  return pool
    .filter((entry) => entry?.id || entry?.symbol)
    .filter((entry) => {
      const id = entry.id || entry.symbol;
      if (seenIds.has(id)) return false;
      seenIds.add(id);
      return true;
    });
}

function getAttempts(stats = {}) {
  return (stats.correct ?? 0) + (stats.incorrect ?? 0);
}

function isExplicitlySeen(stats = {}) {
  return Boolean(stats.seen || stats.hasSeen || stats.firstSeenAt || stats.lastSeenAt || stats.introduced || stats.introducedAt);
}

function isExplicitlyMastered(stats = {}) {
  return Boolean(stats.mastered || stats.isMastered || stats.masteredAt || stats.masteryStage === 'mastered' || stats.masteryStage === 'learned');
}

function isDerivedMastered(stats = {}) {
  const attempts = getAttempts(stats);
  const correct = stats.correct ?? 0;
  const incorrect = stats.incorrect ?? 0;
  return attempts >= 5 && correct >= 4 && correct / Math.max(1, correct + incorrect) >= 0.8;
}

function getLetterProgress(player, languagePack) {
  const letters = getPracticeLetters(languagePack);
  const validIds = new Set(letters.map((letter) => letter.id || letter.symbol));
  const rawStats = player?.letters ?? {};
  const normalizedEntries = Object.entries(rawStats).filter(([id]) => validIds.size === 0 || validIds.has(id));

  const seen = normalizedEntries.filter(([, stats]) => isExplicitlySeen(stats) || getAttempts(stats) > 0).length;
  const practiced = normalizedEntries.filter(([, stats]) => getAttempts(stats) > 0).length;
  const mastered = normalizedEntries.filter(([, stats]) => isExplicitlyMastered(stats) || isDerivedMastered(stats)).length;
  const total = letters.length || Math.max(normalizedEntries.length, 1);

  return {
    seen,
    practiced,
    mastered,
    total,
    progressPercent: total > 0 ? clampPercent((mastered / total) * 100, seen > 0 ? 18 : 12) : 12
  };
}

function getDailyCounts(daily) {
  const tasks = Array.isArray(daily?.tasks) ? daily.tasks : [];
  const completed = tasks.filter((task) => task.completed).length;
  const total = tasks.length || 3;
  return { completed, total };
}

function getCurrentBridgePackSummary(t) {
  const allProgress = getAllWordProgress();
  const packSummaries = bridgeBuilderPacks.map((pack) => ({
    pack,
    progress: getPackProgress(pack, allProgress)
  }));

  const inProgressPack = packSummaries.find(({ progress }) => progress.wordsIntroducedCount > 0 && !progress.completed);
  const firstIncompletePack = packSummaries.find(({ progress }) => !progress.completed);
  const latestPlayedPack = [...packSummaries]
    .filter(({ progress }) => progress.lastPlayedAt)
    .sort((a, b) => String(b.progress.lastPlayedAt).localeCompare(String(a.progress.lastPlayedAt)))[0];

  const summary = inProgressPack || latestPlayedPack || firstIncompletePack || packSummaries[0];
  const pack = summary?.pack || bridgeBuilderPacks[0];
  const progress = summary?.progress || { totalWords: pack?.wordIds?.length || 0, wordsIntroducedCount: 0 };
  const localizedTitle = pack ? t(`packs.${pack.id}.title`, pack.title) : t('home.scenic.words.defaultPack', 'your word pack');
  const seen = progress.wordsIntroducedCount || 0;
  const total = progress.totalWords || pack?.wordIds?.length || 0;

  return {
    pack,
    title: localizedTitle,
    seen,
    total,
    progressPercent: total > 0 ? clampPercent((seen / total) * 100, 25) : 25,
    progressLine: t('home.scenic.words.wordsSeen', '{{seen}} of {{total}} words seen', {
      seen,
      total
    }),
    continueLine: t('home.scenic.words.continuePack', 'Continue {{pack}}', { pack: localizedTitle })
  };
}

/** Primary action for each journey stage. */
function getStageAction(stageId, { openGame, navigate }) {
  switch (stageId) {
    case 'letters':
      return () => openGame({ autostart: false });
    case 'words':
      return () => navigate('/bridge');
    case 'reading':
    case 'conversation':
    default:
      return () => navigate('/read');
  }
}

function findJourneyStage(journey, stageId) {
  return journey?.stages?.find((stage) => stage.id === stageId) ?? null;
}

export function getCurrentHomeStage({ player, statistics, journey }) {
  if (journey?.currentStageId) return journey.currentStageId;
  // Legacy fallback when journey state isn't available yet.
  const stage = getStageForUser(player, statistics);
  return STAGE_ORDER.includes(stage) ? stage : 'letters';
}

export function getHomeStateForStage({
  selectedStage,
  journey,
  player,
  statistics,
  languagePack,
  practiceLanguageName,
  t,
  openGame,
  navigate,
  onTestOut,
  onShowStageInfo
}) {
  const letterProgress = getLetterProgress(player, languagePack);
  const bridgePack = getCurrentBridgePackSummary(t);
  const currentStage = getCurrentHomeStage({ player, statistics, journey });
  const stageState = findJourneyStage(journey, selectedStage);
  const currentStageState = findJourneyStage(journey, currentStage);
  const infoAction = stageState && onShowStageInfo ? () => onShowStageInfo(selectedStage) : null;

  // Locked stage: show what it teaches, what it takes to unlock, and a way in.
  if (stageState && !stageState.unlocked) {
    return {
      kind: 'locked',
      selectedStage,
      currentStage,
      locked: true,
      lockedStage: stageState,
      image: STAGE_IMAGES[selectedStage],
      title: stageState.label,
      subtitle: t('home.scenic.lockedSubtitle', 'Locked · {{requirement}}', {
        requirement: stageState.requirement
      }),
      detail: stageState.progressLine,
      progress: Math.max(6, stageState.unlockProgress.percent),
      cta: currentStageState
        ? t('home.scenic.lockedCta', 'Keep going in {{stage}}', { stage: currentStageState.label })
        : t('home.scenic.common.continue', 'Continue'),
      action: getStageAction(currentStage, { openGame, navigate }),
      secondaryCta: onTestOut
        ? {
            label: t('home.scenic.testOut', 'Already know this? Test out'),
            action: () => onTestOut(selectedStage)
          }
        : null,
      infoAction
    };
  }

  if (selectedStage === 'letters') {
    return {
      kind: 'letters',
      selectedStage: 'letters',
      currentStage,
      image: STAGE_IMAGES.letters,
      title: t('home.scenic.letters.title', 'Letter River'),
      subtitle: t('home.scenic.letters.chooseLetters', 'Choose letters to practice'),
      detail: t('home.scenic.letters.progressSummary', 'Seen {{seen}} · Practiced {{practiced}} · Mastered {{mastered}}', {
        seen: letterProgress.seen,
        practiced: letterProgress.practiced,
        mastered: letterProgress.mastered
      }),
      progress: letterProgress.progressPercent,
      cta: t('home.scenic.common.continue', 'Continue'),
      action: getStageAction('letters', { openGame, navigate }),
      infoAction
    };
  }

  if (selectedStage === 'words') {
    return {
      kind: 'words',
      selectedStage: 'words',
      currentStage,
      image: STAGE_IMAGES.words,
      title: t('home.scenic.words.title', 'Bridge Builder'),
      subtitle: bridgePack.continueLine,
      detail: bridgePack.progressLine,
      progress: bridgePack.progressPercent,
      cta: t('home.scenic.common.continue', 'Continue'),
      currentPackTitle: bridgePack.title,
      action: getStageAction('words', { openGame, navigate }),
      infoAction
    };
  }

  if (selectedStage === 'reading') {
    // Stage progress toward conversation = reading scenes completed.
    const conversationState = findJourneyStage(journey, 'conversation');
    return {
      kind: 'reading',
      selectedStage: 'reading',
      currentStage,
      image: STAGE_IMAGES.reading,
      title: t('home.scenic.reading.title', 'Sentences & Reading'),
      subtitle: t('home.scenic.reading.subtitle', 'Read texts built from words you know'),
      detail: conversationState
        ? conversationState.progressLine
        : t('home.scenic.reading.detail', 'Sentence structure and guided reading'),
      progress: conversationState ? Math.max(10, conversationState.unlockProgress.percent) : 45,
      cta: t('home.scenic.common.continue', 'Continue'),
      currentPackTitle: bridgePack.title,
      action: getStageAction('reading', { openGame, navigate }),
      infoAction
    };
  }

  return {
    kind: 'conversation',
    selectedStage: 'conversation',
    currentStage,
    image: STAGE_IMAGES.conversation,
    title: t('home.scenic.conversation.title', 'Conversation'),
    subtitle: t('home.scenic.conversation.contextSubtitle', 'Practice words in context'),
    detail: t('home.scenic.conversation.contextDetail', 'Short dialogues and sentences'),
    progress: 72,
    cta: t('home.scenic.common.continue', 'Continue'),
    action: getStageAction('conversation', { openGame, navigate }),
    infoAction
  };
}

export function getHomePrimaryState(args) {
  const selectedStage = getCurrentHomeStage(args);
  return getHomeStateForStage({ ...args, selectedStage });
}

/**
 * Build the learning-path nodes from journey state.
 * Falls back to heuristic-only display when journey data is unavailable.
 */
export function getLearningPathItems(journey, selectedStage, t = (key, fallback) => fallback ?? key) {
  const currentStageId = journey?.currentStageId ?? 'letters';
  const currentIndex = Math.max(0, STAGE_ORDER.indexOf(currentStageId));

  return STAGE_ORDER.map((stageId, index) => {
    const stageState = findJourneyStage(journey, stageId);
    const unlocked = stageState ? stageState.unlocked : index <= currentIndex;
    const label = stageState?.label ?? t(`home.scenic.stages.${stageId}`, {
      letters: 'Letters',
      words: 'Words',
      reading: 'Sentences & Reading',
      conversation: 'Conversation'
    }[stageId]);

    let state;
    let status;
    let hint = '';
    if (!unlocked) {
      state = 'locked';
      status = t('home.scenic.lockedStatus', 'Locked');
      hint = stageState?.remainingLine ?? '';
    } else if (index < currentIndex) {
      state = 'complete';
      status = t('home.scenic.complete', 'Complete');
    } else if (index === currentIndex) {
      state = 'current';
      status = t('home.scenic.inProgress', 'In Progress');
    } else {
      state = 'available';
      status = t('home.scenic.available', 'Available');
    }

    return {
      stage: stageId,
      label,
      icon: stageState?.icon ?? {
        letters: 'waves',
        words: 'foundation',
        reading: 'menu_book',
        conversation: 'chat_bubble'
      }[stageId],
      status,
      hint,
      state,
      locked: !unlocked,
      isSelected: stageId === selectedStage,
      selectedLabel: t('home.scenic.selected', 'Selected'),
      ariaLabel: t('home.scenic.stageAria', 'Show {{label}} progress, {{status}}', { label, status })
    };
  });
}

/**
 * Today's Plan — a guided, three-beat session built from journey state:
 *   warm-up (due reviews) → core (current stage's next unit) → reinforce.
 *
 * Each row is labelled with a running "Step N · <phase>" tag and a plain-
 * language subtitle so the card reads as an ordered walkthrough of the app
 * rather than a list of unexplained mode names. Every string resolves through
 * a translation key that exists in the scenic-home dictionaries, so no English
 * copy leaks into other languages.
 */
export function getTodayPlanRows({ journey, primaryState, statistics, navigate, openGame, t }) {
  const currentStageId = journey?.currentStageId ?? primaryState?.currentStage ?? 'letters';
  const stageIndex = Math.max(0, STAGE_ORDER.indexOf(currentStageId));

  const rows = [];

  // ① Warm-up: spaced-repetition reviews that are due today.
  const srsDue = Number.isFinite(statistics?.dueToday) ? statistics.dueToday : 0;
  const wordReviewsDue = stageIndex >= 1 ? getDueReviewWordIds().length : 0;
  const reviewCount = srsDue + wordReviewsDue;
  if (reviewCount > 0) {
    rows.push({
      id: 'warmup-review',
      phase: 'warmup',
      icon: 'event_available',
      tone: 'green',
      title: t('home.scenic.dailyReview', 'Daily Review'),
      subtitle: t('home.scenic.itemsReady', '{{count}} items ready to review', { count: reviewCount }),
      action: wordReviewsDue > 0 ? () => navigate('/bridge') : () => openGame({ autostart: false })
    });
  }

  // ② Core: the next unit in the current journey stage. Subtitles say what the
  // mode teaches, not just what to tap.
  const coreByStage = {
    letters: {
      id: 'core-letter-river',
      icon: 'waves',
      title: t('home.scenic.letters.planTitle', 'Letter River Practice'),
      subtitle: t('home.scenic.letters.planSubtitle', 'Alphabet foundations'),
      action: () => openGame({ autostart: false })
    },
    words: {
      id: 'core-bridge-builder',
      icon: 'foundation',
      title: t('home.scenic.words.planTitle', 'Bridge Builder'),
      subtitle: t('home.scenic.words.planSubtitle', 'Strengthen your word set'),
      action: () => navigate('/bridge')
    },
    reading: {
      id: 'core-reading',
      icon: 'menu_book',
      title: t('home.scenic.reading.planTitle', 'Sentences & Reading'),
      subtitle: t('home.scenic.reading.planSubtitle', 'Read texts built from words you know'),
      action: () => navigate('/read')
    },
    conversation: {
      id: 'core-conversation',
      icon: 'chat_bubble',
      title: t('home.scenic.conversation.planTitle', 'Conversation Practice'),
      subtitle: t('home.scenic.conversation.planSubtitle', 'Practice both roles'),
      action: () => navigate('/read')
    }
  };
  rows.push({
    ...(coreByStage[currentStageId] ?? coreByStage.letters),
    phase: 'core',
    tone: 'blue'
  });

  // ③ Reinforce: strengthen earlier material. Deep Script once words are in
  // play; before that, daily quests keep beginners in the loop.
  if (stageIndex >= 1) {
    rows.push({
      id: 'reinforce-deep-script',
      phase: 'reinforce',
      icon: 'explore',
      tone: 'purple',
      title: t('home.scenic.deepScript.planTitle', 'Resume Deep Script'),
      subtitle: t('home.scenic.deepScript.planSubtitle', 'Continue your vocab run'),
      action: () => navigate('/deep-script')
    });
  } else {
    rows.push({
      id: 'reinforce-daily-quests',
      phase: 'reinforce',
      icon: 'task_alt',
      tone: 'purple',
      title: t('home.scenic.plan.questsTitle', 'Daily Quests'),
      subtitle: t('home.scenic.plan.questsSubtitle', 'Earn stars with today’s quests'),
      action: () => navigate('/daily')
    });
  }

  // Assign numbered, plain-language step tags in running order so the plan reads
  // as "do this, then this" instead of internal pedagogy jargon.
  const phaseLabels = {
    warmup: t('home.scenic.plan.warmup', 'Warm-up'),
    core: t('home.scenic.plan.core', 'Today’s focus'),
    reinforce: t('home.scenic.plan.reinforce', 'Reinforce')
  };
  return rows.map((row, index) => ({
    ...row,
    step: `${t('home.scenic.plan.step', 'Step {{n}}', { n: index + 1 })} · ${phaseLabels[row.phase]}`
  }));
}

export function getHomeStats({ statistics, streak, daily, t }) {
  const dailyCounts = getDailyCounts(daily);
  return [
    {
      id: 'review',
      icon: 'event_available',
      tone: 'green',
      title: t('home.scenic.dailyReview', 'Daily Review'),
      value: t('home.scenic.readyValue', '{{count}} ready', { count: statistics?.dueToday ?? 5 })
    },
    {
      id: 'streak',
      icon: 'local_fire_department',
      tone: 'orange',
      title: t('home.scenic.streak', 'Streak'),
      value: t('home.scenic.daysValue', '{{count}} days', { count: streak?.current || 12 })
    },
    {
      id: 'goal',
      icon: 'star',
      tone: 'purple',
      title: t('home.scenic.dailyGoal', 'Daily Goal'),
      value: t('home.scenic.todayValue', '{{completed}}/{{total}} today', dailyCounts)
    }
  ];
}
