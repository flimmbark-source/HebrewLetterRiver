import { HOME_ASSETS } from './homeAssets.js';
import { getStageForUser } from '../../lib/progressTerms.js';
import { bridgeBuilderPacks } from '../../data/bridgeBuilderPacks.js';
import { getAllWordProgress, getPackProgress } from '../../lib/bridgeBuilderStorage.js';

const STAGE_ORDER = ['letters', 'words', 'reading', 'conversation'];

function clampPercent(value, fallback = 30) {
  const numeric = Number.isFinite(value) ? value : fallback;
  return Math.max(12, Math.min(100, Math.round(numeric)));
}

function getPracticeLetters(languagePack) {
  const consonants = Array.isArray(languagePack?.consonants) ? languagePack.consonants : [];
  const vowels = Array.isArray(languagePack?.vowels?.markers) ? languagePack.vowels.markers : [];
  return [...consonants, ...vowels].filter((entry) => entry?.id || entry?.symbol);
}

function getLetterProgress(player, languagePack) {
  const letters = getPracticeLetters(languagePack);
  const learnedIds = new Set(Object.keys(player?.letters ?? {}));
  const learned = letters.length > 0
    ? letters.filter((letter) => learnedIds.has(letter.id)).length
    : learnedIds.size;
  const total = letters.length || Math.max(learned, 1);

  return {
    learned,
    total,
    symbols: letters.slice(0, 3).map((letter) => letter.symbol || letter.name || letter.id).join(', '),
    percent: clampPercent(total > 0 ? (learned / total) * 100 : 0)
  };
}

function getDailyCounts(daily) {
  const tasks = Array.isArray(daily?.tasks) ? daily.tasks : [];
  const completed = tasks.filter((task) => task.completed).length;
  const total = tasks.length || 3;
  return { completed, total };
}

function getRecentModeIds(player) {
  return player?.recentModesPlayed ?? player?.modesPlayed ?? [];
}

function hasRecentDeepScript(player) {
  return getRecentModeIds(player)
    .slice(-4)
    .some((mode) => mode === 'deep_script' || mode === 'deepScript' || mode === 'Deep Script');
}

function stageStatusKey(index, currentIndex) {
  if (index < currentIndex) return 'complete';
  if (index === currentIndex) return 'inProgress';
  return 'available';
}

function stageState(index, currentIndex) {
  if (index < currentIndex) return 'complete';
  if (index === currentIndex) return 'current';
  return 'available';
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
  const progress = summary?.progress || { wordsLearnedCount: 0, totalWords: pack?.wordIds?.length || 0, wordsIntroducedCount: 0 };
  const localizedTitle = pack ? t(`packs.${pack.id}.title`, pack.title) : t('home.scenic.words.defaultPack', 'your word pack');
  const learned = progress.wordsLearnedCount || 0;
  const total = progress.totalWords || pack?.wordIds?.length || 0;

  return {
    pack,
    title: localizedTitle,
    learned,
    total,
    introduced: progress.wordsIntroducedCount || 0,
    progressPercent: total > 0 ? clampPercent((learned / total) * 100, 25) : 25,
    progressLine: t('home.scenic.words.packProgress', '{{learned}} of {{total}} words learned', {
      learned,
      total
    }),
    continueLine: t('home.scenic.words.continuePack', 'Continue {{pack}}', { pack: localizedTitle })
  };
}

export function getCurrentHomeStage({ player, statistics }) {
  const stage = getStageForUser(player, statistics);
  if (stage === 'conversation') return 'conversation';
  if (stage === 'reading') return 'reading';
  if (stage === 'words' || hasRecentDeepScript(player)) return 'words';
  return 'letters';
}

export function getHomeStateForStage({
  selectedStage,
  player,
  statistics,
  languagePack,
  practiceLanguageName,
  t,
  openGame,
  navigate
}) {
  const letterProgress = getLetterProgress(player, languagePack);
  const language = practiceLanguageName || languagePack?.name || '';
  const bridgePack = getCurrentBridgePackSummary(t);

  if (selectedStage === 'letters') {
    return {
      kind: 'letters',
      selectedStage: 'letters',
      currentStage: 'letters',
      image: HOME_ASSETS.cardLetters,
      title: t('home.scenic.letters.title', 'Letter River'),
      subtitle: t('home.scenic.letters.practiceReady', '{{count}} letters ready to practice', {
        count: Math.max(1, Math.min(3, letterProgress.total - letterProgress.learned || 3))
      }),
      detail: t('home.scenic.letters.progress', '{{learned}} of {{total}} letters learned', {
        learned: letterProgress.learned,
        total: letterProgress.total,
        language
      }),
      progress: letterProgress.learned ? letterProgress.percent : 30,
      cta: t('home.scenic.common.continue', 'Continue'),
      action: () => openGame({ autostart: false })
    };
  }

  if (selectedStage === 'words') {
    return {
      kind: 'words',
      selectedStage: 'words',
      currentStage: 'words',
      image: HOME_ASSETS.cardBridgeBuilder,
      title: t('home.scenic.words.title', 'Bridge Builder'),
      subtitle: bridgePack.continueLine,
      detail: bridgePack.progressLine,
      progress: bridgePack.progressPercent,
      cta: t('home.scenic.common.continue', 'Continue'),
      currentPackTitle: bridgePack.title,
      action: () => navigate('/bridge')
    };
  }

  if (selectedStage === 'reading') {
    return {
      kind: 'deepScript',
      selectedStage: 'reading',
      currentStage: 'reading',
      image: HOME_ASSETS.cardDeepScript,
      title: t('home.scenic.deepScript.title', 'Deep Script'),
      subtitle: t('home.scenic.deepScript.packWordsReady', 'Words from {{pack}} are ready', { pack: bridgePack.title }),
      detail: t('home.scenic.deepScript.challengePackWords', 'Challenge pack words'),
      progress: 45,
      cta: t('home.scenic.deepScript.cta', 'Start challenge'),
      currentPackTitle: bridgePack.title,
      action: () => navigate('/deep-script')
    };
  }

  return {
    kind: 'conversation',
    selectedStage: 'conversation',
    currentStage: 'conversation',
    image: HOME_ASSETS.cardReading,
    title: t('home.scenic.conversation.title', 'Conversation Practice'),
    subtitle: t('home.scenic.conversation.planSubtitle', 'Practice both roles'),
    detail: t('home.scenic.conversation.detail', 'Practice both roles in context'),
    progress: 72,
    cta: t('home.scenic.common.continue', 'Continue'),
    action: () => navigate('/read')
  };
}

