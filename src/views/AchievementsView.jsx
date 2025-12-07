import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import badgesCatalog from '../data/badges.json';
import { useProgress, STAR_LEVEL_SIZE } from '../context/ProgressContext.jsx';
import { useLocalization } from '../context/LocalizationContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { on } from '../lib/eventBus.js';
import { getPlayerTitle } from '../utils/playerTitles.js';
import { getFormattedLanguageName } from '../lib/languageUtils.js';

function XIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

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
  const badgeSummary = translate(badge.summaryKey, { gameName, goal: nextGoal });
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
    ? 'cursor-pointer hover:scale-[1.02] border-arcade-accent-gold/50 shadow-arcade-button animate-pulse hover:border-arcade-accent-gold/70'
    : 'cursor-default border-arcade-panel-border hover:border-arcade-accent-orange/40';

  const highlightClass = celebratingTier !== null ? 'ring-2 ring-arcade-accent-gold/70 shadow-arcade-button animate-pulse' : '';

  return (
    <div
      className={`progress-card-small p-5 transition sm:p-6 ${cardClass} ${highlightClass}`}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      role={canClaim ? 'button' : undefined}
      tabIndex={canClaim ? 0 : undefined}
      aria-label={canClaim ? translate('achievements.claimStarsAria', { stars: firstUnclaimed.stars, label: tierProgressLabel }) : undefined}
    >
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-base font-semibold text-arcade-text-main sm:text-lg">{badgeSummary}</h3>
        <span className="pill-counter">
          <span className="value">{isClaiming ? translate('achievements.claiming') : tierProgressLabel}</span>
        </span>
      </div>
      <div className="mt-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-arcade-text-soft">{currentDisplay}</span>
          {activeTier?.stars > 0 && (
            <span className={`text-sm font-semibold ${canClaim ? 'text-arcade-accent-gold animate-pulse' : 'text-arcade-text-soft'}`}>
              {canClaim && '✨ '}+{activeTier.stars} ⭐{canClaim && ' ✨'}
            </span>
          )}
        </div>
        <div className="progress-bar-shell mt-2">
          <div className="progress-bar-fill transition-all duration-300" style={{ width: `${percent}%` }} />
        </div>
      </div>
    </div>
  );
}

