import React, { createContext, useContext, useEffect, useMemo, useState, useCallback, useRef } from 'react';
import badgesCatalog from '../data/badges.json';
import dailyTemplates from '../data/dailyTemplates.json';
import { emit, on } from '../lib/eventBus.js';
import { celebrate } from '../lib/celebration.js';
import { loadState, saveState, removeState } from '../lib/storage.js';
import { differenceInJerusalemDays, getJerusalemDateKey, millisUntilNextJerusalemMidnight } from '../lib/time.js';
import { useToast } from './ToastContext.jsx';
import { useLocalization } from './LocalizationContext.jsx';

export const STAR_LEVEL_SIZE = 50;
export const DAILY_REWARD_STARS = 30;

function distributeRewardStars(total, count) {
  if (!Number.isFinite(total) || total <= 0 || !Number.isFinite(count) || count <= 0) {
    return new Array(Math.max(0, count)).fill(0);
  }
  const base = Math.floor(total / count);
  const remainder = total - base * count;
  return Array.from({ length: count }, (_, index) => base + (index < remainder ? 1 : 0));
}

const ProgressContext = createContext(null);

function toLetterInfo(item) {
  if (!item) return null;
  return {
    id: item.id,
    hebrew: item.symbol ?? item.id,
    name: item.name ?? item.id,
    sound: item.sound ?? ''
  };
}

const badgeSpecById = badgesCatalog.reduce((acc, badge) => {
  acc[badge.id] = badge;
  return acc;
}, {});

function calculateLevelInfo(totalStars) {
  const total = Math.max(0, Math.floor(Number.isFinite(totalStars) ? totalStars : 0));
  const level = Math.floor(total / STAR_LEVEL_SIZE) + 1;
  const levelProgress = total % STAR_LEVEL_SIZE;
  return { level, levelProgress, total };
}

const defaultPlayer = {
  name: 'River Explorer',
  stars: 0,
  level: 1,
  levelProgress: 0,
  totalStarsEarned: 0,
  totals: {
    sessions: 0,
    perfectCatches: 0,
    bonusCatches: 0
  },
  letters: {},
  latestBadge: null
};

const defaultBadges = badgesCatalog.reduce((acc, badge) => {
  acc[badge.id] = { tier: 0, progress: 0, unclaimed: [] };
  return acc;
}, {});

const defaultStreak = {
  current: 0,
  best: 0,
  lastPlayedDateKey: null
};

