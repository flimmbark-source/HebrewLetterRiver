import React from 'react';
import badgesCatalog from '../data/badges.json';
import { useProgress } from '../context/ProgressContext.jsx';

function BadgeCard({ badge, progress }) {
  const totalTiers = badge.tiers.length;
  const isMaxed = progress.tier >= totalTiers;
  const nextTier = isMaxed ? badge.tiers[totalTiers - 1] : badge.tiers[progress.tier];
  const nextGoal = nextTier.goal;
  const currentProgress = isMaxed ? nextGoal : progress.progress;
  const percent = isMaxed ? 100 : Math.min((progress.progress / nextGoal) * 100, 100);
  const tierLabel = nextTier.label;

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 shadow-inner transition hover:border-cyan-500/30 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400 sm:text-sm">{badge.name}</p>
          <h3 className="text-lg font-semibold text-white sm:text-xl">{badge.summary}</h3>
        </div>
        <span className="self-start rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-200 sm:text-sm">
          Tier {Math.min(progress.tier + 1, totalTiers)} / {totalTiers}
        </span>
      </div>
      <div className="mt-5 h-2 rounded-full bg-slate-800">
        <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-cyan-400" style={{ width: `${percent}%` }} />
      </div>
      <div className="mt-4 flex items-center justify-between text-sm text-slate-300">
        <span>{isMaxed ? 'All tiers complete' : `Next: ${tierLabel}`}</span>
        <span>
          {currentProgress} / {nextGoal}
        </span>
      </div>
      {!isMaxed ? (
        <p className="mt-2 text-xs text-slate-500">Earn +{nextTier.stars} ⭐ when you unlock this tier.</p>
      ) : (
        <p className="mt-2 text-xs text-emerald-300">Badge fully mastered — enjoy the glow!</p>
      )}
    </div>
  );
}

export default function AchievementsView() {
  const { badges } = useProgress();

  return (
    <div className="space-y-8 sm:space-y-10">
      <section className="rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-slate-900 to-slate-950 p-6 shadow-2xl sm:p-8">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">Achievements</h1>
        <p className="mt-3 text-sm text-slate-300 sm:max-w-2xl sm:text-base">
          Advance through each tier to collect stars. Every milestone fuels your journey down the Hebrew Letter River.
        </p>
      </section>

      <section className="grid gap-5 sm:gap-6 lg:grid-cols-2">
        {badgesCatalog.map((badge) => (
          <BadgeCard key={badge.id} badge={badge} progress={badges[badge.id] ?? { tier: 0, progress: 0 }} />
        ))}
      </section>
    </div>
  );
}
