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
    'quest-badge self-start rounded-full border-2 px-3 py-1 text-xs font-bold sm:text-sm',
    task.rewardClaimed ? 'border-green-600 bg-green-500 text-white' : 'border-orange-600 bg-orange-500 text-white',
    clickable && [
      'cursor-pointer',
      'transition-all',
      'hover:bg-amber-400',
      'hover:border-amber-600',
      'hover:scale-105',
      'focus:outline-none',
      'focus-visible:ring-2',
      'focus-visible:ring-amber-300'
    ],
    !clickable && 'cursor-default'
  );

  return (
    <div className="quest-card rounded-3xl border-4 border-orange-200 bg-white shadow-lg transition hover:shadow-xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <p className="quest-category text-xs font-bold uppercase tracking-wider text-amber-700">{task.title}</p>
          <h3 className="quest-title text-lg font-bold text-amber-900 sm:text-xl">{task.description}</h3>
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
          <span className="quest-reward-text text-xl font-bold text-orange-600">+{formattedReward} ⭐</span>
          {task.rewardClaimed && (
            <span className="quest-reward-text text-sm font-bold text-green-600">✓ {t('home.quest.collectedShort')}</span>
          )}
        </div>
      )}
      <div className="mt-4 h-4 rounded-full border-2 border-amber-800/30 bg-amber-100 shadow-inner">
        <div className="h-full rounded-full bg-gradient-to-r from-orange-400 to-amber-400 transition-all duration-300" style={{ width: `${percentage}%` }} />
      </div>
      <div className="mt-3 flex items-center justify-between text-sm font-semibold text-amber-700">
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
      <div className="rounded-3xl border-4 border-orange-200 bg-white p-8 text-center font-semibold text-amber-700 shadow-lg">
        Loading daily quests…
      </div>
    );
  }

  const nextResetDate = useMemo(() => new Date(Date.now() + millisUntilNextJerusalemMidnight()), [daily?.dateKey]);
  const nextResetTime = formatJerusalemTime(nextResetDate, { timeZoneName: 'short' });
  const totalQuests = daily?.tasks?.length ?? 0;

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* App Language Selector Popup */}
      {appLanguageSelectorExpanded && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setAppLanguageSelectorExpanded(false)}
          />
          {/* Popup */}
          <div className="fixed left-1/2 top-1/2 z-50 w-[90%] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl border-4 border-amber-600/50 bg-gradient-to-br from-amber-50 to-orange-50 p-6 shadow-2xl">
            {/* Close X Button */}
            <button
              onClick={() => setAppLanguageSelectorExpanded(false)}
              className="absolute -right-3 -top-3 flex h-10 w-10 items-center justify-center rounded-full border-4 border-red-600 bg-red-500 text-white shadow-lg transition-all hover:bg-red-400 active:translate-y-1 active:shadow-md"
              aria-label="Close"
            >
              <XIcon className="h-5 w-5" />
            </button>

            <h3 className="mb-4 text-center text-xl font-bold text-amber-900">
              {t('app.languagePicker.label')}
            </h3>

            <select
              id="home-app-language-select"
              value={appLanguageId}
              onChange={(event) => {
                selectAppLanguage(event.target.value);
                setAppLanguageSelectorExpanded(false);
              }}
              className="w-full rounded-2xl border-4 border-amber-800/30 bg-white px-4 py-3 text-base font-semibold text-amber-900 shadow-inner focus:border-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-200"
            >
              {languageOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>

            <p className="mt-3 text-center text-sm text-amber-800">
              {t('app.languagePicker.helper')}
            </p>
          </div>
        </>
      )}

      <section
        className={classNames(
          'rounded-3xl border-4 border-amber-600/30',
          'bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50',
          'p-6 shadow-xl',
          'sm:p-8'
        )}
      >
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-bold text-amber-900 drop-shadow-sm sm:text-4xl">{t('home.hero.heading')}</h1>
            <p className="mt-3 text-sm text-amber-800 sm:max-w-2xl sm:text-base">{t('home.hero.description')}</p>
          </div>
          <div className="flex flex-col gap-3 sm:w-auto sm:min-w-[260px]">
            <div className="flex items-start gap-2">
              <div className="flex-1 rounded-2xl border-4 border-amber-200 bg-white p-4 shadow-md">
                <label htmlFor="home-practice-language-select" className="text-xs font-bold uppercase tracking-wider text-amber-700">
                  {t('home.languagePicker.label')}
                </label>
                <select
                  id="home-practice-language-select"
                  value={languageId}
                  onChange={(event) => selectLanguage(event.target.value)}
                  className={classNames(
                    'mt-2 w-full rounded-xl border-4 border-amber-800/30 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900',
                    'focus:border-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-200',
                    'sm:text-base'
                  )}
                >
                  {languageOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs font-semibold text-amber-700">{t('home.languagePicker.helper')}</p>
              </div>
              <button
                onClick={() => setAppLanguageSelectorExpanded(true)}
                className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full border-b-4 border-amber-700 bg-amber-400 text-amber-900 shadow-lg transition-all hover:bg-amber-300 hover:scale-105 active:translate-y-1 active:border-b-2"
                aria-label={t('app.languagePicker.label')}
              >
                <GlobeIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border-4 border-amber-200 bg-gradient-to-br from-orange-50 to-amber-50 p-5 shadow-lg sm:p-6">
        <h2 className="text-base font-bold text-amber-900 sm:text-lg">{t('home.progress.heading')}</h2>
        <div className="progress-cards-container mt-4">
          <div className="progress-card rounded-2xl border-4 border-orange-200 bg-white shadow-md">
            <p className="progress-card-label text-xs font-bold uppercase tracking-wider text-amber-700">{t('home.progress.streak')}</p>
            <p className="progress-card-value mt-2 text-3xl font-bold text-orange-600">{t('home.progress.days', { count: streak.current })}</p>
            <p className="progress-card-subtext mt-1 text-xs font-semibold text-amber-600">{t('home.progress.resetsAt', { time: nextResetTime })}</p>
          </div>
          <div className="progress-card rounded-2xl border-4 border-orange-200 bg-white shadow-md">
            <p className="progress-card-label text-xs font-bold uppercase tracking-wider text-amber-700">{t('home.progress.starLevel')}</p>
            <div className="mt-2 flex items-baseline justify-between">
              <p className="progress-card-value text-3xl font-bold text-orange-600">{t('home.progress.level', { level })}</p>
              <p className="progress-card-subtext text-sm font-semibold text-amber-600">{t('home.progress.totalStars', { count: formatNumber(totalStarsEarned) })}</p>
            </div>
            <div className="mt-3 h-4 rounded-full border-2 border-amber-800/30 bg-amber-100 shadow-inner">
              <div className="h-full rounded-full bg-gradient-to-r from-orange-400 to-amber-400" style={{ width: `${starsProgress * 100}%` }} />
            </div>
            <p className="mt-2 text-sm font-semibold text-amber-700">
              {t('home.progress.toNextLevel', { current: formatNumber(levelProgress), total: formatNumber(starsPerLevel) })}
            </p>
          </div>
          <div className="progress-card rounded-2xl border-4 border-orange-200 bg-white shadow-md">
            <p className="progress-card-label text-xs font-bold uppercase tracking-wider text-amber-700">{t('home.progress.latestBadge')}</p>
            {latestBadge ? (
              <div className="mt-2 space-y-1">
                <p className="text-base font-bold text-amber-900 sm:text-lg">{latestBadge.name}</p>
                <p className="text-sm font-semibold text-orange-600">{latestBadge.label}</p>
                <p className="progress-card-subtext text-xs font-semibold text-amber-700">{t('home.progress.tier', { tier: latestBadge.tier })} · {new Date(latestBadge.earnedAt).toLocaleDateString()}</p>
                <p className="progress-card-subtext text-xs text-amber-600">{latestBadge.summary}</p>
              </div>
            ) : (
              <p className="mt-3 text-sm font-semibold text-amber-600">{t('home.progress.playToUnlock')}</p>
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
