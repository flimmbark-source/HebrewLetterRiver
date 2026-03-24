import React, { useMemo, useState } from 'react';
import badgesCatalog from '../data/badges.json';
import { useProgress, STAR_LEVEL_SIZE } from '../context/ProgressContext.jsx';
import { DEFAULT_PROFILE_NAME, PROFILE_AVATARS } from '../data/profileAvatars.js';
import { useLocalization } from '../context/LocalizationContext.jsx';

const SECTION_GROUPS = [
  { key: 'letterRiver', label: 'Letter River', sections: ['classic', 'special', 'polyglot', 'dedication'] },
  { key: 'bridgeBuilder', label: 'Bridge Builder', sections: ['bridgeBuilder'] },
  { key: 'deepScript', label: 'Deep Script', sections: ['deepScript'] }
];

const DEFAULT_FALLBACK_GROUP = { key: 'moreAchievements', label: 'More Achievements', sections: [] };

function Icon({ children, className = '', filled = false }) {
  return (
    <span className={`material-symbols-outlined ${className}`} style={{ fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 500, 'GRAD' 0, 'opsz' 24` }}>
      {children}
    </span>
  );
}

function formatBadgeNameFromId(id = '') {
  return id
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function getBadgeCopy(badge, t, gameName, goal) {
  const localizedName = badge.nameKey ? t(badge.nameKey) : '';
  const localizedSummary = badge.summaryKey ? t(badge.summaryKey, { gameName, goal }) : '';
  const name = typeof localizedName === 'string' && localizedName.trim().length > 0
    ? localizedName
    : (badge.name || formatBadgeNameFromId(badge.id));
  const summary = typeof localizedSummary === 'string' && localizedSummary.trim().length > 0
    ? localizedSummary
    : (badge.summary || `Complete ${goal} milestone${goal === 1 ? '' : 's'}.`);
  return { name, summary };
}

function AwardCard({ badge, progress, onClaim, t }) {
  const totalTiers = badge.tiers.length;
  const unclaimed = Array.isArray(progress?.unclaimed) ? progress.unclaimed : [];
  const nextReward = unclaimed[0] ?? null;
  const tier = Math.max(progress?.tier ?? 0, 0);
  const tierIndex = Math.min(tier, totalTiers - 1);
  const tierSpec = badge.tiers[tierIndex];
  const goal = tierSpec?.goal ?? 1;
  const current = nextReward ? goal : Math.min(progress?.progress ?? 0, goal);
  const pct = Math.min((current / goal) * 100, 100);
  const { name, summary } = getBadgeCopy(badge, t, t('app.title'), goal);

  return (
    <button
      type="button"
      onClick={() => nextReward && onClaim(badge.id, nextReward.tier)}
      disabled={!nextReward}
      className={`w-full rounded-xl p-4 text-left shadow-sm transition ${nextReward ? 'bg-[#f9f1fd] hover:scale-[1.01]' : 'bg-white'}`}
    >
      <div className="mb-2 flex items-center justify-between">
        <h4 className="font-bold text-[#1d1a22]">{name}</h4>
        {nextReward ? <span className="rounded-full bg-[#1b6b4f] px-2 py-1 text-[10px] font-black text-white">CLAIM +{nextReward.stars}</span> : null}
      </div>
      <p className="text-xs text-[#4a6365]">{summary}</p>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#bec9c2]/30">
        <div className="h-full bg-[#1b6b4f]" style={{ width: `${pct}%` }}></div>
      </div>
    </button>
  );
}

export default function AchievementsView() {
  const { player, badges, activeBadges, starLevelSize, claimBadgeReward } = useProgress();
  const { t } = useLocalization();
  const [claiming, setClaiming] = useState(false);
  const [isAllAchievementsExpanded, setIsAllAchievementsExpanded] = useState(false);

  const starsPerLevel = starLevelSize ?? STAR_LEVEL_SIZE;
  const totalStarsEarned = Math.max(0, Math.floor(player?.totalStarsEarned ?? player?.stars ?? 0));
  const level = Math.max(1, player?.level ?? Math.floor(totalStarsEarned / starsPerLevel) + 1);
  const levelProgress = Math.max(0, Math.min(player?.levelProgress ?? (totalStarsEarned % starsPerLevel), starsPerLevel));
  const levelPercent = starsPerLevel > 0 ? Math.round((levelProgress / starsPerLevel) * 100) : 0;

  const recentBadge = useMemo(() => {
    if (!player.latestBadge) return null;
    const badge = badgesCatalog.find((item) => item.id === player.latestBadge.id);
    return badge ?? null;
  }, [player.latestBadge]);
  const gameName = t('app.title');

  const activeBadgeSpecs = useMemo(() => {
    return (activeBadges ?? [])
      .map((id) => badgesCatalog.find((badge) => badge.id === id))
      .filter(Boolean);
  }, [activeBadges]);

  const allBadges = useMemo(
    () => badgesCatalog.map((badge) => ({ badge, state: badges?.[badge.id] ?? { tier: 0, progress: 0, unclaimed: [] } })),
    [badges]
  );


  const sectionGroups = useMemo(() => {
    const knownSections = new Set(SECTION_GROUPS.flatMap((group) => group.sections));
    const discoveredSections = new Set(allBadges.map(({ badge }) => badge.section).filter(Boolean));
    const extraSections = Array.from(discoveredSections).filter((section) => !knownSections.has(section));
    if (extraSections.length === 0) return SECTION_GROUPS;
    return [
      ...SECTION_GROUPS,
      {
        ...DEFAULT_FALLBACK_GROUP,
        sections: extraSections
      }
    ];
  }, [allBadges]);

  const milestones = useMemo(() => {
    const active = activeBadgeSpecs.slice(1, 3);
    if (active.length > 0) return active;
    return badgesCatalog.slice(0, 2);
  }, [activeBadgeSpecs]);
  const claimableAwards = useMemo(
    () =>
      allBadges
        .filter(({ state }) => Array.isArray(state.unclaimed) && state.unclaimed.length > 0)
        .map(({ badge }) => badge),
    [allBadges]
  );

  const claimableByGroup = useMemo(() => {
    return sectionGroups.map((group) => ({
      ...group,
      badges: allBadges
        .filter(({ badge, state }) => group.sections.includes(badge.section) && Array.isArray(state.unclaimed) && state.unclaimed.length > 0)
        .map(({ badge }) => badge)
    }));
  }, [allBadges, sectionGroups]);

  const upcomingByGroup = useMemo(() => {
    return sectionGroups.map((group) => ({
      ...group,
      badges: (() => {
        const candidates = allBadges
          .filter(({ badge, state }) => {
            if (!group.sections.includes(badge.section)) return false;
            return !Array.isArray(state.unclaimed) || state.unclaimed.length === 0;
          })
          .sort((a, b) => (b.state.progress ?? 0) - (a.state.progress ?? 0));

        const inProgress = candidates.filter(({ state }) => (state.progress ?? 0) > 0);
        const source = inProgress.length > 0 ? inProgress : candidates.slice(0, 3);
        return source.map(({ badge }) => badge);
      })()
    }));
  }, [allBadges, sectionGroups]);

  const upcoming = useMemo(
    () =>
      upcomingByGroup
        .flatMap((group) => group.badges)
        .slice(0, 6),
    [upcomingByGroup]
  );

  const allByGroup = useMemo(() => {
    return sectionGroups.map((group) => ({
      ...group,
      badges: allBadges
        .filter(({ badge }) => group.sections.includes(badge.section))
        .map(({ badge }) => badge)
    }));
  }, [allBadges, sectionGroups]);
  const totalAchievementCount = allBadges.length;
  const playerName = player?.name || DEFAULT_PROFILE_NAME;
  const playerAvatar = player?.avatar || PROFILE_AVATARS[0];

  const handleClaim = (badgeId, tier) => {
    if (claiming) return;
    setClaiming(true);
    Promise.resolve(claimBadgeReward(badgeId, tier)).finally(() => setClaiming(false));
  };

  return (
    <div className="min-h-screen bg-[#fef7ff] px-6 pb-36 pt-24" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
      <header className="fixed left-0 right-0 top-0 z-40 bg-[#fef7ff]/80 backdrop-blur-xl">
        <div className="flex w-full items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 overflow-hidden rounded-full bg-[#a7f3d0]"><img alt="Profile" src={playerAvatar} className="h-full w-full object-cover" /></div>
            <h1 className="text-lg font-bold tracking-tight text-[#1b6b4f]">Level {level} • {totalStarsEarned.toLocaleString()} XP</h1>
          </div>
          <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-[#1b6b4f]/10"><Icon className="text-[#1b6b4f]" filled>local_fire_department</Icon></button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl">
        <section className="relative mb-10">
          <div className="relative overflow-hidden rounded-xl bg-[#1b6b4f] p-8 text-white shadow-lg">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#a7f3d0]/20 blur-3xl"></div>
            <div className="relative z-10">
              <p className="mb-1 text-sm font-bold opacity-80">CURRENT MILESTONE • {playerName}</p>
              <h2 className="mb-4 text-3xl font-extrabold tracking-tight">Step {Math.min(level + 3, 15)} of 15</h2>
              <div className="mb-2 h-4 w-full overflow-hidden rounded-full bg-white/20"><div className="h-full rounded-full bg-[#a7f3d0]" style={{ width: `${levelPercent}%` }}></div></div>
              <div className="flex justify-between text-xs font-bold">
                <span>{levelProgress} / {starsPerLevel} XP TO STEP {Math.min(level + 1, 15)}</span>
                <span className="text-[#a7f3d0]">{levelPercent}% COMPLETED</span>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-10 grid grid-cols-2 gap-4">
          <div className="col-span-2 flex items-center justify-between overflow-hidden rounded-lg bg-[#f9f1fd] p-6">
            <div className="flex-1">
              <span className="mb-3 inline-block rounded-full bg-[#fcb972] px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#774708]">Most Recent</span>
              <h3 className="mb-1 text-xl font-bold">
                {recentBadge ? getBadgeCopy(recentBadge, t, gameName, recentBadge?.tiers?.[0]?.goal ?? 1).name : 'Polyglot Pioneer'}
              </h3>
              <p className="text-sm text-[#3f4943]">
                {recentBadge ? getBadgeCopy(recentBadge, t, gameName, recentBadge?.tiers?.[0]?.goal ?? 1).summary : 'Completed 5 different language paths.'}
              </p>
            </div>
            <div className="ml-4 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm"><Icon className="text-4xl text-[#855315]" filled>emoji_events</Icon></div>
          </div>

          {milestones.map((badge, index) => {
            const state = badges?.[badge.id];
            const goal = badge.tiers[Math.min(state?.tier ?? 0, badge.tiers.length - 1)]?.goal ?? 1;
            const current = Math.min(state?.progress ?? 0, goal);
            const pct = Math.round((current / goal) * 100);
            return (
              <div key={badge.id} className={`flex flex-col rounded-lg p-5 ${index === 0 ? 'bg-[#e7e0eb]' : 'bg-[#f9f1fd]'}`}>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#1b6b4f]/10"><Icon className="text-[#1b6b4f]" filled>{index === 0 ? 'history_edu' : 'auto_awesome'}</Icon></div>
                <div>
                  <h4 className="mb-1 text-lg font-bold leading-tight">{getBadgeCopy(badge, t, gameName, goal).name}</h4>
                  <p className="text-xs text-[#3f4943]">{getBadgeCopy(badge, t, gameName, goal).summary}</p>
                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#bec9c2]/30"><div className="h-full bg-[#1b6b4f]" style={{ width: `${pct}%` }}></div></div>
                </div>
              </div>
            );
          })}
        </section>

        <h3 className="mb-6 text-xl font-extrabold text-[#1b6b4f]">Upcoming Milestones</h3>
        <div className="mb-10 space-y-4">
          {upcomingByGroup.map((group) => (
            <div key={group.key} className="space-y-2">
              <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#4a6365]">{group.label}</h4>
              {group.badges.length > 0 ? (
                group.badges.map((badge, index) => {
                  const state = badges?.[badge.id];
                  const goal = badge.tiers[Math.min(state?.tier ?? 0, badge.tiers.length - 1)]?.goal ?? 1;
                  const current = Math.min(state?.progress ?? 0, goal);
                  const pct = Math.round((current / goal) * 100);
                  return (
                    <div key={badge.id} className="flex items-center gap-5 rounded-xl p-4 transition-all hover:bg-[#f9f1fd]">
                      <div className="relative">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e7e0eb]"><Icon className="text-[#6f7973]">workspace_premium</Icon></div>
                        <div className="absolute -bottom-1 -right-1 rounded-full bg-white p-1 shadow-sm"><Icon className="text-[14px] text-[#1b6b4f]">lock</Icon></div>
                      </div>
                      <div className="flex-1">
                        <div className="mb-1 flex items-end justify-between">
                          <h4 className="font-bold">{getBadgeCopy(badge, t, gameName, goal).name}</h4>
                          <span className="text-[10px] font-bold text-[#3f4943]">STEP {10 + index}</span>
                        </div>
                        <p className="mb-2 text-xs text-[#3f4943]">{getBadgeCopy(badge, t, gameName, goal).summary}</p>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-[#e7e0eb]"><div className="h-full bg-[#1b6b4f]/30" style={{ width: `${pct}%` }}></div></div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-xl bg-white p-3 text-xs font-semibold text-[#6f7973]">No in-progress milestones in this section.</div>
              )}
            </div>
          ))}
          {upcoming.length === 0 ? (
            <div className="rounded-xl bg-white p-3 text-xs font-semibold text-[#6f7973]">No milestones in progress yet.</div>
          ) : null}
        </div>

        <section className="space-y-3">
          <h3 className="text-lg font-bold text-[#1b6b4f]">Claimable Awards</h3>
          {claimableByGroup.map((group) => (
            <div key={group.key} className="space-y-2">
              <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#4a6365]">{group.label}</h4>
              {group.badges.length > 0 ? (
                group.badges.map((badge) => (
                  <AwardCard key={badge.id} badge={badge} progress={badges?.[badge.id]} onClaim={handleClaim} t={t} />
                ))
              ) : (
                <div className="rounded-xl bg-white p-3 text-xs font-semibold text-[#6f7973]">No claimable awards in this section yet.</div>
              )}
            </div>
          ))}
          {claimableAwards.length === 0 ? (
            <div className="rounded-xl bg-white p-3 text-xs font-semibold text-[#6f7973]">No claimable awards right now.</div>
          ) : null}
          {claiming ? <p className="text-xs font-semibold text-[#4a6365]">Claiming reward...</p> : null}
        </section>

        <section className="mt-10 space-y-3">
          <button
            type="button"
            onClick={() => setIsAllAchievementsExpanded((prev) => !prev)}
            className="flex w-full items-center justify-between rounded-xl bg-white px-4 py-3 text-left shadow-sm"
            aria-expanded={isAllAchievementsExpanded}
          >
            <h3 className="text-lg font-bold text-[#1b6b4f]">All Achievements ({totalAchievementCount})</h3>
            <Icon className="text-[#1b6b4f]">{isAllAchievementsExpanded ? 'expand_less' : 'expand_more'}</Icon>
          </button>

          {isAllAchievementsExpanded ? (
            allByGroup.map((group) => (
              <div key={group.key} className="space-y-2">
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#4a6365]">{group.label}</h4>
                <div className="space-y-2">
                  {group.badges.map((badge) => (
                    <AwardCard key={badge.id} badge={badge} progress={badges?.[badge.id]} onClaim={handleClaim} t={t} />
                  ))}
                </div>
              </div>
            ))
          ) : null}

          {isAllAchievementsExpanded && totalAchievementCount === 0 ? (
            <div className="rounded-xl bg-white p-3 text-xs font-semibold text-[#6f7973]">No achievements available yet.</div>
          ) : null}
        </section>
      </main>
    </div>
  );
}