function createLanguageAssets(languagePack, localization = {}) {
  const { t: translateFn } = localization ?? {};
  const translate = typeof translateFn === 'function' ? translateFn : null;

  function translateKey(key, fallback, replacements = {}) {
    if (!key) return fallback ?? '';
    if (translate) {
      const result = translate(key, replacements);
      if (result && result !== key) {
        return result;
      }
    }
    return fallback ?? (typeof key === 'string' ? key : '');
  }
  const baseLanguageItems = languagePack.items ?? [];
  const allLanguageItems = languagePack.allItems ?? baseLanguageItems;
  const itemsById = languagePack.itemsById ?? {};
  const itemsBySymbol = languagePack.itemsBySymbol ?? {};
  const fallbackLetterInfo =
    toLetterInfo(baseLanguageItems[0] ?? allLanguageItems[0]) ?? { id: null, hebrew: '', name: '', sound: '' };

  function getWeakestLetter(letterStats) {
    const entries = Object.entries(letterStats ?? {});
    if (entries.length === 0) {
      return fallbackLetterInfo;
    }
    let weakest = entries[0][0];
    let weakestScore = Infinity;
    entries.forEach(([itemId, stats]) => {
      const total = (stats.correct ?? 0) + (stats.incorrect ?? 0);
      if (total === 0) return;
      const accuracy = (stats.correct ?? 0) / total;
      const penalty = total < 3 ? accuracy + 0.15 : accuracy;
      if (penalty < weakestScore) {
        weakestScore = penalty;
        weakest = itemId;
      }
    });
    const info = toLetterInfo(itemsById[weakest] ?? itemsBySymbol[weakest]) ?? fallbackLetterInfo;
    return info;
  }

  function normalizeLetterStats(rawStats) {
    const normalized = {};
    Object.entries(rawStats ?? {}).forEach(([key, value]) => {
      if (!value) return;
      const target = { correct: value.correct ?? 0, incorrect: value.incorrect ?? 0 };
      if (itemsById[key]) {
        normalized[key] = target;
        return;
      }
      const symbolMatch = itemsBySymbol[key];
      if (symbolMatch?.id) {
        const existing = normalized[symbolMatch.id] ?? { correct: 0, incorrect: 0 };
        normalized[symbolMatch.id] = {
          correct: existing.correct + target.correct,
          incorrect: existing.incorrect + target.incorrect
        };
      }
    });
    return normalized;
  }

  function getConstraintLabel(constraintId) {
    const constraint = spiceConstraints.find((item) => item.id === constraintId);
    if (!constraint) return constraintId;
    return translateKey(constraint.labelKey, constraint.fallbackLabel);
  }

  function normalizeDailyData(daily) {
    if (!daily?.tasks) return daily;
    const totalReward = Number.isFinite(daily.rewardStars) ? daily.rewardStars : DAILY_REWARD_STARS;
    const rewardDistribution = distributeRewardStars(totalReward, daily.tasks.length);
    const tasks = daily.tasks.map((task, index) => {
      let nextTask = task;
      if (task.id === 'focus' && task.meta?.letter) {
        const original = task.meta.letter;
        const itemId = itemsById[original] ? original : itemsBySymbol[original]?.id ?? original;
        if (itemId !== original) {
          nextTask = { ...task, meta: { ...task.meta, letter: itemId } };
        }
      }

      const template = dailyTemplates.find((entry) => entry.id === task.id) ?? {};
      const translation = nextTask.translation ?? {};
      const titleKey = translation.titleKey ?? template.titleKey ?? null;
      const descriptionKey = translation.descriptionKey ?? template.descriptionKey ?? null;
      let replacements = { ...(translation.replacements ?? {}) };

      if (nextTask.id === 'focus') {
        const letterId = nextTask.meta?.letter;
        let info = null;
        if (letterId) {
          const fallbackInfo =
            typeof letterId === 'string'
              ? { id: letterId, symbol: letterId, name: letterId, sound: '' }
              : null;
          info =
            toLetterInfo(itemsById[letterId] ?? itemsBySymbol[letterId] ?? fallbackInfo) ??
            (fallbackInfo ? toLetterInfo(fallbackInfo) : null);
        }
        const finalInfo = info ?? fallbackLetterInfo;
        const labelParts = [finalInfo.hebrew, finalInfo.name].filter(
          (part, index, arr) => part && arr.indexOf(part) === index
        );
        const label = labelParts.length > 0 ? labelParts.join(' · ') : finalInfo.id ?? '';
        if (label) {
          replacements = { ...replacements, letter: label };
        }
      }

      if (nextTask.id === 'spice') {
        const constraintId = nextTask.meta?.constraintId;
        if (constraintId) {
          replacements = { ...replacements, constraint: getConstraintLabel(constraintId) };
        }
      }

      const title = titleKey ? translateKey(titleKey, nextTask.title, replacements) : nextTask.title;
      const description = descriptionKey
        ? translateKey(descriptionKey, nextTask.description, replacements)
        : nextTask.description;

      const rewardStars = Number.isFinite(nextTask.rewardStars)
        ? Math.max(0, Math.floor(nextTask.rewardStars))
        : Math.max(0, rewardDistribution[index] ?? 0);
      const rewardClaimed = Boolean(nextTask.rewardClaimed);
      const rewardClaimable =
        nextTask.rewardClaimable ?? (Boolean(nextTask.completed) && !rewardClaimed);
      const claimedAt = nextTask.claimedAt ?? null;

      return {
        ...nextTask,
        title,
        description,
        rewardStars,
        rewardClaimed,
        rewardClaimable: rewardClaimed ? false : rewardClaimable,
        claimedAt,
        translation: {
          titleKey,
          descriptionKey,
          replacements
        }
      };
    });
    const rewardStars = tasks.reduce((sum, task) => sum + (Number.isFinite(task.rewardStars) ? task.rewardStars : 0), 0);
    const rewardClaimed = tasks.length > 0 ? tasks.every((task) => task.rewardClaimed) : Boolean(daily.rewardClaimed);
    const rewardClaimable = tasks.some((task) => task.rewardClaimable && !task.rewardClaimed);
    return {
      ...daily,
      tasks,
      rewardStars,
      rewardClaimed,
      rewardClaimable,
      claimedAt: daily.claimedAt ?? null
    };
  }

  function generateDaily(dateKey, focusLetterInfo, constraint) {
    const focusLetter = focusLetterInfo ?? fallbackLetterInfo;
    const selectedConstraint = constraint ?? pickConstraint();
    const rewardDistribution = distributeRewardStars(DAILY_REWARD_STARS, dailyTemplates.length);
    const tasks = dailyTemplates.map((template, index) => {
      const baseTranslation = {
        titleKey: template.titleKey ?? null,
        descriptionKey: template.descriptionKey ?? null
      };
      let replacements = {};
      let meta = template.meta ?? {};

      if (template.id === 'focus') {
        const label = `${focusLetter.hebrew} · ${focusLetter.name}`;
        replacements = { letter: label };
        meta = { ...meta, letter: focusLetter.id ?? focusLetter.hebrew };
      }
      if (template.id === 'spice') {
        replacements = { constraint: getConstraintLabel(selectedConstraint.id) };
        meta = { ...meta, constraintId: selectedConstraint.id };
      }
      const title = baseTranslation.titleKey
        ? translateKey(baseTranslation.titleKey, null, replacements)
        : template.title;
      const description = baseTranslation.descriptionKey
        ? translateKey(baseTranslation.descriptionKey, null, replacements)
        : template.description;
      return {
        ...template,
        title,
        description,
        progress: 0,
        meta,
        completed: false,
        rewardStars: rewardDistribution[index] ?? 0,
        rewardClaimable: false,
        rewardClaimed: false,
        claimedAt: null,
        translation: {
          ...baseTranslation,
          replacements
        }
      };
    });
    return {
      dateKey,
      tasks,
      completed: false,
      completedAt: null,
      rewardStars: DAILY_REWARD_STARS,
      rewardClaimable: false,
      rewardClaimed: false,
      claimedAt: null
    };
  }

  return {
    baseLanguageItems,
    allLanguageItems,
    itemsById,
    itemsBySymbol,
    fallbackLetterInfo,
    getWeakestLetter,
    normalizeLetterStats,
    normalizeDailyData,
    generateDaily
  };
}

