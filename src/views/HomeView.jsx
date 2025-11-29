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

  const cardClass = clickable
    ? 'cursor-pointer hover:scale-[1.02] bg-gradient-to-b from-cyan-900/60 via-slate-900/80 to-slate-950 border-2 border-cyan-700/50 shadow-[0_12px_24px_rgba(0,0,0,0.4)] animate-pulse hover:shadow-[0_16px_32px_rgba(6,182,212,0.3)]'
    : 'bg-gradient-to-b from-slate-800/80 via-slate-900/90 to-slate-950 border-2 border-slate-700/80 shadow-[0_12px_24px_rgba(0,0,0,0.4)]';

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
      className={`quest-card rounded-[28px] p-6 transition-all sm:p-8 ${cardClass} ${clickable ? 'hover:shadow-[0_16px_32px_rgba(6,182,212,0.3)] active:translate-y-1 active:shadow-[0_8px_16px_rgba(0,0,0,0.4)]' : 'hover:shadow-[0_14px_28px_rgba(0,0,0,0.5)]'}`}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      aria-label={clickable ? `Claim ${formattedReward} stars for quest` : undefined}
    >
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-base font-semibold text-white sm:text-lg">{task.description}</h3>
        <span className="flex-shrink-0 rounded-full border border-cyan-500/40 bg-cyan-500/10 px-2.5 py-0.5 text-xs font-semibold text-cyan-200">
          {questLabel}
        </span>
      </div>
      <div className="mt-5 flex items-center justify-between">
        <span className="text-base font-bold text-slate-200">{progressValue}</span>
        {rewardValue > 0 && (
          <span className={`text-base font-bold ${clickable ? 'text-amber-300 animate-pulse' : 'text-amber-200'}`}>
            {clickable && '✨ '}+{formattedReward} ⭐{clickable && ' ✨'}
          </span>
        )}
      </div>
      <div className="mt-3 h-4 rounded-full bg-slate-800/80 shadow-inner">
        <div className="h-full rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-cyan-400 shadow-[0_2px_8px_rgba(251,191,36,0.5)] transition-all duration-300" style={{ width: `${percentage}%` }} />
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
    <>
      {/* Player Header */}
      <header className="player-header">
        <div className="player-meta">
          <div className="avatar"></div>
          <div className="player-text">
            <div className="player-name">Player</div>
            <div className="player-level">{t('home.progress.level', { level })}</div>
            <div className="player-rank">{latestBadge?.label || 'Patient Paddler'}</div>
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
                  aria-label="Close"
                >
                  <XIcon className="h-3 w-3" />
                </button>

                <h3 className="mb-3 text-center font-heading text-sm font-bold text-arcade-text-main">
                  {t('app.languagePicker.label')}
                </h3>

                <select
                  id="home-app-language-select"
                  value={appLanguageId}
                  onChange={(event) => selectAppLanguage(event.target.value)}
                  className="w-full rounded-xl border-2 border-arcade-panel-border bg-arcade-panel-light px-3 py-2 text-xs font-semibold text-arcade-text-main shadow-inner"
                >
                  {languageOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>

                <h3 className="mb-2 mt-4 text-center font-heading text-sm font-bold text-arcade-text-main">
                  {t('home.languagePicker.label')}
                </h3>

                <select
                  id="home-practice-language-select"
                  value={languageId}
                  onChange={(event) => selectLanguage(event.target.value)}
                  className="w-full rounded-xl border-2 border-arcade-panel-border bg-arcade-panel-light px-3 py-2 text-xs font-semibold text-arcade-text-main shadow-inner"
                >
                  {languageOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Card */}
      <section className="hero-card">
        <h1 className="hero-title">{t('app.title')}</h1>
        <p className="hero-body">
          <span>{t('app.tagline')}</span>
        </p>
        <button className="hero-cta" onClick={() => openGame({ autostart: false })}>Play</button>
      </section>

      {/* Progress Section */}
      <section className="section">
        <div className="section-header">
          <div className="section-title">
            <div className="wood-header">{t('home.progress.heading')}</div>
          </div>
          <div className="section-link">View details</div>
        </div>
        <div className="progress-row">
          <div className="progress-card-small">
            <div className="progress-icon red">🔥</div>
            <div className="progress-label">{t('home.progress.streak')}</div>
            <div className="progress-value">{t('home.progress.days', { count: streak.current })}</div>
            <div className="progress-sub">{t('home.progress.resetsAt', { time: nextResetTime })}</div>
          </div>
          <div className="progress-card-small">
            <div className="progress-icon gold">★</div>
            <div className="progress-label">{t('home.progress.starLevel')}</div>
            <div className="progress-value">{t('home.progress.level', { level })}</div>
            <div className="progress-bar-shell">
              <div className="progress-bar-fill" style={{ width: `${starsProgress * 100}%` }}></div>
            </div>
            <div className="progress-sub">
              {t('home.progress.toNextLevel', { current: formatNumber(levelProgress), total: formatNumber(starsPerLevel) })}
            </div>
          </div>
          <div className="progress-card-small">
            <div className="progress-icon cyan">🏅</div>
            <div className="progress-label">{t('home.progress.latestBadge')}</div>
            <div className="progress-value">{latestBadge?.name || 'None yet'}</div>
            <div className="progress-sub">{latestBadge ? latestBadge.label : t('home.progress.playToUnlock')}</div>
          </div>
        </div>
      </section>

      {/* Daily Quests Section */}
      {daily?.tasks && daily.tasks.length > 0 && (
        <section className="section">
          <div className="section-header">
            <div className="section-title">
              <div className="wood-header">Daily quests</div>
            </div>
            <div className="section-link">Resets at {nextResetTime}</div>
          </div>
          {daily.tasks.map((task, index) => {
            const percentage = Math.min((task.progress ?? 0) / task.goal, 1) * 100;
            const rewardValue = Number.isFinite(task.rewardStars) ? Math.max(0, task.rewardStars) : 0;
            const canClaimReward = Boolean(task.rewardClaimable) && !task.rewardClaimed;
            const currentProgress = Math.min(task.progress ?? 0, task.goal);

            return (
              <div key={task.id} className="quest-card">
                <div className="quest-left">
                  <div className="quest-top-row">
                    <div className="quest-title">{task.description}</div>
                    {rewardValue > 0 && (
                      <div className="quest-reward-inline">
                        +{rewardValue} <span className="star-inline">★</span>
                      </div>
                    )}
                  </div>
                  <div className="quest-progress-meta">
                    {currentProgress} / {task.goal}
                  </div>
                  <div className="quest-progress-bar">
                    <div className="quest-progress-fill" style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
                <button
                  className={`quest-cta ${canClaimReward ? 'active' : ''}`}
                  onClick={() => canClaimReward && handleDailyClaim(task.id)}
                  disabled={!canClaimReward || claimingTaskId === task.id}
                >
                  {task.rewardClaimed ? 'Done' : canClaimReward ? 'Claim' : 'Locked'}
                </button>
              </div>
            );
          })}
        </section>
      )}
    </>
  );
}
