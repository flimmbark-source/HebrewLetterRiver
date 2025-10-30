import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import badgesCatalog from '../data/badges.json';
import dailyTemplates from '../data/dailyTemplates.json';
import { letters, letterMap } from '../data/letters.js';
import { on } from '../lib/eventBus.js';
import { celebrate } from '../lib/celebration.js';
import { loadState, saveState } from '../lib/storage.js';
import { differenceInJerusalemDays, getJerusalemDateKey, millisUntilNextJerusalemMidnight } from '../lib/time.js';
import { useToast } from './ToastContext.jsx';

const ProgressContext = createContext(null);

const badgeSpecById = badgesCatalog.reduce((acc, badge) => {
  acc[badge.id] = badge;
  return acc;
}, {});

const defaultPlayer = {
  name: 'River Explorer',
  stars: 0,
  totals: {
    sessions: 0,
    perfectCatches: 0,
    bonusCatches: 0
  },
  letters: {},
  latestBadge: null
};

const defaultBadges = badgesCatalog.reduce((acc, badge) => {
  acc[badge.id] = { tier: 0, progress: 0 };
  return acc;
}, {});

const defaultStreak = {
  current: 0,
  best: 0,
  lastPlayedDateKey: null
};

const spiceConstraints = [
  { id: 'expert-mode', label: 'Expert Mode run', predicate: (session) => session?.settings?.mode === 'expert' },
  { id: 'fast-flow', label: 'Fast Flow speed (18+)', predicate: (session) => (session?.settings?.speed ?? 0) >= 18 },
  { id: 'no-intros', label: 'No Introductions enabled', predicate: (session) => session?.settings?.introductions === false }
];

function getWeakestLetter(letterStats) {
  const entries = Object.entries(letterStats ?? {});
  if (entries.length === 0) {
    return { hebrew: letters[0].hebrew, name: letters[0].name };
  }
  let weakest = entries[0][0];
  let weakestScore = Infinity;
  entries.forEach(([symbol, stats]) => {
    const total = (stats.correct ?? 0) + (stats.incorrect ?? 0);
    if (total === 0) return;
    const accuracy = (stats.correct ?? 0) / total;
    const penalty = total < 3 ? accuracy + 0.15 : accuracy;
    if (penalty < weakestScore) {
      weakestScore = penalty;
      weakest = symbol;
    }
  });
  const info = letterMap[weakest] ?? { hebrew: weakest, name: weakest };
  return info;
}

function pickConstraint() {
  return spiceConstraints[Math.floor(Math.random() * spiceConstraints.length)];
}

function hydratePlayer() {
  const stored = loadState('player', null);
  if (!stored) return { ...defaultPlayer };
  return {
    ...defaultPlayer,
    ...stored,
    totals: { ...defaultPlayer.totals, ...(stored.totals ?? {}) },
    letters: stored.letters ?? {},
    latestBadge: stored.latestBadge ?? null
  };
}

function hydrateBadges() {
  const stored = loadState('badges', null);
  if (!stored) return { ...defaultBadges };
  const hydrated = { ...defaultBadges };
  Object.keys(stored).forEach((key) => {
    hydrated[key] = { ...defaultBadges[key], ...stored[key] };
  });
  return hydrated;
}

function hydrateStreak() {
  const stored = loadState('streak', null);
  if (!stored) return { ...defaultStreak };
  return { ...defaultStreak, ...stored };
}

function hydrateDaily(focusLetter, constraint) {
  const todayKey = getJerusalemDateKey();
  const stored = loadState('daily', null);
  if (stored && stored.dateKey === todayKey) {
    return stored;
  }
  return generateDaily(todayKey, focusLetter, constraint);
}

function generateDaily(dateKey, focusLetterInfo, constraint) {
  const focusLetter = focusLetterInfo ?? getWeakestLetter({});
  const selectedConstraint = constraint ?? pickConstraint();
  const tasks = dailyTemplates.map((template) => {
    if (template.id === 'focus') {
      const label = `${focusLetter.hebrew} · ${focusLetter.name}`;
      return {
        ...template,
        description: template.description.replace('{{letter}}', label),
        progress: 0,
        meta: { letter: focusLetter.hebrew },
        completed: false
      };
    }
    if (template.id === 'spice') {
      return {
        ...template,
        description: template.description.replace('{{constraint}}', selectedConstraint.label),
        progress: 0,
        meta: { constraintId: selectedConstraint.id },
        completed: false
      };
    }
    return { ...template, progress: 0, completed: false };
  });
  return {
    dateKey,
    tasks,
    completed: false,
    completedAt: null
  };
}

