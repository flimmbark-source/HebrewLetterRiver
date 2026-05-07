import { HOME_ASSETS } from './homeAssets.js';
import { getStageForUser } from '../../lib/progressTerms.js';

const STAGE_ORDER = ['letters', 'words', 'reading', 'conversation'];

function getLetterProgress(player) {
  const letterCount = Object.keys(player?.letters ?? {}).length;
  const learned = Math.max(0, letterCount);
  const total = 20;
  return {
    learned,
    total,
    percent: Math.max(12, Math.min(100, Math.round((learned / total) * 100)))
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

export function getCurrentHomeStage({ player, statistics }) {
  const stage = getStageForUser(player, statistics);
  if (stage === 'conversation') return 'conversation';
  if (stage === 'reading') return 'reading';
  if (stage === 'words' || hasRecentDeepScript(player)) return 'words';
  return 'letters';
}

export function getHomeStateForStage({ selectedStage, player, statistics, daily, openGame, navigate }) {
  const letterProgress = getLetterProgress(player);

  if (selectedStage === 'letters') {
    return {
      kind: 'letters',
      selectedStage: 'letters',
      currentStage: 'letters',
      image: HOME_ASSETS.cardLetters,
      title: 'First Letters',
      subtitle: `${letterProgress.learned || 6}/${letterProgress.total} letters learned`,
      detail: 'Next: practice א, ב, ג',
      progress: letterProgress.learned ? letterProgress.percent : 30,
      cta: 'Continue Letter River',
      action: () => openGame({ autostart: false })
    };
  }

  if (selectedStage === 'words') {
    const totalItems = statistics?.totalItems ?? 12;
    const matureItems = statistics?.matureItems ?? Math.min(8, totalItems);
    const percent = totalItems > 0 ? Math.round((matureItems / totalItems) * 100) : 42;

    return {
      kind: 'words',
      selectedStage: 'words',
      currentStage: 'words',
      image: HOME_ASSETS.cardLetters,
      title: 'Bridge Builder',
      subtitle: `Pack 3 · ${matureItems || 8}/${totalItems || 12} items learned`,
      detail: 'Next: strengthen your word set',
      progress: Math.max(20, Math.min(85, percent || 66)),
      cta: 'Continue Learning',
      action: () => navigate('/bridge')
    };
  }

  if (selectedStage === 'reading') {
    return {
      kind: 'deepScript',
      selectedStage: 'reading',
      currentStage: 'reading',
      image: HOME_ASSETS.cardDeepScript,
      title: 'Deep Script',
      subtitle: 'Dungeon vocabulary run',
      detail: 'Next: continue your script run',
      progress: 45,
      cta: 'Resume Deep Script',
      action: () => navigate('/deep-script')
    };
  }

  return {
    kind: 'conversation',
    selectedStage: 'conversation',
    currentStage: 'conversation',
    image: HOME_ASSETS.cardReading,
    title: 'Conversation Practice',
    subtitle: 'Cafe Talk',
    detail: 'Practice both roles in context',
    progress: 72,
    cta: 'Continue Conversation',
    action: () => navigate('/read')
  };
}

export function getHomePrimaryState({ player, statistics, daily, streak, openGame, navigate }) {
  const selectedStage = getCurrentHomeStage({ player, statistics });
  return getHomeStateForStage({ selectedStage, player, statistics, daily, streak, openGame, navigate });
}

export function getLearningPathItems(currentStage, selectedStage = currentStage) {
  const currentIndex = Math.max(0, STAGE_ORDER.indexOf(currentStage));

  return STAGE_ORDER.map((stage, index) => ({
    stage,
    label: {
      letters: 'Letters',
      words: 'Words',
      reading: 'Deep Script',
      conversation: 'Conversation'
    }[stage],
    icon: {
      letters: 'waves',
      words: 'landscape',
      reading: 'explore',
      conversation: 'chat_bubble'
    }[stage],
    status: index < currentIndex ? 'Complete' : index === currentIndex ? 'In Progress' : 'Upcoming',
    state: index < currentIndex ? 'complete' : index === currentIndex ? 'current' : 'upcoming',
    isSelected: stage === selectedStage
  }));
}

export function getTodayPlanRows({ primaryState, statistics, navigate, openGame }) {
  const reviewCount = statistics?.dueToday ?? 5;
  const reviewLabel = `${reviewCount || 5} items ready to review`;
  const rows = [
    {
      id: 'review',
      icon: 'event_available',
      tone: 'green',
      title: 'Today’s Review',
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
        title: 'Letter River Practice',
        subtitle: 'Alphabet foundations',
        action: () => openGame({ autostart: false })
      },
      {
        id: 'deep-script-locked',
        icon: 'explore',
        tone: 'purple',
        title: 'Deep Script',
        subtitle: 'Unlocks after words',
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
        title: 'Resume Deep Script',
        subtitle: 'Continue your vocab run',
        action: () => navigate('/deep-script')
      },
      {
        id: 'bridge-builder',
        icon: 'foundation',
        tone: 'purple',
        title: 'Bridge Builder',
        subtitle: 'Strengthen your word set',
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
        title: 'Conversation Practice',
        subtitle: 'Practice both roles',
        action: () => navigate('/read')
      },
      {
        id: 'reading-review',
        icon: 'menu_book',
        tone: 'purple',
        title: 'Reading Review',
        subtitle: 'Revisit Cafe Talk',
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
      title: 'Bridge Builder',
      subtitle: 'Strengthen your word set',
      action: () => navigate('/bridge')
    },
    {
      id: 'deep-script',
      icon: 'explore',
      tone: 'purple',
      title: 'Deep Script',
      subtitle: 'Practice words in a dungeon run',
      action: () => navigate('/deep-script')
    }
  );

  return rows;
}

export function getHomeStats({ statistics, streak, daily }) {
  const dailyCounts = getDailyCounts(daily);
  return [
    {
      id: 'review',
      icon: 'event_available',
      tone: 'green',
      title: 'Daily Review',
      value: `${statistics?.dueToday ?? 5} ready`
    },
    {
      id: 'streak',
      icon: 'local_fire_department',
      tone: 'orange',
      title: 'Streak',
      value: `${streak?.current || 12} days`
    },
    {
      id: 'goal',
      icon: 'star',
      tone: 'purple',
      title: 'Daily Goal',
      value: `${dailyCounts.completed}/${dailyCounts.total} today`
    }
  ];
}