export default function AchievementsView() {
  const { player, badges, activeBadges, daily, claimBadgeReward, claimDailyReward, starLevelSize } = useProgress();
  const { t } = useLocalization();
  const { languageId, selectLanguage, appLanguageId, selectAppLanguage, languageOptions } = useLanguage();
  const [appLanguageSelectorExpanded, setAppLanguageSelectorExpanded] = useState(false);
  const gameName = t('app.title');
  const sectionBannerVariant = 'aurora';

  const latestBadge = useMemo(() => {
    if (!player.latestBadge) return null;
    const badge = badgesCatalog.find((item) => item.id === player.latestBadge.id);
    const tierSpec = badge?.tiers?.find((item) => item.tier === player.latestBadge.tier);

    const nameKey = player.latestBadge.nameKey ?? badge?.nameKey;
    const labelKey = player.latestBadge.labelKey ?? tierSpec?.labelKey;
    const summaryKey = player.latestBadge.summaryKey ?? badge?.summaryKey;

    const name = nameKey ? t(nameKey) : player.latestBadge.name ?? badge?.name ?? player.latestBadge.id;
    const label = labelKey ? t(labelKey) : player.latestBadge.label ?? tierSpec?.label ?? '';
    const summary = summaryKey ? t(summaryKey, { gameName }) : player.latestBadge.summary ?? badge?.summary ?? '';

    return {
      ...player.latestBadge,
      name,
      label,
      summary
    };
  }, [player.latestBadge, t, gameName]);

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
    <div className="achievements-view">
      {/* Player Header */}
      <header className="player-header">
        <div className="player-meta">
          <div className="avatar"></div>
          <div className="player-text">
            <div className="player-name">{t('common.player')}</div>
            <div className="player-level-row">
              <div className="player-level">{t('home.progress.level', { level })}</div>
              <div className="player-level-progress">
                <div className="player-level-progress-fill" style={{ width: `${levelPercent}%` }}></div>
              </div>
            </div>
            <div className="player-rank">{getPlayerTitle(level)}</div>
          </div>
        </div>
        <div className="top-counters">
          <div className="pill-counter">
            <span className="icon">⭐</span>
            <span className="value">{formatNumber(totalStarsEarned)}</span>
          </div>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setAppLanguageSelectorExpanded(!appLanguageSelectorExpanded)}
              className="tiny-pill"
              aria-label={t('app.languagePicker.label')}
            >
              🌎
            </button>

            {/* App Language Selector Popup */}
            {appLanguageSelectorExpanded && (
              <div className="language-selector-popup">
                <button
                  onClick={() => setAppLanguageSelectorExpanded(false)}
                  className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-arcade-accent-red text-white shadow-arcade-sm z-10"
                  aria-label={t('common.close')}
                >
                  <XIcon className="h-3 w-3" />
                </button>

                <h3 className="mb-3 text-center font-heading text-sm font-bold text-arcade-text-main">
                  {t('app.languagePicker.label')}
                </h3>

                <select
                  id="achievements-app-language-select"
                  value={appLanguageId}
                  onChange={(event) => selectAppLanguage(event.target.value)}
                  className="w-full rounded-xl border-2 border-arcade-panel-border bg-arcade-panel-light px-3 py-2 text-xs font-semibold text-arcade-text-main shadow-inner"
                >
                  {languageOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {getFormattedLanguageName(option, t)}
                    </option>
                  ))}
                </select>

                <h3 className="mb-2 mt-4 text-center font-heading text-sm font-bold text-arcade-text-main">
                  {t('home.languagePicker.label')}
                </h3>

                <select
                  id="achievements-practice-language-select"
                  value={languageId}
                  onChange={(event) => selectLanguage(event.target.value)}
                  className="w-full rounded-xl border-2 border-arcade-panel-border bg-arcade-panel-light px-3 py-2 text-xs font-semibold text-arcade-text-main shadow-inner"
                >
                  {languageOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {getFormattedLanguageName(option, t)}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </header>

      <section className="section" style={{ marginTop: '20px' }}>
        <div className="section-header">
          <div className="wood-header">{t('achievements.title')}</div>
        </div>
        <section className="section" style={{ marginTop: '10px' }}></section>

        {/* Group badges by section */}
        {['classic', 'special', 'polyglot', 'dedication'].map((sectionId) => {
          const sectionCatalog = badgesCatalog.filter((badge) => badge.section === sectionId);
          const activeSectionBadges = sectionCatalog.filter((badge) => activeBadges.includes(badge.id));
          const additionalBadges = sectionCatalog.filter((badge) => !activeBadges.includes(badge.id));
          // Only show sections with at least 3 achievements
          const displayBadges = [...activeSectionBadges, ...additionalBadges].slice(
            0,
            Math.max(3, activeSectionBadges.length)
          );

          if (displayBadges.length === 0) return null;

          return (
                        <div key={sectionId} className="achievement-section" style={{ marginBottom: '32px' }}>
              <div className="section-header mb-3">
                <div className="section-title">
                  <div className={`section-banner section-banner--${sectionBannerVariant} text-sm`}>
                    {t(`achievementSections.${sectionId}`, sectionId.charAt(0).toUpperCase() + sectionId.slice(1))}
                  </div>
                </div>
              </div>
              <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
                {displayBadges.map((badge) => (
                  <BadgeCard
                    key={badge.id}
                    badge={badge}
                    progress={badges[badge.id] ?? { tier: 0, progress: 0, unclaimed: [] }}
                    translate={t}
                    gameName={gameName}
                    onClaim={handleBadgeClaim}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