export function getHomePrimaryState(args) {
  const selectedStage = getCurrentHomeStage(args);
  return getHomeStateForStage({ ...args, selectedStage });
}

export function getLearningPathItems(currentStage, selectedStage = currentStage, t = (key, fallback) => fallback ?? key) {
  const currentIndex = Math.max(0, STAGE_ORDER.indexOf(currentStage));

  return STAGE_ORDER.map((stage, index) => {
    const statusKey = stageStatusKey(index, currentIndex);
    const labelKey = stage === 'reading' ? 'deepScript' : stage;
    const status = t(`home.scenic.${statusKey}`, {
      complete: 'Complete',
      inProgress: 'In Progress',
      available: 'Available'
    }[statusKey]);
    const label = t(`home.scenic.stages.${labelKey}`, {
      letters: 'Letters',
      words: 'Words',
      deepScript: 'Deep Script',
      conversation: 'Conversation'
    }[labelKey]);

    return {
      stage,
      label,
      icon: {
        letters: 'waves',
        words: 'landscape',
        reading: 'explore',
        conversation: 'chat_bubble'
      }[stage],
      status,
      state: stageState(index, currentIndex),
      isSelected: stage === selectedStage,
      selectedLabel: t('home.scenic.selected', 'Selected'),
      ariaLabel: t('home.scenic.stageAria', 'Show {{label}} progress, {{status}}', { label, status })
    };
  });
}

export function getTodayPlanRows({ primaryState, statistics, navigate, openGame, t }) {
  const reviewCount = statistics?.dueToday ?? 5;
  const bridgePack = getCurrentBridgePackSummary(t);
  const rows = [
    {
      id: 'review',
      icon: 'event_available',
      tone: 'green',
      title: t('home.scenic.dailyReview', 'Daily Review'),
      subtitle: t('home.scenic.reviewDueToday', '{{count}} due today', { count: reviewCount || 0 }),
      action: () => navigate('/daily')
    }
  ];

  if (primaryState.kind === 'letters') {
    rows.push(
      {
        id: 'letter-river',
        icon: 'waves',
        tone: 'blue',
        title: t('home.scenic.letters.planTitle', 'Letter River'),
        subtitle: t('home.scenic.letters.practiceNext', 'Practice next letters'),
        action: () => openGame({ autostart: false })
      },
      {
        id: 'bridge-builder',
        icon: 'foundation',
        tone: 'purple',
        title: t('home.scenic.words.planTitle', 'Bridge Builder'),
        subtitle: bridgePack.continueLine,
        action: () => navigate('/bridge')
      }
    );
    return rows;
  }

  if (primaryState.kind === 'deepScript') {
    rows.push(
      {
        id: 'deep-script',
        icon: 'explore',
        tone: 'blue',
        title: t('home.scenic.deepScript.planTitle', 'Deep Script'),
        subtitle: t('home.scenic.deepScript.challengePackWords', 'Challenge pack words'),
        action: () => navigate('/deep-script')
      },
      {
        id: 'bridge-builder',
        icon: 'foundation',
        tone: 'purple',
        title: t('home.scenic.words.planTitle', 'Bridge Builder'),
        subtitle: bridgePack.continueLine,
        action: () => navigate('/bridge')
      }
    );
    return rows;
  }

  if (primaryState.kind === 'conversation') {
    rows.push(
      {
        id: 'conversation',
        icon: 'chat_bubble',
        tone: 'blue',
        title: t('home.scenic.conversation.planTitle', 'Conversation Practice'),
        subtitle: t('home.scenic.conversation.planSubtitle', 'Practice both roles'),
        action: () => navigate('/read')
      },
      {
        id: 'reading-review',
        icon: 'menu_book',
        tone: 'purple',
        title: t('home.scenic.conversation.reviewTitle', 'Reading Review'),
        subtitle: t('home.scenic.conversation.reviewSubtitle', 'Review contextual reading'),
        action: () => navigate('/read')
      }
    );
    return rows;
  }

  rows.push(
    {
      id: 'bridge-builder',
      icon: 'foundation',
      tone: 'blue',
      title: t('home.scenic.words.planTitle', 'Bridge Builder'),
      subtitle: bridgePack.continueLine,
      action: () => navigate('/bridge')
    },
    {
      id: 'deep-script',
      icon: 'explore',
      tone: 'purple',
      title: t('home.scenic.deepScript.title', 'Deep Script'),
      subtitle: t('home.scenic.deepScript.challengePackWords', 'Challenge pack words'),
      action: () => navigate('/deep-script')
    }
  );

  return rows;
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
