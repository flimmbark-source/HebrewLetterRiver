import React, { useCallback, useMemo, useState } from 'react';
import badgesCatalog from '../data/badges.json';
import { useProgress, STAR_LEVEL_SIZE } from '../context/ProgressContext.jsx';
import { useGame } from '../context/GameContext.jsx';
import { useLocalization } from '../context/LocalizationContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { formatJerusalemTime, millisUntilNextJerusalemMidnight } from '../lib/time.js';

function TaskCard({
  task,
  questNumber = 1,
  totalQuests = 1,
  showReward = false,
  rewardStars = 0,
  rewardClaimed = false,
  canClaimReward = false,
  claimingReward = false,
  onClaimReward
}) {
  const percentage = Math.min((task.progress ?? 0) / task.goal, 1) * 100;
  const rewardValue = Number.isFinite(rewardStars) ? Math.max(0, rewardStars) : 0;
  const formattedReward = rewardValue.toLocaleString();
  const clickable = showReward && canClaimReward && typeof onClaimReward === 'function';
  const highlightClass = showReward
    ? canClaimReward
      ? 'border-amber-400/40 ring-1 ring-amber-300/60 shadow-amber-300/20'
      : rewardClaimed
      ? 'border-emerald-400/40'
      : ''
    : '';
  const questLabel = `Quest ${questNumber} of ${totalQuests}`;
  const rewardSummary = rewardValue > 0 ? ` · +${formattedReward} ⭐` : '';
  const statusLabel = canClaimReward
    ? `Claim Daily Reward${rewardSummary}`
    : rewardClaimed
    ? 'Daily reward collected'
    : task.completed
    ? 'Waiting on other quests…'
    : 'Complete this quest to unlock the daily reward.';
  const statusPillClass = 'border-cyan-500/40 bg-cyan-500/10 text-cyan-200';
  const currentProgress = Math.min(task.progress ?? 0, task.goal);
  const progressValue = `${currentProgress} / ${task.goal}`;

  const handleCardClick = () => {
    if (!clickable || claimingReward) return;
    onClaimReward();
  };

  const handleKeyDown = (event) => {
    if (!clickable || claimingReward) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClaimReward();
    }
  };

  const handleClaimClick = (event) => {
    if (event) {
      event.stopPropagation();
    }
    if (!clickable || claimingReward) return;
    onClaimReward();
  };

  return (
    <div
      className={`rounded-3xl border border-slate-800 bg-slate-900/60 p-5 shadow-inner transition hover:border-cyan-500/40 sm:p-6 ${
        highlightClass
      } ${clickable ? 'cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-200/70' : ''}`}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400 sm:text-sm">{task.title}</p>
          <h3 className="text-lg font-semibold text-white sm:text-xl">{task.description}</h3>
        </div>
        <span className={`self-start rounded-full border px-3 py-1 text-xs font-semibold sm:text-sm ${statusPillClass}`}>
          {questLabel}
        </span>
      </div>
      <div className="mt-5 h-2 rounded-full bg-slate-800">
        <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-cyan-400" style={{ width: `${percentage}%` }} />
      </div>
      <div className="mt-4 flex items-center justify-between text-sm text-slate-300">
        <span>{statusLabel}</span>
        <span>{progressValue}</span>
      </div>
      {showReward && rewardValue > 0 && (
        <div className="mt-4 space-y-3 rounded-2xl border border-amber-400/50 bg-amber-400/10 p-4">
          <div className="flex items-center justify-between text-sm text-amber-100">
            <span>Daily reward</span>
            <span>+{formattedReward} ⭐</span>
          </div>
          {canClaimReward ? (
            <button
              type="button"
              onClick={handleClaimClick}
              disabled={claimingReward}
              className="w-full rounded-xl border border-amber-400/50 bg-amber-400/10 px-4 py-2 text-sm font-semibold text-amber-100 transition hover:bg-amber-400/20 focus:outline-none focus:ring-2 focus:ring-amber-300/60 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {claimingReward ? 'Claiming…' : `Claim Daily Reward${rewardSummary}`}
            </button>
          ) : (
            rewardClaimed && <p className="text-xs text-amber-100/80">Reward collected</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function HomeView() {
  const { player, streak, daily, getWeakestLetter, starLevelSize, claimDailyReward } = useProgress();

  const { openGame } = useGame();
  const { t } = useLocalization();
  const { languageId, selectLanguage, languageOptions } = useLanguage();

  const latestBadge = useMemo(() => {
    if (!player.latestBadge) return null;
    const badge = badgesCatalog.find((item) => item.id === player.latestBadge.id);
    const tierSpec = badge?.tiers?.find((item) => item.tier === player.latestBadge.tier);

    const nameKey = player.latestBadge.nameKey ?? badge?.nameKey;
    const labelKey = player.latestBadge.labelKey ?? tierSpec?.labelKey;
    const summaryKey = player.latestBadge.summaryKey ?? badge?.summaryKey;

    const name = nameKey ? t(nameKey) : player.latestBadge.name ?? badge?.name ?? player.latestBadge.id;
    const label = labelKey ? t(labelKey) : player.latestBadge.label ?? tierSpec?.label ?? '';
    const summary = summaryKey ? t(summaryKey) : player.latestBadge.summary ?? badge?.summary ?? '';

    return {
      ...player.latestBadge,
      name,
      label,
      summary
    };
  }, [player.latestBadge, t]);

  const focusLetter = useMemo(() => {
    const focusTask = daily?.tasks?.find((task) => task.id === 'focus');
    if (focusTask?.meta?.letter) return focusTask.meta.letter;
    return getWeakestLetter().hebrew;
  }, [daily?.tasks, getWeakestLetter]);
  
  const starsPerLevel = starLevelSize ?? STAR_LEVEL_SIZE;
  const totalStarsEarned = player.totalStarsEarned ?? player.stars ?? 0;
  const level = player.level ?? Math.floor(totalStarsEarned / starsPerLevel) + 1;
  const levelProgress = player.levelProgress ?? (totalStarsEarned % starsPerLevel);
  const starsProgress = starsPerLevel > 0 ? Math.min(levelProgress / starsPerLevel, 1) : 0;
  const formatNumber = useCallback((value) => Math.max(0, Math.floor(value ?? 0)).toLocaleString(), []);
  const rewardStars = Number.isFinite(daily?.rewardStars) ? daily.rewardStars : 0;
  const rewardClaimed = Boolean(daily?.rewardClaimed);
  const rewardClaimable = daily?.rewardClaimable ?? (Boolean(daily?.completed) && !rewardClaimed);
  const canClaimDaily = rewardClaimable && !rewardClaimed;
  const [dailyClaiming, setDailyClaiming] = useState(false);

  const handleDailyClaim = useCallback(() => {
    if (!canClaimDaily || dailyClaiming) return;
    setDailyClaiming(true);
    Promise.resolve(claimDailyReward())
      .finally(() => {
        setDailyClaiming(false);
      });
  }, [canClaimDaily, dailyClaiming, claimDailyReward]);

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
      <section className="rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-slate-900 to-slate-950 p-6 shadow-2xl sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-3 text-center sm:text-left">
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-300 sm:text-sm">{t('home.hero.dailyTitle')}</p>
            <h1 className="text-3xl font-bold text-white sm:text-4xl">{t('home.hero.heading')}</h1>
            <p className="text-sm text-slate-300 sm:max-w-2xl sm:text-base">{t('home.hero.description')}</p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:min-w-[260px]">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-inner">
              <label htmlFor="home-language-select" className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                {t('home.languagePicker.label')}
              </label>
              <select
                id="home-language-select"
                value={languageId}
                onChange={(event) => selectLanguage(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 sm:text-base"
              >
                {languageOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-slate-400">{t('home.languagePicker.helper')}</p>
            </div>
            <button
              onClick={() => openGame({ mode: 'letters' })}
              className="w-full rounded-full bg-cyan-500 px-5 py-3 text-base font-semibold text-slate-900 shadow-lg transition hover:bg-cyan-400 hover:shadow-cyan-500/30 sm:w-auto sm:px-6 sm:text-lg"
            >
              {t('home.cta.start')}
            </button>
            <button
              onClick={() => openGame({ mode: 'letters', forceLetter: focusLetter })}
              className="w-full rounded-full border border-cyan-500/60 px-5 py-3 text-base font-semibold text-cyan-300 transition hover:border-cyan-400 hover:text-cyan-200 sm:w-auto sm:px-6 sm:text-lg"
            >
              {t('home.cta.practice')}
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6">
        <h2 className="text-base font-semibold text-slate-200 sm:text-lg">Progress today</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400 sm:text-sm">Streak</p>
            <p className="mt-2 text-2xl font-semibold text-white sm:text-3xl">{streak.current} days</p>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">Resets at 00:00 Asia/Jerusalem ({nextResetTime})</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400 sm:text-sm">Star level</p>
            <div className="mt-2 flex items-baseline justify-between">
              <p className="text-2xl font-semibold text-white sm:text-3xl">Level {level}</p>
              <p className="text-xs text-slate-500 sm:text-sm">{formatNumber(totalStarsEarned)} ⭐ total</p>
            </div>
            <div className="mt-3 h-2 rounded-full bg-slate-800">
              <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-sky-500" style={{ width: `${starsProgress * 100}%` }} />
            </div>
            <p className="mt-2 text-sm text-slate-300">
              {formatNumber(levelProgress)} / {formatNumber(starsPerLevel)} ⭐ to next level
            </p>
            <p className="mt-1 text-xs text-slate-500">Claim badge tiers and daily rewards to earn more stars.</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400 sm:text-sm">Latest badge</p>
            {latestBadge ? (
              <div className="mt-2 space-y-1">
                <p className="text-base font-semibold text-white sm:text-lg">{latestBadge.name}</p>
                <p className="text-sm text-cyan-300">{latestBadge.label}</p>
                <p className="text-xs text-slate-400 sm:text-sm">Tier {latestBadge.tier} · {new Date(latestBadge.earnedAt).toLocaleDateString()}</p>
                <p className="text-xs text-slate-500 sm:text-sm">{latestBadge.summary}</p>
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-400">Play a session to start unlocking achievements.</p>
            )}
          </div>
        </div>
      </section>
      <section className="grid gap-5 sm:gap-6 lg:grid-cols-3">
        {daily?.tasks?.map((task, index) => (
          <TaskCard
            key={task.id}
            task={task}
            questNumber={index + 1}
            totalQuests={totalQuests}
            showReward
            rewardStars={rewardStars}
            rewardClaimed={rewardClaimed}
            canClaimReward={canClaimDaily}
            claimingReward={dailyClaiming}
            onClaimReward={handleDailyClaim}
          />
        ))}
      </section>

    </div>
  );
}
