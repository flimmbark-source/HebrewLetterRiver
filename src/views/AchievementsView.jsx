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

  const highlightClass = celebratingTier !== null
    ? 'ring-2 ring-amber-400/70 shadow-amber-400/40 animate-pulse'
    : hasUnclaimed
    ? 'border-amber-400/50 shadow-amber-500/10'
    : '';
  const statusLabel = isMaxed
    ? translate('achievements.maxed')
    : translate('achievements.next', { label: tierLabel });
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
    ? 'cursor-pointer hover:border-amber-400/40 hover:scale-[1.01]'
    : 'cursor-default hover:border-cyan-500/40';

  return (
    <div
      className={`rounded-3xl border border-slate-800 bg-slate-900/60 p-5 shadow-inner transition sm:p-6 ${highlightClass} ${cardClass}`}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      role={canClaim ? 'button' : undefined}
      tabIndex={canClaim ? 0 : undefined}
      aria-label={canClaim ? `Claim ${firstUnclaimed.stars} stars for ${tierProgressLabel}` : undefined}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400 sm:text-sm">{badgeName}</p>
          <h3 className="text-lg font-semibold text-white sm:text-xl">{badgeSummary}</h3>
        </div>
        <span className="self-start rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-200 sm:text-sm">
          {isClaiming ? translate('achievements.claiming') : tierProgressLabel}
        </span>
      </div>
      {hasUnclaimed && (
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm font-semibold text-amber-200">+{firstUnclaimed.stars} ⭐</span>
          {unclaimed.length > 1 && (
            <span className="text-xs text-amber-200/70">
              {translate(unclaimed.length - 1 === 1 ? 'achievements.moreTiers' : 'achievements.moreTiersPlural', { count: unclaimed.length - 1 })}
            </span>
          )}
        </div>
      )}
      <div className="mt-4 h-2 rounded-full bg-slate-800">
        <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-cyan-400" style={{ width: `${percent}%` }} />
      </div>
      <div className="mt-4 flex items-center justify-between text-sm text-slate-300">
        <span>{statusLabel}</span>
        <span>{currentDisplay}</span>
      </div>
      {isMaxed ? (
        <p className="mt-2 text-xs text-emerald-300">{translate('achievements.maxed')}</p>
      ) : !hasUnclaimed && (
        <p className="mt-2 text-xs text-slate-500">{translate('achievements.earnStars', { stars: activeTier.stars })}</p>
      )}
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

  return (
    <div className="space-y-8 sm:space-y-10">
      <section className="rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-slate-900 to-slate-950 p-6 shadow-2xl sm:p-8">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">{t('achievements.title')}</h1>
        <p className="mt-3 text-sm text-slate-300 sm:max-w-2xl sm:text-base">{t('achievements.description')}</p>
      </section>

      <section
        className={`rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-inner transition sm:p-8 ${profileHighlightClass}`}
      >
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-300 sm:text-sm">{t('achievements.profile.title')}</p>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">{t('home.progress.level', { level })}</h2>
            <p className="text-sm text-slate-300 sm:max-w-xl sm:text-base">
              {t('achievements.profile.description')}
            </p>
          </div>
          <div className="w-full rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-slate-200 shadow-inner sm:w-72">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{t('achievements.profile.starsToNextLevel')}</p>
            <div className="mt-3 h-2 rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-cyan-400"
                style={{ width: `${levelPercent}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-slate-300">
              {formatNumber(levelProgress)} / {formatNumber(starsPerLevel)} ⭐
            </p>
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{t('achievements.profile.totalStarsEarned')}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{formatNumber(totalStarsEarned)}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{t('achievements.profile.currentStarBalance')}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{formatNumber(playerStars)}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{t('achievements.profile.starsReadyToClaim')}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{formatNumber(unclaimedTotal)}</p>
          </div>
        </div>
        {unclaimedDailyStars > 0 && (
          <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-amber-400/40 bg-amber-400/10 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-amber-100">{t('achievements.profile.dailyBadgeReady')}</p>
              <p className="text-sm text-amber-100/80">{t('achievements.profile.claimStarsToLevel', { stars: formatNumber(unclaimedDailyStars) })}</p>
            </div>
            <button
              type="button"
              onClick={handleDailyClaim}
              disabled={dailyClaiming}
              className="rounded-full bg-amber-400 px-5 py-2 text-sm font-semibold text-slate-900 shadow-lg transition hover:bg-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {dailyClaiming ? t('achievements.claiming') : `Claim +${formatNumber(unclaimedDailyStars)} ⭐`}
            </button>
          </div>
        )}
      </section>

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
