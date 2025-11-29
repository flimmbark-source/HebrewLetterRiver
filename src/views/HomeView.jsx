import React, { useCallback, useMemo, useState } from 'react';
import badgesCatalog from '../data/badges.json';
import { useProgress, STAR_LEVEL_SIZE } from '../context/ProgressContext.jsx';
import { useGame } from '../context/GameContext.jsx';
import { useLocalization } from '../context/LocalizationContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { formatJerusalemTime, millisUntilNextJerusalemMidnight } from '../lib/time.js';
import { classNames } from '../lib/classNames.js';

function GlobeIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function XIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function TaskCard({
  task,
  questNumber = 1,
  totalQuests = 1,
  claimingReward = false,
  onClaimReward
}) {
  const { t } = useLocalization();
  const percentage = Math.min((task.progress ?? 0) / task.goal, 1) * 100;
  const rewardValue = Number.isFinite(task.rewardStars) ? Math.max(0, task.rewardStars) : 0;
  const formattedReward = rewardValue.toLocaleString();
  const canClaimReward = Boolean(task.rewardClaimable) && !task.rewardClaimed && typeof onClaimReward === 'function';
  const clickable = canClaimReward && !claimingReward;
  const questLabel = t('home.quest.label', { current: questNumber, total: totalQuests });
  const currentProgress = Math.min(task.progress ?? 0, task.goal);
  const progressValue = `${currentProgress} / ${task.goal}`;

  const cardClass = clickable
    ? 'arcade-quest-card-claimable cursor-pointer'
    : 'arcade-quest-card';

  const handleCardClick = () => {
    if (!clickable) return;
    onClaimReward();
  };

  const handleCardKeyDown = (event) => {
    if (!clickable) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClaimReward();
    }
  };

  return (
    <div
      className={`rounded-[24px] p-5 transition-all sm:p-6 ${cardClass}`}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      aria-label={clickable ? `Claim ${formattedReward} stars for quest` : undefined}
    >
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-base font-semibold text-[#F9FAFB] sm:text-lg">{task.description}</h3>
        <div className="arcade-pill flex-shrink-0">
          <span className="text-[11px] font-bold uppercase tracking-wider">{questLabel}</span>
        </div>
      </div>
      <div className="mt-5 flex items-center justify-between">
        <span className="text-base font-bold text-[#F9FAFB]">{progressValue}</span>
        {rewardValue > 0 && (
          <span className={`text-base font-bold ${clickable ? 'text-[#FACC15] animate-pulse' : 'text-[#FACC15]/80'}`}>
            +{formattedReward} ⭐
          </span>
        )}
      </div>
      <div className="arcade-progress-bar-container mt-3">
        <div className="arcade-progress-bar-fill arcade-progress-bar-fill-quest" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

export default function HomeView() {
  const { player, streak, daily, starLevelSize, claimDailyReward } = useProgress();

  const { openGame } = useGame();
  const { t } = useLocalization();
  const { languageId, selectLanguage, appLanguageId, selectAppLanguage, languageOptions } = useLanguage();
  const [appLanguageSelectorExpanded, setAppLanguageSelectorExpanded] = useState(false);

  const latestBadge = useMemo(() => {
    if (!player.latestBadge) return null;
    const badge = badgesCatalog.find((item) => item.id === player.latestBadge.id);
    const tierSpec = badge?.tiers?.find((item) => item.tier === player.latestBadge.tier);

    const nameKey = player.latestBadge.nameKey ?? badge?.nameKey;
    const labelKey = player.latestBadge.labelKey ?? tierSpec?.labelKey;
    const summaryKey = player.latestBadge.summaryKey ?? badge?.summaryKey;

    const name = nameKey ? t(nameKey) : player.latestBadge.name ?? badge?.name ?? player.latestBadge.id;
    const label = labelKey ? t(labelKey) : player.latestBadge.label ?? tierSpec?.label ?? '';
    const summary = summaryKey ? t(summaryKey, { gameName: t('app.title') }) : player.latestBadge.summary ?? badge?.summary ?? '';

    return {
      ...player.latestBadge,
      name,
      label,
      summary
    };
  }, [player.latestBadge, t]);

  const starsPerLevel = starLevelSize ?? STAR_LEVEL_SIZE;
  const totalStarsEarned = player.totalStarsEarned ?? player.stars ?? 0;
  const level = player.level ?? Math.floor(totalStarsEarned / starsPerLevel) + 1;
  const levelProgress = player.levelProgress ?? (totalStarsEarned % starsPerLevel);
  const starsProgress = starsPerLevel > 0 ? Math.min(levelProgress / starsPerLevel, 1) : 0;
  const formatNumber = useCallback((value) => Math.max(0, Math.floor(value ?? 0)).toLocaleString(), []);
  const [claimingTaskId, setClaimingTaskId] = useState(null);

  const handleDailyClaim = useCallback(
    (taskId) => {
      if (!taskId || claimingTaskId) return;
      setClaimingTaskId(taskId);
      Promise.resolve(claimDailyReward(taskId)).finally(() => {
        setClaimingTaskId(null);
      });
    },
    [claimingTaskId, claimDailyReward]
  );

  if (!daily) {
    return (
      <div className="rounded-3xl border-4 border-slate-700 bg-slate-800 p-8 text-center font-semibold text-slate-300 shadow-2xl">
        Loading daily quests…
      </div>
    );
  }

  const nextResetDate = useMemo(() => new Date(Date.now() + millisUntilNextJerusalemMidnight()), [daily?.dateKey]);
  const nextResetTime = formatJerusalemTime(nextResetDate, { timeZoneName: 'short' });
  const totalQuests = daily?.tasks?.length ?? 0;

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* Letter River Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="arcade-title text-[clamp(28px,7vw,32px)] font-bold">{t('app.title')}</h1>
          <p className="mt-1 text-sm font-semibold text-[#9CA3AF] sm:text-base">{t('app.tagline')}</p>
        </div>
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setAppLanguageSelectorExpanded(!appLanguageSelectorExpanded)}
            className="arcade-icon-button flex h-12 w-12 items-center justify-center rounded-full transition-all"
            aria-label={t('app.languagePicker.label')}
          >
            <GlobeIcon className="h-6 w-6" />
          </button>
          {/* App Language Selector Popup */}
          {appLanguageSelectorExpanded && (
            <div className="arcade-card absolute right-0 top-0 w-80 z-50">
              {/* Close X Button */}
              <button
                onClick={() => setAppLanguageSelectorExpanded(false)}
                className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#F97373] text-white shadow-lg transition-all hover:bg-[#EF4444] active:translate-y-1 active:shadow-md"
                aria-label="Close"
              >
                <XIcon className="h-4 w-4" />
              </button>

              <h3 className="mb-3 text-center text-lg font-bold text-white">
                {t('app.languagePicker.label')}
              </h3>

              <select
                id="home-app-language-select"
                value={appLanguageId}
                onChange={(event) => selectAppLanguage(event.target.value)}
                className="w-full rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[#111827] px-4 py-2.5 text-sm font-semibold text-white shadow-inner focus:border-[#22D3EE] focus:outline-none focus:ring-2 focus:ring-[#22D3EE]/40"
              >
                {languageOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>

              <p className="mt-3 text-center text-xs text-[#9CA3AF]">
                {t('app.languagePicker.helper')}
              </p>

              {/* Practice Language Selector */}
              <h3 className="mb-3 mt-5 text-center text-lg font-bold text-white">
                {t('home.languagePicker.label')}
              </h3>

              <select
                id="home-practice-language-select"
                value={languageId}
                onChange={(event) => selectLanguage(event.target.value)}
                className="w-full rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[#111827] px-4 py-2.5 text-sm font-semibold text-white shadow-inner focus:border-[#22D3EE] focus:outline-none focus:ring-2 focus:ring-[#22D3EE]/40"
              >
                {languageOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>

              <p className="mt-3 text-center text-xs text-[#9CA3AF]">
                {t('home.languagePicker.helper')}
              </p>
            </div>
          )}
        </div>
      </header>

      <section className="arcade-card">
        <h2 className="text-lg font-bold uppercase tracking-wide text-white sm:text-xl">{t('home.progress.heading')}</h2>
        <div className="progress-cards-container mt-6">
          <div className="arcade-progress-card rounded-[24px] p-5 sm:p-6">
            <div className="arcade-pill mb-3 inline-block">
              <span className="text-[11px] font-bold uppercase tracking-wider">{t('home.progress.streak')}</span>
            </div>
            <p className="progress-card-value mt-3 text-4xl font-bold text-[#FACC15] sm:text-5xl">{t('home.progress.days', { count: streak.current })}</p>
            <p className="progress-card-subtext mt-2 text-xs font-semibold text-[#9CA3AF]">{t('home.progress.resetsAt', { time: nextResetTime })}</p>
          </div>
          <div className="arcade-progress-card arcade-progress-card-featured rounded-[24px] p-5 sm:p-6">
            <div className="arcade-pill mb-3 inline-block">
              <span className="text-[11px] font-bold uppercase tracking-wider">⭐ {t('home.progress.starLevel')}</span>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <p className="progress-card-value text-4xl font-bold text-[#22D3EE] sm:text-5xl">{t('home.progress.level', { level })}</p>
              <p className="progress-card-subtext text-sm font-semibold text-[#9CA3AF]">{t('home.progress.totalStars', { count: formatNumber(totalStarsEarned) })}</p>
            </div>
            <div className="arcade-progress-bar-container mt-4">
              <div className="arcade-progress-bar-fill arcade-progress-bar-fill-xp" style={{ width: `${starsProgress * 100}%` }} />
            </div>
            <p className="mt-3 text-sm font-semibold text-[#F9FAFB]">
              {t('home.progress.toNextLevel', { current: formatNumber(levelProgress), total: formatNumber(starsPerLevel) })}
            </p>
          </div>
          <div className="arcade-progress-card rounded-[24px] p-5 sm:p-6">
            <div className="arcade-pill mb-3 inline-block">
              <span className="text-[11px] font-bold uppercase tracking-wider">{t('home.progress.latestBadge')}</span>
            </div>
            {latestBadge ? (
              <div className="mt-3 space-y-2">
                <p className="text-lg font-bold text-[#F9FAFB] sm:text-xl">{latestBadge.name}</p>
                <p className="text-base font-semibold text-[#FACC15]">{latestBadge.label}</p>
                <p className="progress-card-subtext text-xs font-semibold text-[#9CA3AF]">{t('home.progress.tier', { tier: latestBadge.tier })} · {new Date(latestBadge.earnedAt).toLocaleDateString()}</p>
                <p className="progress-card-subtext text-xs text-[#9CA3AF]">{latestBadge.summary}</p>
              </div>
            ) : (
              <p className="mt-4 text-sm font-semibold text-[#9CA3AF]">{t('home.progress.playToUnlock')}</p>
            )}
          </div>
        </div>
      </section>
      <section className="quest-cards-container">
        {daily?.tasks?.map((task, index) => (
          <TaskCard
            key={task.id}
            task={task}
            questNumber={index + 1}
            totalQuests={totalQuests}
            claimingReward={claimingTaskId === task.id}
            onClaimReward={() => handleDailyClaim(task.id)}
          />
        ))}
      </section>

    </div>
  );
}
