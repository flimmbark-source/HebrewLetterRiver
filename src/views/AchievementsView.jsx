import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import badgesCatalog from '../data/badges.json';
import { useProgress, STAR_LEVEL_SIZE } from '../context/ProgressContext.jsx';
import { useLocalization } from '../context/LocalizationContext.jsx';
import { on } from '../lib/eventBus.js';

function BadgeCard({ badge, progress, translate, gameName, onClaim }) {
  const totalTiers = badge.tiers.length;
  const unclaimed = Array.isArray(progress?.unclaimed) ? progress.unclaimed : [];
  const hasUnclaimed = unclaimed.length > 0;
  const claimedTiers = Math.max((progress?.tier ?? 0) - unclaimed.length, 0);
  const isMaxed = claimedTiers >= totalTiers && !hasUnclaimed;
  const activeTier = hasUnclaimed
    ? badge.tiers.find((tier) => tier.tier === unclaimed[0].tier) ?? badge.tiers[Math.min(unclaimed[0].tier - 1, totalTiers - 1)]
    : badge.tiers[Math.min(claimedTiers, totalTiers - 1)];
  const nextGoal = activeTier.goal;
  const currentProgressValue = hasUnclaimed
    ? nextGoal
    : isMaxed
    ? nextGoal
    : Math.min(progress?.progress ?? 0, nextGoal);
  const percent = isMaxed ? 100 : Math.min((currentProgressValue / nextGoal) * 100, 100);
  const tierLabel = translate(activeTier.labelKey);
  const badgeName = translate(badge.nameKey);
  const badgeSummary = translate(badge.summaryKey, { gameName });
  const tierProgressLabel = translate('achievements.tierProgress', {
    current: Math.min((hasUnclaimed ? unclaimed[0].tier : claimedTiers + 1) || 1, totalTiers),
    total: totalTiers
  });
  const [claimingTier, setClaimingTier] = useState(null);
  const [celebratingTier, setCelebratingTier] = useState(null);
  const celebrationTimer = useRef(null);

  useEffect(() => {
    return () => {
      if (celebrationTimer.current) {
        clearTimeout(celebrationTimer.current);
      }
    };
  }, []);

  const triggerCelebration = useCallback((tier) => {
    setCelebratingTier(tier);
    if (celebrationTimer.current) {
      clearTimeout(celebrationTimer.current);
    }
    celebrationTimer.current = setTimeout(() => {
      setCelebratingTier(null);
      celebrationTimer.current = null;
    }, 1200);
  }, []);

  const handleClaim = useCallback(
    (reward) => {
      if (!onClaim) return;
      setClaimingTier(reward.tier);
      Promise.resolve(onClaim(badge.id, reward.tier)).then((result) => {
        if (result?.success) {
          triggerCelebration(reward.tier);
        }
      }).finally(() => {
        setClaimingTier(null);
      });
    },
    [badge.id, onClaim, triggerCelebration]
  );

  const currentDisplay = hasUnclaimed || isMaxed ? `${nextGoal} / ${nextGoal}` : `${currentProgressValue} / ${nextGoal}`;

  const canClaim = hasUnclaimed && unclaimed.length > 0;
  const firstUnclaimed = canClaim ? unclaimed[0] : null;
  const isClaiming = firstUnclaimed && claimingTier === firstUnclaimed.tier;

  const handleCardClick = () => {
    if (!canClaim || isClaiming) return;
    handleClaim(firstUnclaimed);
  };

  const handleCardKeyDown = (event) => {
    if (!canClaim || isClaiming) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClaim(firstUnclaimed);
    }
  };

  const cardClass = canClaim
    ? 'cursor-pointer hover:scale-[1.02] bg-gradient-to-br from-cyan-900/40 to-slate-900/60 border-cyan-600/50 shadow-cyan-500/20 animate-pulse hover:border-cyan-500/60'
    : 'cursor-default bg-slate-900/60 border-slate-800 hover:border-cyan-500/40';

  const highlightClass = celebratingTier !== null ? 'ring-2 ring-amber-400/70 shadow-amber-400/40 animate-pulse' : '';

  return (
    <div
      className={`rounded-3xl border p-5 shadow-inner transition sm:p-6 ${cardClass} ${highlightClass}`}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      role={canClaim ? 'button' : undefined}
      tabIndex={canClaim ? 0 : undefined}
      aria-label={canClaim ? `Claim ${firstUnclaimed.stars} stars for ${tierProgressLabel}` : undefined}
    >
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-base font-semibold text-white sm:text-lg">{badgeSummary}</h3>
        <span className="flex-shrink-0 rounded-full border border-cyan-500/40 bg-cyan-500/10 px-2.5 py-0.5 text-xs font-semibold text-cyan-200">
          {isClaiming ? translate('achievements.claiming') : tierProgressLabel}
        </span>
      </div>
      <div className="mt-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-300">{currentDisplay}</span>
          {activeTier?.stars > 0 && (
            <span className={`text-sm font-semibold ${canClaim ? 'text-amber-300 animate-pulse' : 'text-amber-200'}`}>
              {canClaim && '✨ '}+{activeTier.stars} ⭐{canClaim && ' ✨'}
            </span>
          )}
        </div>
        <div className="mt-2 h-2 rounded-full bg-slate-800">
          <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-cyan-400 transition-all duration-300" style={{ width: `${percent}%` }} />
        </div>
      </div>
    </div>
  );
}

