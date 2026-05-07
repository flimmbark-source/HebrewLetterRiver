import { HOME_ASSETS } from './homeAssets.js';
import { getStageForUser } from '../../lib/progressTerms.js';

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
  return 'upcoming';
}

function stageState(index, currentIndex) {
  if (index < currentIndex) return 'complete';
  if (index === currentIndex) return 'current';
  return 'upcoming';
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
  const totalItems = statistics?.totalItems ?? 12;
  const matureItems = statistics?.matureItems ?? Math.min(8, totalItems);
  const wordPercent = totalItems > 0 ? (matureItems / totalItems) * 100 : 42;

  if (selectedStage === 'letters') {
    return {
      kind: 'letters',
      selectedStage: 'letters',
      currentStage: 'letters',
      image: HOME_ASSETS.cardLetters,
      title: t('home.scenic.letters.title', 'First Letters'),
      subtitle: t('home.scenic.letters.subtitle', '{{learned}}/{{total}} {{language}} letters learned', {
        learned: letterProgress.learned,
        total: letterProgress.total,
        language
      }),
      detail: t('home.scenic.letters.detail', 'Next: practice {{symbols}}', {
        symbols: letterProgress.symbols || 'A, B, C'
      }),
      progress: letterProgress.learned ? letterProgress.percent : 30,
      cta: t('home.scenic.letters.cta', 'Continue Letter River'),
      action: () => openGame({ autostart: false })
    };
  }

  if (selectedStage === 'words') {
    return {
      kind: 'words',
      selectedStage: 'words',
      currentStage: 'words',
      image: HOME_ASSETS.cardLetters,
      title: t('home.scenic.words.title', 'Bridge Builder'),
      subtitle: t('home.scenic.words.subtitle', 'Pack 3 · {{learned}}/{{total}} {{language}} items learned', {
        learned: matureItems || 8,
        total: totalItems || 12,
        language
      }),
      detail: t('home.scenic.words.detail', 'Next: strengthen your word set'),
      progress: clampPercent(wordPercent, 66),
      cta: t('home.scenic.words.cta', 'Continue Learning'),
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
      subtitle: t('home.scenic.deepScript.subtitle', '{{language}} vocabulary run', { language }),
      detail: t('home.scenic.deepScript.detail', 'Next: continue your script run'),
      progress: 45,
      cta: t('home.scenic.deepScript.cta', 'Resume Deep Script'),
      action: () => navigate('/deep-script')
    };
  }

  return {
    kind: 'conversation',
    selectedStage: 'conversation',
    currentStage: 'conversation',
    image: HOME_ASSETS.cardReading,
    title: t('home.scenic.conversation.title', 'Conversation Practice'),
    subtitle: t('home.scenic.conversation.subtitle', '{{language}} Cafe Talk', { language }),
    detail: t('home.scenic.conversation.detail', 'Practice both roles in context'),
    progress: 72,
    cta: t('home.scenic.conversation.cta', 'Continue Conversation'),
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
      upcoming: 'Upcoming'
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
  const reviewLabel = t('home.scenic.itemsReady', '{{count}} items ready to review', { count: reviewCount || 5 });
  const rows = [
    {
      id: 'review',
      icon: 'event_available',
      tone: 'green',
      title: t('home.scenic.dailyReview', 'Daily Review'),
      subtitle: reviewLabel,
      action: () => openGame({ autostart: false })
    }
  ];

  if (primaryState.kind === 'letters') {
    rows.push(
      {
        id: 'letter-river',
        icon: 'waves',
        tone: 'blue',
        title: t('home.scenic.letters.planTitle', 'Letter River Practice'),
        subtitle: t('home.scenic.letters.planSubtitle', 'Alphabet foundations'),
        action: () => openGame({ autostart: false })
      },
      {
        id: 'deep-script-locked',
        icon: 'explore',
        tone: 'purple',
        title: t('home.scenic.deepScript.title', 'Deep Script'),
        subtitle: t('home.scenic.deepScript.lockedSubtitle', 'Unlocks after words'),
        locked: true
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
        title: t('home.scenic.deepScript.planTitle', 'Resume Deep Script'),
        subtitle: t('home.scenic.deepScript.planSubtitle', 'Continue your vocab run'),
        action: () => navigate('/deep-script')
      },
      {
        id: 'bridge-builder',
        icon: 'foundation',
        tone: 'purple',
        title: t('home.scenic.words.planTitle', 'Bridge Builder'),
        subtitle: t('home.scenic.words.planSubtitle', 'Strengthen your word set'),
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
        subtitle: t('home.scenic.conversation.reviewSubtitle', 'Revisit Cafe Talk'),
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
      subtitle: t('home.scenic.words.planSubtitle', 'Strengthen your word set'),
      action: () => navigate('/bridge')
    },
    {
      id: 'deep-script',
      icon: 'explore',
      tone: 'purple',
      title: t('home.scenic.deepScript.title', 'Deep Script'),
      subtitle: t('home.scenic.deepScript.planSubtitle', 'Continue your vocab run'),
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
