import React, { useCallback, useMemo, useState } from 'react';
import badgesCatalog from '../data/badges.json';
import { useProgress, STAR_LEVEL_SIZE } from '../context/ProgressContext.jsx';
import { useGame } from '../context/GameContext.jsx';
import { useLocalization } from '../context/LocalizationContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { formatJerusalemTime, millisUntilNextJerusalemMidnight } from '../lib/time.js';
import { classNames } from '../lib/classNames.js';
import { PlayfulButton, PlayfulIconButton } from '../components/PlayfulButton.jsx';
import { PlayfulContainer, PlayfulBadge } from '../components/PlayfulContainer.jsx';

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
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
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

  const statusLabel = task.rewardClaimed
    ? t('home.quest.collected')
    : task.completed
    ? t('home.quest.complete')
    : t('home.quest.inProgress');

  return (
    <PlayfulContainer
      variant="card"
      className={classNames(
        'transition-all duration-200',
        canClaimReward && 'ring-4 ring-playful-yellow-300 animate-pulse'
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-playful-brown-600">{task.title}</p>
          <h3 className="text-lg font-bold text-playful-brown-900 sm:text-xl">{task.description}</h3>
        </div>
        <PlayfulBadge variant={task.rewardClaimed ? 'green' : 'cyan'}>
          {questLabel}
        </PlayfulBadge>
      </div>
      {rewardValue > 0 && (
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xl font-bold text-playful-orange-600">+{formattedReward} ⭐</span>
          {task.rewardClaimed && (
            <span className="text-sm font-bold text-green-600">✓ {t('home.quest.collectedShort')}</span>
          )}
        </div>
      )}
      <div className="mt-4 h-4 rounded-full border-2 border-playful-brown-300 bg-playful-beige shadow-inner">
        <div
          className="h-full rounded-full bg-gradient-to-r from-playful-orange-400 to-playful-yellow-400 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="mt-3 flex items-center justify-between text-sm font-semibold text-playful-brown-700">
        <span>{statusLabel}</span>
        <span>{progressValue}</span>
      </div>
      {canClaimReward && (
        <div className="mt-4">
          <PlayfulButton
            variant="secondary"
            size="sm"
            onClick={onClaimReward}
            disabled={claimingReward}
            className="w-full"
          >
            {claimingReward ? t('home.quest.claiming') : `🎉 Claim +${formattedReward} ⭐`}
          </PlayfulButton>
        </div>
      )}
    </PlayfulContainer>
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
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8 text-center text-slate-400">
        Loading daily quests…
      </div>
    );
  }

  const nextResetDate = useMemo(() => new Date(Date.now() + millisUntilNextJerusalemMidnight()), [daily?.dateKey]);
  const nextResetTime = formatJerusalemTime(nextResetDate, { timeZoneName: 'short' });
  const totalQuests = daily?.tasks?.length ?? 0;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Letter River Header */}
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-playful-brown-800 drop-shadow-sm sm:text-4xl">{t('app.title')}</h1>
        <PlayfulIconButton
          variant="secondary"
          size="md"
          onClick={() => setAppLanguageSelectorExpanded(true)}
          aria-label={t('app.languagePicker.label')}
        >
          <GlobeIcon className="h-6 w-6" />
        </PlayfulIconButton>
      </header>

      {/* App Language Selector Overlay */}
      {appLanguageSelectorExpanded && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setAppLanguageSelectorExpanded(false)}
          />
          {/* Overlay Panel */}
          <div className="fixed left-1/2 top-1/2 z-50 w-[90%] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-playful-xl border-4 border-playful-brown-600 bg-playful-cream p-6 shadow-playful-xl">
            {/* Close Button */}
            <button
              onClick={() => setAppLanguageSelectorExpanded(false)}
              className="absolute -right-3 -top-3 flex h-10 w-10 items-center justify-center rounded-full border-4 border-playful-brown-700 bg-playful-red-500 text-white shadow-playful transition-all hover:bg-playful-red-400 active:translate-y-1"
              aria-label="Close"
            >
              <XIcon className="h-5 w-5" />
            </button>

            <h3 className="mb-4 text-center text-xl font-bold text-playful-brown-800">
              {t('app.languagePicker.label')}
            </h3>

            <select
              id="home-app-language-select"
              value={appLanguageId}
              onChange={(event) => {
                selectAppLanguage(event.target.value);
                setAppLanguageSelectorExpanded(false);
              }}
              className="w-full rounded-playful border-4 border-playful-brown-400 bg-white px-4 py-3 text-base font-semibold text-playful-brown-900 shadow-inner-playful focus:border-playful-orange-500 focus:outline-none focus:ring-4 focus:ring-playful-orange-200"
            >
              {languageOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>

            <p className="mt-3 text-center text-sm text-playful-brown-600">
              {t('app.languagePicker.helper')}
            </p>
          </div>
        </>
      )}

      {/* Main Content - Choose Your Adventure */}
      <PlayfulContainer variant="wooden-header" title={t('home.hero.heading')}>
        <p className="mb-6 text-center text-base text-playful-brown-700 sm:text-lg">
          {t('home.hero.description')}
        </p>

        <div className="rounded-playful-lg border-4 border-playful-orange-200 bg-white p-4 shadow-inner-playful">
          <label htmlFor="home-practice-language-select" className="mb-2 block text-xs font-bold uppercase tracking-wider text-playful-brown-600">
            {t('home.languagePicker.label')}
          </label>
          <select
            id="home-practice-language-select"
            value={languageId}
            onChange={(event) => selectLanguage(event.target.value)}
            className="w-full rounded-playful border-4 border-playful-brown-400 bg-playful-beige px-4 py-3 text-base font-semibold text-playful-brown-900 shadow-inner-playful focus:border-playful-orange-500 focus:outline-none focus:ring-4 focus:ring-playful-orange-200"
          >
            {languageOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs font-semibold text-playful-brown-600">{t('home.languagePicker.helper')}</p>
        </div>
      </PlayfulContainer>

      {/* Progress Section */}
      <PlayfulContainer variant="panel">
        <h2 className="mb-4 text-xl font-bold text-playful-brown-800 sm:text-2xl">{t('home.progress.heading')}</h2>
        <div className="progress-cards-container">
          <PlayfulContainer variant="card">
            <p className="text-xs font-bold uppercase tracking-wider text-playful-brown-600">{t('home.progress.streak')}</p>
            <p className="mt-2 text-3xl font-bold text-playful-orange-600">{t('home.progress.days', { count: streak.current })}</p>
            <p className="mt-1 text-xs font-semibold text-playful-brown-500">{t('home.progress.resetsAt', { time: nextResetTime })}</p>
          </PlayfulContainer>

          <PlayfulContainer variant="card">
            <p className="text-xs font-bold uppercase tracking-wider text-playful-brown-600">{t('home.progress.starLevel')}</p>
            <div className="mt-2 flex items-baseline justify-between">
              <p className="text-3xl font-bold text-playful-orange-600">{t('home.progress.level', { level })}</p>
              <p className="text-sm font-semibold text-playful-brown-500">{t('home.progress.totalStars', { count: formatNumber(totalStarsEarned) })}</p>
            </div>
            <div className="mt-3 h-3 rounded-full border-2 border-playful-brown-300 bg-playful-beige shadow-inner">
              <div className="h-full rounded-full bg-gradient-to-r from-playful-orange-400 to-playful-yellow-400" style={{ width: `${starsProgress * 100}%` }} />
            </div>
            <p className="mt-2 text-sm font-semibold text-playful-brown-700">
              {t('home.progress.toNextLevel', { current: formatNumber(levelProgress), total: formatNumber(starsPerLevel) })}
            </p>
          </PlayfulContainer>

          <PlayfulContainer variant="card">
            <p className="text-xs font-bold uppercase tracking-wider text-playful-brown-600">{t('home.progress.latestBadge')}</p>
            {latestBadge ? (
              <div className="mt-2 space-y-1">
                <p className="text-lg font-bold text-playful-brown-900">{latestBadge.name}</p>
                <p className="text-sm font-semibold text-playful-orange-600">{latestBadge.label}</p>
                <p className="text-xs font-semibold text-playful-brown-600">
                  {t('home.progress.tier', { tier: latestBadge.tier })} · {new Date(latestBadge.earnedAt).toLocaleDateString()}
                </p>
                <p className="text-xs text-playful-brown-500">{latestBadge.summary}</p>
              </div>
            ) : (
              <p className="mt-3 text-sm font-semibold text-playful-brown-500">{t('home.progress.playToUnlock')}</p>
            )}
          </PlayfulContainer>
        </div>
      </PlayfulContainer>
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
