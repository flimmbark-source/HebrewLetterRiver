import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import badgesCatalog from '../data/badges.json';
import { useProgress, STAR_LEVEL_SIZE } from '../context/ProgressContext.jsx';
import { useLocalization } from '../context/LocalizationContext.jsx';

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
  const statusLabel = hasUnclaimed
    ? `Claim ${tierLabel} · +${unclaimed[0].stars} ⭐`
    : isMaxed
    ? translate('achievements.maxed')
    : translate('achievements.next', { label: tierLabel });
  const currentDisplay = hasUnclaimed || isMaxed ? `${nextGoal} / ${nextGoal}` : `${currentProgressValue} / ${nextGoal}`;

  return (
    <div
      className={`rounded-3xl border border-slate-800 bg-slate-900/60 p-5 shadow-inner transition hover:border-cyan-500/40 sm:p-6 ${highlightClass}`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400 sm:text-sm">{badgeName}</p>
          <h3 className="text-lg font-semibold text-white sm:text-xl">{badgeSummary}</h3>
        </div>
        <span className="self-start rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-200 sm:text-sm">
          {tierProgressLabel}
        </span>
      </div>
      <div className="mt-5 h-2 rounded-full bg-slate-800">
        <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-cyan-400" style={{ width: `${percent}%` }} />
      </div>
      <div className="mt-4 flex items-center justify-between text-sm text-slate-300">
        <span>{statusLabel}</span>
        <span>{currentDisplay}</span>
      </div>
      {hasUnclaimed ? (
        <div className="mt-4 space-y-2">
          {unclaimed.map((reward) => (
            <button
              key={reward.tier}
              type="button"
              onClick={() => handleClaim(reward)}
              disabled={claimingTier === reward.tier}
              className="w-full rounded-xl border border-amber-400/50 bg-amber-400/10 px-4 py-2 text-sm font-semibold text-amber-100 transition hover:bg-amber-400/20 focus:outline-none focus:ring-2 focus:ring-amber-300/60 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {claimingTier === reward.tier ? 'Claiming…' : `Claim Tier ${reward.tier} · +${reward.stars} ⭐`}
            </button>
          ))}
        </div>
      ) : isMaxed ? (
        <p className="mt-2 text-xs text-emerald-300">{translate('achievements.maxed')}</p>
      ) : (
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
  const unclaimedDailyStars = daily?.rewardClaimable && !daily?.rewardClaimed ? daily?.rewardStars ?? 0 : 0;
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

  const handleBadgeClaim = useCallback((badgeId, tier) => claimBadgeReward(badgeId, tier), [claimBadgeReward]);

  const handleDailyClaim = useCallback(() => {
    if (!daily?.rewardClaimable || dailyClaiming) return;
    setDailyClaiming(true);
    Promise.resolve(claimDailyReward()).then((result) => {
      if (result?.success) {
        triggerProfileCelebration();
      }
    }).finally(() => {
      setDailyClaiming(false);
    });
  }, [daily?.rewardClaimable, dailyClaiming, claimDailyReward, triggerProfileCelebration]);

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
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-300 sm:text-sm">Player Profile</p>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">Level {level}</h2>
            <p className="text-sm text-slate-300 sm:max-w-xl sm:text-base">
              Track your star progress and claim rewards to rise through the River ranks.
            </p>
          </div>
          <div className="w-full rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-slate-200 shadow-inner sm:w-72">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Stars to next level</p>
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
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Total stars earned</p>
            <p className="mt-2 text-2xl font-semibold text-white">{formatNumber(totalStarsEarned)}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Current star balance</p>
            <p className="mt-2 text-2xl font-semibold text-white">{formatNumber(playerStars)}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Stars ready to claim</p>
            <p className="mt-2 text-2xl font-semibold text-white">{formatNumber(unclaimedTotal)}</p>
          </div>
        </div>
        {unclaimedDailyStars > 0 && (
          <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-amber-400/40 bg-amber-400/10 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-amber-100">Daily badge ready</p>
              <p className="text-sm text-amber-100/80">Claim +{formatNumber(unclaimedDailyStars)} ⭐ to add them to your level.</p>
            </div>
            <button
              type="button"
              onClick={handleDailyClaim}
              disabled={dailyClaiming}
              className="rounded-full bg-amber-400 px-5 py-2 text-sm font-semibold text-slate-900 shadow-lg transition hover:bg-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {dailyClaiming ? 'Claiming…' : 'Claim Daily Reward'}
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
