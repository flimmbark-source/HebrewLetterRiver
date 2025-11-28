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
  const highlightClass = canClaimReward
    ? 'border-amber-400/40 ring-1 ring-amber-300/60 shadow-amber-300/20'
    : task.rewardClaimed
    ? 'border-emerald-400/40'
    : '';
  const questLabel = t('home.quest.label', { current: questNumber, total: totalQuests });
  const statusPillClass = 'border-cyan-500/40 bg-cyan-500/10 text-cyan-200';
  const currentProgress = Math.min(task.progress ?? 0, task.goal);
  const progressValue = `${currentProgress} / ${task.goal}`;

  const statusLabel = task.rewardClaimed
    ? t('home.quest.collected')
    : task.completed
    ? t('home.quest.complete')
    : t('home.quest.inProgress');

  const handleBadgeClick = (event) => {
    if (event) {
      event.stopPropagation();
    }
    if (!clickable) return;
    onClaimReward();
  };

  const handleBadgeKeyDown = (event) => {
    if (!clickable) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClaimReward();
    }
  };

  const badgeClass = classNames(
    'quest-badge self-start rounded-full border-b-4 px-3 py-1 text-xs font-bold shadow-lg transition-all sm:text-sm',
    task.rewardClaimed
      ? 'border-green-700 bg-green-600 text-white'
      : 'border-cyan-700 bg-cyan-600 text-white',
    clickable && [
      'cursor-pointer',
      'hover:bg-cyan-500',
      'hover:border-cyan-600',
      'hover:scale-105',
      'active:translate-y-1',
      'active:border-b-2',
      'focus:outline-none',
      'focus-visible:ring-2',
      'focus-visible:ring-cyan-400'
    ],
    !clickable && 'cursor-default'
  );

  return (
    <div className="quest-card rounded-3xl border-4 border-slate-700 bg-slate-800 shadow-2xl transition hover:shadow-cyan-500/20">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <p className="quest-category text-xs font-bold uppercase tracking-wider text-slate-400">{task.title}</p>
          <h3 className="quest-title text-lg font-bold text-white sm:text-xl">{task.description}</h3>
        </div>
        <button
          type="button"
          className={badgeClass}
          onClick={handleBadgeClick}
          onKeyDown={handleBadgeKeyDown}
          disabled={!clickable || claimingReward}
          role="button"
          tabIndex={0}
          aria-label={canClaimReward ? `Claim ${formattedReward} stars for ${questLabel}` : questLabel}
        >
          {claimingReward ? t('home.quest.claiming') : questLabel}
        </button>
      </div>
      {rewardValue > 0 && (
        <div className="mt-4 flex items-center justify-between">
          <span className="quest-reward-text text-xl font-bold text-cyan-400">+{formattedReward} ⭐</span>
          {task.rewardClaimed && (
            <span className="quest-reward-text text-sm font-bold text-green-400">✓ {t('home.quest.collectedShort')}</span>
          )}
        </div>
      )}
      <div className="mt-4 h-4 rounded-full border-4 border-slate-700 bg-slate-900 shadow-inner">
        <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300" style={{ width: `${percentage}%` }} />
      </div>
      <div className="mt-3 flex items-center justify-between text-sm font-semibold text-slate-400">
        <span className="quest-progress-text">{statusLabel}</span>
        <span className="quest-progress-text">{progressValue}</span>
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
        <h1 className="text-3xl font-bold text-white sm:text-4xl">{t('app.title')}</h1>
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setAppLanguageSelectorExpanded(!appLanguageSelectorExpanded)}
            className="flex h-12 w-12 items-center justify-center rounded-full border-b-4 border-slate-600 bg-slate-700 text-slate-200 shadow-lg transition-all hover:bg-slate-600 hover:scale-105 active:translate-y-1 active:border-b-2"
            aria-label={t('app.languagePicker.label')}
          >
            <GlobeIcon className="h-6 w-6" />
          </button>
          {/* App Language Selector Popup */}
          {appLanguageSelectorExpanded && (
            <div className="absolute right-0 top-full mt-2 w-80 rounded-3xl border-4 border-slate-700 bg-slate-800 p-5 shadow-2xl z-50">
              {/* Close X Button */}
              <button
                onClick={() => setAppLanguageSelectorExpanded(false)}
                className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full border-4 border-red-600 bg-red-500 text-white shadow-lg transition-all hover:bg-red-400 active:translate-y-1 active:shadow-md"
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
                onChange={(event) => {
                  selectAppLanguage(event.target.value);
                  setAppLanguageSelectorExpanded(false);
                }}
                className="w-full rounded-2xl border-4 border-slate-600 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-inner focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/40"
              >
                {languageOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>

              <p className="mt-3 text-center text-xs text-slate-400">
                {t('app.languagePicker.helper')}
              </p>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <section
        className={classNames(
          'rounded-3xl border-4 border-slate-700',
          'bg-gradient-to-br from-slate-900 to-slate-950',
          'p-6 shadow-2xl',
          'sm:p-8'
        )}
      >
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">{t('home.hero.heading')}</h2>
            <p className="mt-3 text-sm text-slate-300 sm:max-w-2xl sm:text-base">{t('home.hero.description')}</p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:min-w-[260px]">
            <div className="rounded-2xl border-4 border-slate-700 bg-slate-800 p-4 shadow-lg">
              <label htmlFor="home-practice-language-select" className="text-xs font-bold uppercase tracking-wider text-slate-300">
                {t('home.languagePicker.label')}
              </label>
              <select
                id="home-practice-language-select"
                value={languageId}
                onChange={(event) => selectLanguage(event.target.value)}
                className={classNames(
                  'mt-2 w-full rounded-xl border-4 border-slate-600 bg-slate-900 px-3 py-2 text-sm font-semibold text-white',
                  'focus:border-cyan-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/40',
                  'sm:text-base'
                )}
              >
                {languageOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs font-semibold text-slate-400">{t('home.languagePicker.helper')}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border-4 border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 p-5 shadow-2xl sm:p-6">
        <h2 className="text-base font-bold text-white sm:text-lg">{t('home.progress.heading')}</h2>
        <div className="progress-cards-container mt-4">
          <div className="progress-card rounded-2xl border-4 border-slate-700 bg-slate-800 shadow-lg">
            <p className="progress-card-label text-xs font-bold uppercase tracking-wider text-slate-400">{t('home.progress.streak')}</p>
            <p className="progress-card-value mt-2 text-3xl font-bold text-cyan-400">{t('home.progress.days', { count: streak.current })}</p>
            <p className="progress-card-subtext mt-1 text-xs font-semibold text-slate-500">{t('home.progress.resetsAt', { time: nextResetTime })}</p>
          </div>
          <div className="progress-card rounded-2xl border-4 border-slate-700 bg-slate-800 shadow-lg">
            <p className="progress-card-label text-xs font-bold uppercase tracking-wider text-slate-400">{t('home.progress.starLevel')}</p>
            <div className="mt-2 flex items-baseline justify-between">
              <p className="progress-card-value text-3xl font-bold text-cyan-400">{t('home.progress.level', { level })}</p>
              <p className="progress-card-subtext text-sm font-semibold text-slate-500">{t('home.progress.totalStars', { count: formatNumber(totalStarsEarned) })}</p>
            </div>
            <div className="mt-3 h-4 rounded-full border-4 border-slate-700 bg-slate-900 shadow-inner">
              <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300" style={{ width: `${starsProgress * 100}%` }} />
            </div>
            <p className="mt-2 text-sm font-semibold text-slate-400">
              {t('home.progress.toNextLevel', { current: formatNumber(levelProgress), total: formatNumber(starsPerLevel) })}
            </p>
          </div>
          <div className="progress-card rounded-2xl border-4 border-slate-700 bg-slate-800 shadow-lg">
            <p className="progress-card-label text-xs font-bold uppercase tracking-wider text-slate-400">{t('home.progress.latestBadge')}</p>
            {latestBadge ? (
              <div className="mt-2 space-y-1">
                <p className="text-base font-bold text-white sm:text-lg">{latestBadge.name}</p>
                <p className="text-sm font-semibold text-cyan-400">{latestBadge.label}</p>
                <p className="progress-card-subtext text-xs font-semibold text-slate-500">{t('home.progress.tier', { tier: latestBadge.tier })} · {new Date(latestBadge.earnedAt).toLocaleDateString()}</p>
                <p className="progress-card-subtext text-xs text-slate-500">{latestBadge.summary}</p>
              </div>
            ) : (
              <p className="mt-3 text-sm font-semibold text-slate-500">{t('home.progress.playToUnlock')}</p>
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