export function ProgressProvider({ children }) {
  const { addToast } = useToast();
  const [player, setPlayer] = useState(() => hydratePlayer());
  const [badges, setBadges] = useState(() => hydrateBadges());
  const [streak, setStreak] = useState(() => hydrateStreak());
  const [daily, setDaily] = useState(() => hydrateDaily(getWeakestLetter(player.letters), pickConstraint()));
  const [lastSession, setLastSession] = useState(null);

  useEffect(() => {
    saveState('player', player);
  }, [player]);

  useEffect(() => {
    saveState('badges', badges);
  }, [badges]);

  useEffect(() => {
    saveState('streak', streak);
  }, [streak]);

  useEffect(() => {
    saveState('daily', daily);
  }, [daily]);

  useEffect(() => {
    const key = getJerusalemDateKey();
    if (daily.dateKey !== key) {
      const weakest = getWeakestLetter(player.letters);
      setDaily(generateDaily(key, weakest, pickConstraint()));
    }
    const timeout = setTimeout(() => {
      const weakest = getWeakestLetter(player.letters);
      setDaily(generateDaily(getJerusalemDateKey(), weakest, pickConstraint()));
    }, millisUntilNextJerusalemMidnight());
    return () => clearTimeout(timeout);
  }, [daily.dateKey, player.letters]);

  function updateStreakForSession(dateKey) {
    let shouldAdvanceBadge = false;
    setStreak((prev) => {
      if (prev.lastPlayedDateKey === dateKey) return prev;
      const diff = prev.lastPlayedDateKey ? differenceInJerusalemDays(prev.lastPlayedDateKey, dateKey) : null;
      let current = 1;
      if (diff === 1) {
        current = prev.current + 1;
        shouldAdvanceBadge = true;
      } else {
        current = 1;
        shouldAdvanceBadge = prev.lastPlayedDateKey === null;
      }
      const best = Math.max(prev.best, current);
      return {
        current,
        best,
        lastPlayedDateKey: dateKey
      };
    });
    if (shouldAdvanceBadge) trackBadgeProgress('steady-streak', 1);
  }

  function trackBadgeProgress(badgeId, delta = 1) {
    const badgeSpec = badgeSpecById[badgeId];
    if (!badgeSpec) return;
    let earnedTier = null;
    setBadges((prev) => {
      const current = prev[badgeId] ?? { tier: 0, progress: 0 };
      let tier = current.tier;
      let progress = current.progress + delta;
      const result = { ...prev };
      while (tier < badgeSpec.tiers.length) {
        const target = badgeSpec.tiers[tier].goal;
        if (progress >= target) {
          progress -= target;
          tier += 1;
          earnedTier = badgeSpec.tiers[tier - 1];
        } else {
          break;
        }
      }
      if (tier >= badgeSpec.tiers.length) {
        progress = badgeSpec.tiers[badgeSpec.tiers.length - 1].goal;
      }
      result[badgeId] = { tier, progress };
      return result;
    });
    if (earnedTier) {
      setPlayer((prev) => ({
        ...prev,
        stars: prev.stars + (earnedTier.stars ?? 0),
        latestBadge: {
          id: badgeId,
          tier: earnedTier.tier,
          label: earnedTier.label,
          earnedAt: new Date().toISOString()
        }
      }));
      addToast({
        tone: 'success',
        title: `${badgeSpecById[badgeId].name} · ${earnedTier.label}`,
        description: `Tier ${earnedTier.tier} unlocked! +${earnedTier.stars} ⭐`,
        icon: '🏅'
      });
      celebrate();
    }
  }

  function markDailyProgress(predicate) {
    setDaily((prev) => {
      if (!prev) return prev;
      const tasks = prev.tasks.map((task) => {
        if (task.completed) return task;
        if (!predicate(task)) return task;
        const nextProgress = Math.min(task.goal, (task.progress ?? 0) + 1);
        return {
          ...task,
          progress: nextProgress,
          completed: nextProgress >= task.goal
        };
      });
      const completed = tasks.every((task) => task.completed);
      const completedAt = completed && !prev.completed ? new Date().toISOString() : prev.completedAt;
      const nextDaily = { ...prev, tasks, completed, completedAt: completed ? completedAt : prev.completedAt };
      if (completed && !prev.completed) {
        addToast({
          tone: 'success',
          title: 'Daily Quest Complete',
          description: 'You cleared all three quests today! 🌊',
          icon: '🎉'
        });
        celebrate({ particleCount: 120 });
      }
      return nextDaily;
    });
  }

  useEffect(() => {
    const offSessionStart = on('game:session-start', (payload) => {
      setLastSession({ start: new Date().toISOString(), settings: payload?.settings ?? {}, mode: payload?.mode });
    });
    const offSessionComplete = on('game:session-complete', (payload) => {
      const dateKey = getJerusalemDateKey();
      updateStreakForSession(dateKey);
      setPlayer((prev) => ({
        ...prev,
        totals: {
          ...prev.totals,
          sessions: prev.totals.sessions + 1,
          bonusCatches: prev.totals.bonusCatches + (payload?.bonusCaught ?? 0)
        }
      }));
      trackBadgeProgress('first-flow', 1);
      markDailyProgress((task) => task.id === 'warmup');
      markDailyProgress((task) => {
        if (task.id !== 'spice') return false;
        const constraint = spiceConstraints.find((c) => c.id === task.meta?.constraintId);
        return constraint?.predicate(payload);
      });
    });
    const offLetter = on('game:letter-result', (payload) => {
      if (!payload) return;
      setPlayer((prev) => {
        const current = prev.letters[payload.hebrew] ?? { correct: 0, incorrect: 0 };
        return {
          ...prev,
          letters: {
            ...prev.letters,
            [payload.hebrew]: {
              correct: current.correct + (payload.correct ? 1 : 0),
              incorrect: current.incorrect + (!payload.correct ? 1 : 0)
            }
          },
          totals: {
            ...prev.totals,
            perfectCatches: prev.totals.perfectCatches + (payload.correct ? 1 : 0)
          }
        };
      });
      if (payload.correct) {
        trackBadgeProgress('letter-master', 1);
        markDailyProgress((task) => task.id === 'focus' && task.meta?.letter === payload.hebrew);
      }
    });
    const offBonus = on('game:bonus-catch', () => {
      trackBadgeProgress('gem-chaser', 1);
    });
    return () => {
      offSessionStart();
      offSessionComplete();
      offLetter();
      offBonus();
    };
  }, [streak.current]);

  const value = useMemo(
    () => ({
      player,
      badges,
      streak,
      daily,
      setDaily,
      getWeakestLetter: () => getWeakestLetter(player.letters),
      lastSession
    }),
    [player, badges, streak, daily, lastSession]
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider');
  return ctx;
}