export default function AchievementsView() {
  const { player, badges, daily, claimBadgeReward, claimDailyReward, starLevelSize } = useProgress();
  const { t } = useLocalization();
  const gameName = t('app.title');

  const starsPerLevel = starLevelSize ?? STAR_LEVEL_SIZE;
  const playerStars = Math.max(0, Math.floor(player?.stars ?? 0));
  const totalStarsEarned = Math.max(0, Math.floor(player?.totalStarsEarned ?? playerStars));
  const level = Math.max(1, player?.level ?? Math.floor(totalStarsEarned / starsPerLevel) + 1);
  const levelProgress = Math.max(
    0,
    Math.min(player?.levelProgress ?? (totalStarsEarned % starsPerLevel), starsPerLevel)
  );
  const levelPercent = starsPerLevel > 0 ? Math.min((levelProgress / starsPerLevel) * 100, 100) : 0;
  const unclaimedBadgeStars = useMemo(
    () =>
      Object.values(badges ?? {}).reduce((sum, badgeState) => {
        const rewards = Array.isArray(badgeState?.unclaimed) ? badgeState.unclaimed : [];
        return (
          sum +
          rewards.reduce((inner, reward) => inner + (Number.isFinite(reward?.stars) ? reward.stars : 0), 0)
        );
      }, 0),
    [badges]
  );
  const dailyTasks = daily?.tasks ?? [];
  const unclaimedDailyStars = dailyTasks.reduce((sum, task) => {
    if (!task.rewardClaimable || task.rewardClaimed) return sum;
    const rewardStars = Number.isFinite(task.rewardStars) ? task.rewardStars : 0;
    return sum + rewardStars;
  }, 0);
  const canClaimDaily = unclaimedDailyStars > 0;
  const unclaimedTotal = unclaimedBadgeStars + unclaimedDailyStars;

  const [profileCelebrating, setProfileCelebrating] = useState(false);
  const [dailyClaiming, setDailyClaiming] = useState(false);
  const profileTimer = useRef(null);

  useEffect(() => {
    return () => {
      if (profileTimer.current) {
        clearTimeout(profileTimer.current);
      }
    };
  }, []);

  const triggerProfileCelebration = useCallback(() => {
    setProfileCelebrating(true);
    if (profileTimer.current) {
      clearTimeout(profileTimer.current);
    }
    profileTimer.current = setTimeout(() => {
      setProfileCelebrating(false);
      profileTimer.current = null;
    }, 1200);
  }, []);

  useEffect(() => {
    const off = on('progress:stars-awarded', (payload) => {
      if (!payload || !Number.isFinite(payload.stars) || payload.stars <= 0) {
        return;
      }
      triggerProfileCelebration();
    });
    return () => {
      if (typeof off === 'function') {
        off();
      }
    };
  }, [triggerProfileCelebration]);

  const handleBadgeClaim = useCallback(
    (badgeId, tier) =>
      Promise.resolve(claimBadgeReward(badgeId, tier)).then((result) => {
        if (result?.success) {
          triggerProfileCelebration();
        }
        return result;
      }),
    [claimBadgeReward, triggerProfileCelebration]
  );

  const handleDailyClaim = useCallback(() => {
    if (!canClaimDaily || dailyClaiming) return;
    setDailyClaiming(true);
    Promise.resolve(claimDailyReward()).finally(() => {
      setDailyClaiming(false);
    });
  }, [canClaimDaily, dailyClaiming, claimDailyReward]);

  const profileHighlightClass = profileCelebrating ? 'ring-2 ring-amber-400/70 shadow-amber-300/30 animate-pulse' : '';

  const formatNumber = (value) => Math.max(0, Math.floor(value ?? 0)).toLocaleString();

  const levelName = t(`achievements.levelNames.${Math.min(level, 10)}`, { defaultValue: t('achievements.levelNames.10') });

  return (
    <div className="space-y-8 sm:space-y-10">
      <header className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Title */}
        <h1 className="text-3xl font-bold text-white sm:text-4xl">{t('achievements.title')}</h1>

        {/* Center: Level with name */}
        <div className="flex flex-col items-center text-center">
          <p className="text-2xl font-bold text-white">{t('home.progress.level', { level })}</p>
          <p className="mt-1 text-sm font-semibold text-cyan-400">{levelName}</p>
        </div>

        {/* Right: Progress bar */}
        <div className="w-full text-center sm:w-auto sm:min-w-[240px] sm:text-right">
          <p className="text-xs uppercase tracking-wider text-slate-400">{t('achievements.profile.starsToNextLevel')}</p>
          <div className="mt-2 h-2 rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-cyan-400"
              style={{ width: `${levelPercent}%` }}
            />
          </div>
          <p className="mt-2 text-sm font-semibold text-slate-300">
            {formatNumber(levelProgress)} / {formatNumber(starsPerLevel)} ⭐
          </p>
        </div>
      </header>

      <section className="grid gap-5 sm:gap-6 lg:grid-cols-2">
        {badgesCatalog.map((badge) => (
          <BadgeCard
            key={badge.id}
            badge={badge}
            progress={badges[badge.id] ?? { tier: 0, progress: 0, unclaimed: [] }}
            translate={t}
            gameName={gameName}
            onClaim={handleBadgeClaim}
          />
        ))}
      </section>
    </div>
  );
}
