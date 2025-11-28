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
    'quest-badge self-start rounded-full border px-3 py-1',
    statusPillClass,
    clickable && [
      'cursor-pointer',
      'transition-all',
      'hover:bg-amber-400/20',
      'hover:border-amber-400/60',
      'hover:scale-105',
      'focus:outline-none',
      'focus-visible:ring-2',
      'focus-visible:ring-amber-200/70'
    ],
    !clickable && 'cursor-default'
  );

  return (
    <div className="quest-card rounded-3xl border border-slate-800 bg-slate-900/60 shadow-inner transition hover:border-cyan-500/40">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <p className="quest-category text-slate-400">{task.title}</p>
          <h3 className="quest-title text-white">{task.description}</h3>
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
          <span className="quest-reward-text text-amber-200">+{formattedReward} ⭐</span>
          {task.rewardClaimed && (
            <span className="quest-reward-text text-emerald-300">{t('home.quest.collectedShort')}</span>
          )}
        </div>
      )}
      <div className="mt-4 h-2 rounded-full bg-slate-800">
        <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-cyan-400" style={{ width: `${percentage}%` }} />
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="quest-progress-text text-slate-300">{statusLabel}</span>
        <span className="quest-progress-text text-slate-300">{progressValue}</span>
      </div>
    </div>
  );
}

export default function HomeView() {
  const { player, streak, daily, starLevelSize, claimDailyReward } = useProgress();

  const { openGame } = useGame();
  const { t } = useLocalization();
  const { languageId, selectLanguage, languageOptions } = useLanguage();
  const [languageSelectorExpanded, setLanguageSelectorExpanded] = useState(false);

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
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 text-center text-slate-400">
        Loading daily quests…
      </div>
    );
  }

  const nextResetDate = useMemo(() => new Date(Date.now() + millisUntilNextJerusalemMidnight()), [daily?.dateKey]);
  const nextResetTime = formatJerusalemTime(nextResetDate, { timeZoneName: 'short' });
  const totalQuests = daily?.tasks?.length ?? 0;

  return (
    <div className="space-y-8 sm:space-y-10">
      <section
        className={classNames(
          'rounded-3xl border border-cyan-500/20',
          'bg-gradient-to-br from-slate-900 to-slate-950',
          'p-6 shadow-2xl',
          'sm:p-8'
        )}
      >
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-bold text-white sm:text-4xl">{t('home.hero.heading')}</h1>
            <p className="mt-3 text-sm text-slate-300 sm:max-w-2xl sm:text-base">{t('home.hero.description')}</p>
          </div>
          <div className="flex justify-end">
            <div className="relative">
              {languageSelectorExpanded ? (
                <div
                  onClick={() => setLanguageSelectorExpanded(false)}
                  className="cursor-pointer rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-inner transition hover:border-slate-700"
                >
                  <label htmlFor="home-language-select" className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    {t('home.languagePicker.label')}
                  </label>
                  <select
                    id="home-language-select"
                    value={languageId}
                    onChange={(event) => {
                      event.stopPropagation();
                      selectLanguage(event.target.value);
                    }}
                    onClick={(event) => event.stopPropagation()}
                    className={classNames(
                      'mt-2 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100',
                      'focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40',
                      'sm:text-base sm:min-w-[200px]'
                    )}
                  >
                    {languageOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-xs text-slate-400">{t('home.languagePicker.helper')}</p>
                </div>
              ) : (
                <button
                  onClick={() => setLanguageSelectorExpanded(true)}
                  className="flex h-12 w-12 items-center justify-center rounded-xl border border-slate-700 bg-slate-900/70 text-slate-300 transition hover:border-cyan-500/40 hover:bg-slate-800/70 hover:text-cyan-300"
                  aria-label={t('home.languagePicker.label')}
                >
                  <GlobeIcon className="h-6 w-6" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6">
        <h2 className="text-base font-semibold text-slate-200 sm:text-lg">{t('home.progress.heading')}</h2>
        <div className="progress-cards-container mt-4">
          <div className="progress-card border border-slate-800 bg-slate-900/70">
            <p className="progress-card-label text-slate-400">{t('home.progress.streak')}</p>
            <p className="progress-card-value text-white">{t('home.progress.days', { count: streak.current })}</p>
            <p className="progress-card-subtext text-slate-500">{t('home.progress.resetsAt', { time: nextResetTime })}</p>
          </div>
          <div className="progress-card border border-slate-800 bg-slate-900/70">
            <p className="progress-card-label text-slate-400">{t('home.progress.starLevel')}</p>
            <div className="mt-2 flex items-baseline justify-between">
              <p className="progress-card-value text-white">{t('home.progress.level', { level })}</p>
              <p className="progress-card-subtext text-slate-500">{t('home.progress.totalStars', { count: formatNumber(totalStarsEarned) })}</p>
            </div>
            <div className="mt-3 h-2 rounded-full bg-slate-800">
              <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-sky-500" style={{ width: `${starsProgress * 100}%` }} />
            </div>
            <p className="mt-2 text-sm text-slate-300">
              {t('home.progress.toNextLevel', { current: formatNumber(levelProgress), total: formatNumber(starsPerLevel) })}
            </p>
          </div>
          <div className="progress-card border border-slate-800 bg-slate-900/70">
            <p className="progress-card-label text-slate-400">{t('home.progress.latestBadge')}</p>
            {latestBadge ? (
              <div className="mt-2 space-y-1">
                <p className="text-base font-semibold text-white sm:text-lg">{latestBadge.name}</p>
                <p className="text-sm text-cyan-300">{latestBadge.label}</p>
                <p className="progress-card-subtext text-slate-400">{t('home.progress.tier', { tier: latestBadge.tier })} · {new Date(latestBadge.earnedAt).toLocaleDateString()}</p>
                <p className="progress-card-subtext text-slate-500">{latestBadge.summary}</p>
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-400">{t('home.progress.playToUnlock')}</p>
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