const spiceConstraints = [
  {
    id: 'expert-mode',
    labelKey: 'daily.constraints.expert-mode',
    fallbackLabel: 'Expert Mode run',
    predicate: (session) => session?.settings?.mode === 'expert'
  },
  {
    id: 'fast-flow',
    labelKey: 'daily.constraints.fast-flow',
    fallbackLabel: 'Fast Flow speed active',
    predicate: (session) => (session?.settings?.speed ?? 0) >= 18
  },
  {
    id: 'no-intros',
    labelKey: 'daily.constraints.no-intros',
    fallbackLabel: 'No Introductions enabled',
    predicate: (session) => session?.settings?.introductions === false
  }
];

function pickConstraint() {
  return spiceConstraints[Math.floor(Math.random() * spiceConstraints.length)];
}

export function ProgressProvider({ children }) {
  const { addToast } = useToast();
  const { languagePack, dictionary, t } = useLocalization();

  const assets = useMemo(() => createLanguageAssets(languagePack, { dictionary, t }), [languagePack, dictionary, t]);
  const storagePrefix = useMemo(() => `progress.${languagePack.id}`, [languagePack.id]);
  const initialPlayerRef = useRef(null);
  const hydratedPrefixRef = useRef(storagePrefix);
  const isInitialHydrationRef = useRef(true);
  const [isHydrationComplete, setIsHydrationComplete] = useState(false);

  const hydratePlayer = useCallback(() => {
    const stored = loadState(`${storagePrefix}.player`, null);
    let source = stored;
    if (!source) {
      const legacy = loadState('player', null);
      if (legacy) {
        source = legacy;
        removeState('player');
      }
    }
    if (!source) return { ...defaultPlayer };
    const storedTotal = Number.isFinite(source?.totalStarsEarned) ? source.totalStarsEarned : source?.stars ?? 0;
    const { level, levelProgress, total } = calculateLevelInfo(storedTotal);
    const hydrated = {
      ...defaultPlayer,
      ...source,
      stars: Number.isFinite(source?.stars) ? source.stars : total,
      totalStarsEarned: total,
      level,
      levelProgress,
      totals: { ...defaultPlayer.totals, ...(source.totals ?? {}) },
      letters: assets.normalizeLetterStats(source.letters ?? {}),
      latestBadge: (() => {
        if (!source.latestBadge) return null;
        const badge = badgeSpecById[source.latestBadge.id];
        if (!badge) return source.latestBadge;
        const tierSpec = badge.tiers.find((item) => item.tier === source.latestBadge.tier);
        return {
          ...source.latestBadge,
          nameKey: source.latestBadge.nameKey ?? badge.nameKey,
          labelKey: source.latestBadge.labelKey ?? tierSpec?.labelKey,
          summaryKey: source.latestBadge.summaryKey ?? badge.summaryKey
        };
      })()
    };
    if (!stored) {
      saveState(`${storagePrefix}.player`, hydrated);
    }
    return hydrated;
  }, [storagePrefix, assets]);

  const hydrateBadges = useCallback(() => {
    const stored = loadState(`${storagePrefix}.badges`, null);
    let source = stored;
    if (!source) {
      const legacy = loadState('badges', null);
      if (legacy) {
        source = legacy;
        removeState('badges');
      }
    }
    if (!source) return { ...defaultBadges };
    const hydrated = { ...defaultBadges };
    Object.keys(source).forEach((key) => {
      const entry = source[key] ?? {};
      const unclaimed = Array.isArray(entry.unclaimed)
        ? entry.unclaimed.map((item) => ({
            tier: Number.isFinite(item?.tier) ? item.tier : 0,
            stars: Number.isFinite(item?.stars) ? item.stars : 0,
            goal: Number.isFinite(item?.goal) ? item.goal : 0,
            earnedAt: item?.earnedAt ?? null
          }))
        : [];
      hydrated[key] = {
        tier: Number.isFinite(entry.tier) ? entry.tier : 0,
        progress: Number.isFinite(entry.progress) ? entry.progress : 0,
        unclaimed
      };
    });
    if (!stored) {
      saveState(`${storagePrefix}.badges`, hydrated);
    }
    return hydrated;
  }, [storagePrefix]);

  const hydrateStreak = useCallback(() => {
    const stored = loadState(`${storagePrefix}.streak`, null);
    let source = stored;
    if (!source) {
      const legacy = loadState('streak', null);
      if (legacy) {
        source = legacy;
        removeState('streak');
      }
    }
    if (!source) return { ...defaultStreak };
    const hydrated = { ...defaultStreak, ...source };
    if (!stored) {
      saveState(`${storagePrefix}.streak`, hydrated);
    }
    return hydrated;
  }, [storagePrefix]);

  const hydrateDaily = useCallback(
    (currentPlayer) => {
      const todayKey = getJerusalemDateKey();
      const stored = loadState(`${storagePrefix}.daily`, null);
      let source = stored;
      if (!source) {
        const legacy = loadState('daily', null);
        if (legacy) {
          source = legacy;
          removeState('daily');
        }
      }
      if (source && source.dateKey === todayKey) {
        const normalized = assets.normalizeDailyData(source);
        if (!stored) {
          saveState(`${storagePrefix}.daily`, normalized);
        }
        return normalized;
      }
      const weakest = assets.getWeakestLetter(currentPlayer?.letters);
      return assets.generateDaily(todayKey, weakest, pickConstraint());
    },
    [storagePrefix, assets]
  );

  const [player, setPlayer] = useState(() => {
    const loaded = hydratePlayer();
    initialPlayerRef.current = loaded;
    return loaded;
  });
  const [badges, setBadges] = useState(() => hydrateBadges());
  const [streak, setStreak] = useState(() => hydrateStreak());
  const [daily, setDaily] = useState(() => hydrateDaily(initialPlayerRef.current));
  const [lastSession, setLastSession] = useState(null);

  useEffect(() => {
    hydratedPrefixRef.current = storagePrefix;
    setIsHydrationComplete(false);
  }, [storagePrefix]);

  useEffect(() => {
    if (isInitialHydrationRef.current) {
      isInitialHydrationRef.current = false;
      setIsHydrationComplete(true);
      return;
    }
    const nextPlayer = hydratePlayer();
    const nextBadges = hydrateBadges();
    const nextStreak = hydrateStreak();
    const nextDaily = hydrateDaily(nextPlayer);
    initialPlayerRef.current = nextPlayer;
    setPlayer(nextPlayer);
    setBadges(nextBadges);
    setStreak(nextStreak);
    setDaily(nextDaily);
    setLastSession(null);
    if (hydratedPrefixRef.current === storagePrefix) {
      setIsHydrationComplete(true);
    }
  }, [hydratePlayer, hydrateBadges, hydrateStreak, hydrateDaily, storagePrefix]);

  useEffect(() => {
    if (!isHydrationComplete) return;
    saveState(`${storagePrefix}.player`, player);
  }, [player, storagePrefix, isHydrationComplete]);

  useEffect(() => {
    if (!isHydrationComplete) return;
    saveState(`${storagePrefix}.badges`, badges);
  }, [badges, storagePrefix, isHydrationComplete]);

  useEffect(() => {
    if (!isHydrationComplete) return;
    saveState(`${storagePrefix}.streak`, streak);
  }, [streak, storagePrefix, isHydrationComplete]);

  useEffect(() => {
    if (!isHydrationComplete) return;
    saveState(`${storagePrefix}.daily`, daily);
  }, [daily, storagePrefix, isHydrationComplete]);

  useEffect(() => {
    const key = getJerusalemDateKey();
    if (daily.dateKey !== key) {
      const weakest = assets.getWeakestLetter(player.letters);
      setDaily(assets.generateDaily(key, weakest, pickConstraint()));
    }
    const timeout = setTimeout(() => {
      const weakest = assets.getWeakestLetter(player.letters);
      setDaily(assets.generateDaily(getJerusalemDateKey(), weakest, pickConstraint()));
    }, millisUntilNextJerusalemMidnight());
    return () => clearTimeout(timeout);
  }, [daily.dateKey, player.letters, assets]);

  const applyStarsToPlayer = useCallback(
    (stars, options = {}) => {
      if (!Number.isFinite(stars) || stars <= 0) {
        return { success: false, levelUp: false };
      }
      const { latestBadge = null, source = null, metadata = null } = options ?? {};
      let levelUp = false;
      let levelValue = null;
      let totalStarsEarnedValue = null;
      setPlayer((prev) => {
        const baseTotal = Number.isFinite(prev.totalStarsEarned) ? prev.totalStarsEarned : prev.stars ?? 0;
        const totalStarsEarned = baseTotal + stars;
        const { level, levelProgress } = calculateLevelInfo(totalStarsEarned);
        levelValue = level;
        levelUp = level > (prev.level ?? 1);
        totalStarsEarnedValue = totalStarsEarned;
        const nextPlayer = {
          ...prev,
          stars: (prev.stars ?? 0) + stars,
          totalStarsEarned,
          level,
          levelProgress
        };
        if (latestBadge) {
          nextPlayer.latestBadge = latestBadge;
        }
        return nextPlayer;
      });
      if (levelUp) {
        addToast({
          tone: 'success',
          title: 'Level up!',
          description: `You reached level ${levelValue}!`,
          icon: '🌟'
        });
      }
      emit('progress:stars-awarded', {
        stars,
        totalStarsEarned: totalStarsEarnedValue,
        level: levelValue,
        levelUp,
        source,
        metadata
      });
      return { success: true, levelUp, level: levelValue };
    },
    [addToast]
  );

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
    const earnedTiers = [];
    setBadges((prev) => {
      const current = prev[badgeId] ?? { tier: 0, progress: 0, unclaimed: [] };
      let tier = Number.isFinite(current.tier) ? current.tier : 0;
      let progress = (current.progress ?? 0) + delta;
      const unclaimed = Array.isArray(current.unclaimed) ? [...current.unclaimed] : [];
      const result = { ...prev };
      while (tier < badgeSpec.tiers.length) {
        const target = badgeSpec.tiers[tier].goal;
        if (progress >= target) {
          progress -= target;
          tier += 1;
          const tierSpec = badgeSpec.tiers[tier - 1];
          const reward = {
            tier: tierSpec.tier,
            stars: tierSpec.stars ?? 0,
            goal: tierSpec.goal ?? target,
            earnedAt: new Date().toISOString()
          };
          unclaimed.push(reward);
          earnedTiers.push(reward);
        } else {
          break;
        }
      }
      if (tier >= badgeSpec.tiers.length) {
        progress = badgeSpec.tiers[badgeSpec.tiers.length - 1].goal;
      }
      result[badgeId] = { tier, progress, unclaimed };
      return result;
    });
    if (earnedTiers.length > 0) {
      const latestReward = earnedTiers[earnedTiers.length - 1];
      const tierSpec = badgeSpec.tiers.find((item) => item.tier === latestReward.tier) ?? latestReward;
      const badgeName = badgeSpec.nameKey ? t(badgeSpec.nameKey) : badgeSpec.name ?? badgeId;
      const tierLabel = tierSpec.labelKey ? t(tierSpec.labelKey) : tierSpec.label ?? `Tier ${latestReward.tier}`;
      addToast({
        tone: 'info',
        title: `${badgeName} · ${tierLabel}`,
        description: `Tier ${latestReward.tier} ready to claim! +${latestReward.stars} ⭐`,
        icon: '⭐'
      });
    }
  }

  function markDailyProgress(predicate) {
    const newlyClaimable = [];
    setDaily((prev) => {
      if (!prev) return prev;
      const tasks = prev.tasks.map((task) => {
        if (task.completed) return task;
        if (!predicate(task)) return task;
        const nextProgress = Math.min(task.goal, (task.progress ?? 0) + 1);
        const completed = nextProgress >= task.goal;
        const becameClaimable = completed && !task.rewardClaimed && !task.rewardClaimable;
        if (becameClaimable) {
          newlyClaimable.push({
            id: task.id,
            title: task.title,
            rewardStars: Number.isFinite(task.rewardStars) ? task.rewardStars : 0
          });
        }
        return {
          ...task,
          progress: nextProgress,
          completed,
          rewardClaimable: completed && !task.rewardClaimed
        };
      });
      const completed = tasks.every((task) => task.completed);
      const completedAt = completed && !prev.completed ? new Date().toISOString() : prev.completedAt;
      const rewardStars = tasks.reduce(
        (sum, task) => sum + (Number.isFinite(task.rewardStars) ? task.rewardStars : 0),
        0
      );
      const rewardClaimed = tasks.every((task) => task.rewardClaimed);
      const rewardClaimable = tasks.some((task) => task.rewardClaimable && !task.rewardClaimed);
      const nextDaily = {
        ...prev,
        tasks,
        completed,
        completedAt: completed ? completedAt : prev.completedAt,
        rewardStars,
        rewardClaimed,
        rewardClaimable
      };
      return nextDaily;
    });
    newlyClaimable.forEach((task) => {
      const rewardValue = Math.max(0, Math.floor(task.rewardStars ?? 0));
      addToast({
        tone: 'info',
        title: `${task.title} complete`,
        description:
          rewardValue > 0
            ? `Claim +${rewardValue} ⭐ from this quest!`
            : 'Quest complete! Claim your reward.',
        icon: '⭐'
      });
    });
  }

  const claimBadgeReward = useCallback(
    (badgeId, tier) => {
      const badgeSpec = badgeSpecById[badgeId];
      if (!badgeSpec) return { success: false };
      let reward = null;
      setBadges((prev) => {
        const state = prev[badgeId];
        if (!state) return prev;
        const unclaimed = Array.isArray(state.unclaimed) ? [...state.unclaimed] : [];
        const index =
          typeof tier === 'number'
            ? unclaimed.findIndex((entry) => entry.tier === tier)
            : 0;
        if (index < 0 || index >= unclaimed.length) return prev;
        reward = unclaimed.splice(index, 1)[0];
        return {
          ...prev,
          [badgeId]: {
            ...state,
            unclaimed
          }
        };
      });
      if (!reward) return { success: false };
      const tierSpec = badgeSpec.tiers.find((item) => item.tier === reward.tier) ?? reward;
      const badgeName = badgeSpec.nameKey ? t(badgeSpec.nameKey) : badgeSpec.name ?? badgeId;
      const tierLabel = tierSpec.labelKey ? t(tierSpec.labelKey) : tierSpec.label ?? `Tier ${reward.tier}`;
      const summary = badgeSpec.summaryKey ? t(badgeSpec.summaryKey) : badgeSpec.summary ?? '';
      applyStarsToPlayer(reward.stars, {
        latestBadge: {
          id: badgeId,
          tier: reward.tier,
          earnedAt: reward.earnedAt ?? new Date().toISOString(),
          nameKey: badgeSpec.nameKey,
          labelKey: tierSpec.labelKey,
          summaryKey: badgeSpec.summaryKey,
          name: badgeName,
          label: tierLabel,
          summary
        },
        source: 'badge',
        metadata: { badgeId, tier: reward.tier }
      });
      addToast({
        tone: 'success',
        title: `${badgeName} · ${tierLabel}`,
        description: `Claimed +${reward.stars} ⭐`,
        icon: '🏅'
      });
      celebrate({ particleCount: 140, spread: 75, originY: 0.55 });
      return { success: true, reward };
    },
    [addToast, applyStarsToPlayer, t]
  );

  const claimDailyReward = useCallback(
    (taskId = null) => {
      let starsAwarded = 0;
      let claimedTasks = [];
      let rewardDateKey = null;
      let allClaimedAt = null;
      setDaily((prev) => {
        if (!prev?.tasks?.length) return prev;
        const tasks = prev.tasks.map((task) => {
          const eligible =
            task.completed &&
            !task.rewardClaimed &&
            task.rewardClaimable &&
            (taskId === null || task.id === taskId);
          if (!eligible) return task;
          const rewardValue = Number.isFinite(task.rewardStars) ? Math.max(0, task.rewardStars) : 0;
          starsAwarded += rewardValue;
          claimedTasks.push(task.id);
          rewardDateKey = rewardDateKey ?? prev.dateKey ?? null;
          return {
            ...task,
            rewardClaimable: false,
            rewardClaimed: true,
            claimedAt: new Date().toISOString()
          };
        });
        if (claimedTasks.length === 0) {
          return prev;
        }
        const completed = tasks.every((task) => task.completed);
        const rewardClaimed = tasks.every((task) => task.rewardClaimed);
        const rewardClaimable = tasks.some((task) => task.rewardClaimable && !task.rewardClaimed);
        if (rewardClaimed) {
          allClaimedAt = new Date().toISOString();
        }
        const rewardStars = tasks.reduce(
          (sum, task) => sum + (Number.isFinite(task.rewardStars) ? task.rewardStars : 0),
          0
        );
        return {
          ...prev,
          tasks,
          completed,
          rewardStars,
          rewardClaimed,
          rewardClaimable,
          claimedAt: rewardClaimed ? allClaimedAt : prev.claimedAt
        };
      });
      if (claimedTasks.length === 0) {
        return { success: false };
      }
      if (Number.isFinite(starsAwarded) && starsAwarded > 0) {
        applyStarsToPlayer(starsAwarded, {
          source: 'daily',
          metadata: { dateKey: rewardDateKey, tasks: claimedTasks }
        });
        addToast({
          tone: 'success',
          title: claimedTasks.length > 1 ? 'Daily rewards claimed' : 'Daily reward claimed',
          description: `+${starsAwarded} ⭐ added to your profile`,
          icon: '🎉'
        });
        celebrate({ particleCount: 120, spread: 80, originY: 0.6 });
      }
      return { success: true, stars: starsAwarded, tasks: claimedTasks };
    },
    [applyStarsToPlayer, addToast]
  );

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
      const itemId = payload?.itemId;
      if (!itemId) return;
      setPlayer((prev) => {
        const current = prev.letters[itemId] ?? { correct: 0, incorrect: 0 };
        return {
          ...prev,
          letters: {
            ...prev.letters,
            [itemId]: {
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
        markDailyProgress((task) => {
          if (task.id !== 'focus') return false;
          const target = task.meta?.letter;
          if (!target) return false;
          if (target === itemId) return true;
          const symbolMatch = assets.itemsBySymbol[target]?.id;
          return symbolMatch ? symbolMatch === itemId : false;
        });
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
  }, [streak.current, assets]);

  const value = useMemo(
    () => ({
      player,
      badges,
      streak,
      daily,
      setDaily,
      starLevelSize: STAR_LEVEL_SIZE,
      getWeakestLetter: () => assets.getWeakestLetter(player.letters),
      lastSession,
      claimBadgeReward,
      claimDailyReward
    }),
    [assets, player, badges, streak, daily, lastSession, claimBadgeReward, claimDailyReward]
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider');
  return ctx;
}
