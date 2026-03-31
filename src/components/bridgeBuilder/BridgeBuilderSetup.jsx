import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { getSectionsInOrder } from '../../data/bridgeBuilderSections.js';
import { getPacksBySection } from '../../data/bridgeBuilderPacks.js';
import {
  getAllWordProgress,
  getPackProgress,
  isPackUnlocked,
  getSectionProgress,
  isSectionUnlocked,
  getDueReviewWordIds,
  getWeakWordIds,
  getAllPackCompletions,
} from '../../lib/bridgeBuilderStorage.js';
import { getRecommendedSessionForPack } from '../../data/bridgeBuilderSessions.js';
import { emit } from '../../lib/eventBus.js';
import {
  getPackButtonLabel,
  GOAL_FILTERS,
  formatEstimatedMinutes,
  matchesGoal,
  matchesQuery,
  sortPackData,
} from './bridgeBuilderSetupHelpers.js';
import './BridgeBuilderSetup.css';

/* ─── Section visual metadata ──────────────────────────────── */

const SECTION_META = {
  foundations: { icon: 'school', accent: 'primary' },
  daily_life: { icon: 'home', accent: 'secondary' },
  people_social: { icon: 'groups', accent: 'tertiary' },
  meaning_builders: { icon: 'auto_stories', accent: 'primary' },
  cafe_talk: { icon: 'coffee', accent: 'secondary' },
};

function getSectionMeta(sectionId) {
  return SECTION_META[sectionId] || { icon: 'category', accent: 'primary' };
}

/* ─── Status helpers ─────────────────────────────────────── */

function getPackStatusInfo(progress, unlocked) {
  const { wordsIntroducedCount, totalWords, completed } = progress;
  if (!unlocked) return { label: 'Locked', modifier: 'locked' };
  if (completed) return { label: 'Completed', modifier: 'completed' };
  if (wordsIntroducedCount > 0) return { label: 'In Progress', modifier: 'progress' };
  return { label: 'New', modifier: 'new' };
}

/* ─── Game mode resolver (shared) ────────────────────────── */

function resolveGameMode(completion, modeOverride) {
  const { bridgeBuilderComplete, loosePlanksComplete, deepScriptComplete } = completion;
  if (modeOverride) return modeOverride;
  if (bridgeBuilderComplete && loosePlanksComplete && !deepScriptComplete) return 'deep_script';
  if (bridgeBuilderComplete && !loosePlanksComplete) return 'loose_planks';
  return 'bridge_builder';
}

/* ─── Last-used study method persistence ─────────────────── */

const LAST_METHOD_KEY = 'bbs_last_study_method';

function getLastStudyMethods() {
  try {
    return JSON.parse(localStorage.getItem(LAST_METHOD_KEY) || '{}');
  } catch { return {}; }
}

function setLastStudyMethod(packId, method) {
  const all = getLastStudyMethods();
  all[packId] = method;
  try { localStorage.setItem(LAST_METHOD_KEY, JSON.stringify(all)); } catch {}
}

/* ─── Pack state marker ──────────────────────────────────── */

function getPackStateMarker(progress, unlocked, isActive) {
  if (!unlocked) return { symbol: 'lock', cls: 'locked' };
  if (progress.completed) return { symbol: 'check', cls: 'completed' };
  if (isActive) return { symbol: 'play_arrow', cls: 'current' };
  if (progress.wordsIntroducedCount > 0) return { symbol: 'play_arrow', cls: 'current' };
  return { symbol: 'circle', cls: 'upcoming' };
}

/* ─── Support line builder ───────────────────────────────── */

function buildSupportLine(pack, progress) {
  const parts = [];
  const newCount = pack.targetsNewCount || pack.wordIds.length;
  const introduced = progress.wordsIntroducedCount || 0;
  const remaining = Math.max(0, newCount - introduced);
  if (remaining > 0) parts.push(`${remaining} new`);
  else if (progress.completed) parts.push('Complete');
  else parts.push(`${newCount} words`);
  if (pack.estimatedTimeSec) parts.push(formatEstimatedMinutes(pack.estimatedTimeSec));
  return parts.join(' · ');
}

/* ─── Path Row Component (Guided view) ───────────────────── */

function PackPathRow({
  pack, progress, unlocked, completion, isExpanded, isActive,
  lastMethod, onToggle, onLaunch,
}) {
  const statusInfo = getPackStatusInfo(progress, unlocked);
  const marker = getPackStateMarker(progress, unlocked, isActive);
  const supportLine = buildSupportLine(pack, progress);

  const handleRowClick = () => {
    if (!unlocked) return;
    onToggle(pack.id);
  };

  const handleLaunch = (method) => {
    if (!unlocked) return;
    onLaunch(pack, method);
  };

  let rowCls = 'bbs-path-row';
  if (isExpanded) rowCls += ' bbs-path-row--expanded';
  if (!unlocked) rowCls += ' bbs-path-row--locked';

  return (
    <div className={rowCls}>
      {/* Collapsed row */}
      <button
        type="button"
        className="bbs-path-row-collapsed"
        onClick={handleRowClick}
        disabled={!unlocked}
      >
        {/* State marker */}
        <span className={`bbs-path-marker bbs-path-marker--${marker.cls}`}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
            {marker.symbol}
          </span>
        </span>

        {/* Center: title + support */}
        <div className="bbs-path-row-center">
          <span className="bbs-path-row-title">{pack.title}</span>
          <span className="bbs-path-row-support">{supportLine}</span>
        </div>

        {/* Right: status text */}
        <span className={`bbs-status-pill bbs-status-pill--${statusInfo.modifier}`}>
          {statusInfo.label}
        </span>
      </button>

      {/* Expanded detail */}
      {isExpanded && (
        <div className="bbs-path-row-detail">
          {pack.description && (
            <p className="bbs-path-row-desc">{pack.description}</p>
          )}

          {/* Study method buttons */}
          <div className="bbs-study-methods">
            <button
              type="button"
              className={`bbs-study-method-btn ${lastMethod === 'vocab' ? 'bbs-study-method-btn--last' : ''}`}
              onClick={() => handleLaunch('vocab')}
            >
              <span className="material-symbols-outlined bbs-study-method-icon">conversion_path</span>
              <div className="bbs-study-method-info">
                <span className="bbs-study-method-label">
                  {lastMethod === 'vocab' ? 'Continue Vocab Builder' : 'Vocab Builder'}
                </span>
                <span className="bbs-study-method-hint">Structured pack practice</span>
              </div>
              <span className="material-symbols-outlined bbs-study-method-arrow">arrow_forward</span>
            </button>

            <button
              type="button"
              className={`bbs-study-method-btn ${lastMethod === 'deep_script' ? 'bbs-study-method-btn--last' : ''}`}
              onClick={() => handleLaunch('deep_script')}
            >
              <span className="material-symbols-outlined bbs-study-method-icon">ink_pen</span>
              <div className="bbs-study-method-info">
                <span className="bbs-study-method-label">
                  {lastMethod === 'deep_script' ? 'Continue Deep Script' : 'Deep Script Floor'}
                </span>
                <span className="bbs-study-method-hint">A dungeon floor built from this pack</span>
              </div>
              <span className="material-symbols-outlined bbs-study-method-arrow">arrow_forward</span>
            </button>
          </div>

          {lastMethod && (
            <div className="bbs-path-row-last-used">
              Last used: {lastMethod === 'deep_script' ? 'Deep Script' : 'Vocab Builder'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Progress Dots (kept for Browse / Expert views) ─────── */

function ProgressDots({ completion, modeOverride, unlocked, packId, onDotClick }) {
  const { bridgeBuilderComplete, loosePlanksComplete, deepScriptComplete } = completion;
  const dots = [
    { complete: bridgeBuilderComplete, override: modeOverride === 'bridge_builder', mode: 'bridge_builder', icon: 'conversion_path', label: 'Bridge Builder' },
    { complete: loosePlanksComplete, override: modeOverride === 'loose_planks', mode: 'loose_planks', icon: 'view_stream', label: 'Loose Planks' },
    { complete: deepScriptComplete, override: modeOverride === 'deep_script', mode: 'deep_script', icon: 'ink_pen', label: 'Deep Script' },
  ];

  return (
    <div className="bbs-dots" aria-label="Progress dots">
      {dots.map((dot, i) => {
        let cls = 'bbs-dot';
        if (dot.override) cls += ' bbs-dot--override';
        else if (dot.complete) cls += ' bbs-dot--complete';
        return (
          <button
            key={i}
            type="button"
            className="bbs-dot-mode"
            disabled={!unlocked}
            aria-label={dot.label}
            aria-pressed={dot.override}
            onClick={(e) => {
              e.stopPropagation();
              if (unlocked && onDotClick) onDotClick(packId, dot.mode);
            }}
          >
            <span className={cls} />
            <span className="material-symbols-outlined bbs-dot-mode-icon" aria-hidden="true">{dot.icon}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ─── Status Pill ────────────────────────────────────────── */

function StatusPill({ modifier, label }) {
  return (
    <span className={`bbs-status-pill bbs-status-pill--${modifier}`}>
      {label}
    </span>
  );
}

/* ─── Pack Row (used in Browse / Expert views) ──────────── */

function PackRow({ pack, progress, unlocked, completion, modeOverride, onDotClick, onPlay, compact = false, entryPoint = 'guided' }) {
  const { wordsIntroducedCount, wordsLearnedCount, totalWords, completed } = progress;
  const statusInfo = getPackStatusInfo(progress, unlocked);
  const buttonLabel = getPackButtonLabel(progress);

  const handlePlay = (e) => {
    e.stopPropagation();
    if (!unlocked) return;
    const gameMode = resolveGameMode(completion, modeOverride);
    const session = getRecommendedSessionForPack(pack);
    onPlay({
      sessionType: 'guided_pack',
      packId: pack.id,
      sessionId: session?.id || null,
      selectedWordIds: session ? [...session.targetWordIds, ...session.supportWordIds] : pack.wordIds,
      gameMode,
      entryPoint,
      targetsNewCount: pack.targetsNewCount || pack.wordIds.length,
      supportReviewCount: pack.supportReviewCount || 0,
      estimatedTimeSec: pack.estimatedTimeSec || 0,
    });
  };

  let rowCls = 'bbs-pack-row';
  if (!unlocked) rowCls += ' bbs-pack-row--locked';

  return (
    <div className={rowCls}>
      <div className={`bbs-pack-row-icon ${compact ? 'bbs-pack-row-icon--compact' : ''}`}>
        <span className="bbs-pack-row-emoji">
          {!unlocked ? '\ud83d\udd12' : completed ? '\u2705' : '\ud83d\udce6'}
        </span>
      </div>
      <div className="bbs-pack-row-body">
        <div className="bbs-pack-row-top">
          <span className="bbs-pack-row-title">{pack.title}</span>
          <StatusPill modifier={statusInfo.modifier} label={statusInfo.label} />
        </div>
        {!compact && (
          <div className="bbs-pack-row-subtitle">{pack.description}</div>
        )}
        <div className="bbs-pack-meta">
          <span className="bbs-pack-chip">{pack.primaryType || 'mixed'}</span>
          <span className="bbs-pack-chip">{pack.difficultyBand || 'Core'}</span>
          <span className="bbs-pack-chip">{pack.targetsNewCount || pack.wordIds.length} new</span>
          <span className="bbs-pack-chip">{pack.supportReviewCount || 0} review</span>
          <span className="bbs-pack-chip">{formatEstimatedMinutes(pack.estimatedTimeSec)}</span>
        </div>
        {!compact && <div className="bbs-pack-why">{pack.whyItMatters}</div>}
        <div className="bbs-pack-row-bottom">
          <ProgressDots
            completion={completion}
            modeOverride={modeOverride}
            unlocked={unlocked}
            packId={pack.id}
            onDotClick={onDotClick}
          />
          {unlocked && (
            <button type="button" className="bbs-action-btn" onClick={handlePlay}>
              {buttonLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Section Card ────────────────────────────────────────── */

function SectionCard({ section, sectionProgress, unlocked, expanded, onToggle }) {
  const { packsCompleted, totalPacks } = sectionProgress;
  const meta = getSectionMeta(section.id);
  const accent = meta.accent;

  const progressPercent = totalPacks > 0 ? (packsCompleted / totalPacks) * 100 : 0;

  let packCountLabel;
  if (!unlocked) {
    packCountLabel = `${totalPacks} packs`;
  } else {
    packCountLabel = `${packsCompleted}/${totalPacks} packs`;
  }

  let cardCls = 'bbs-section-card';
  if (!unlocked) cardCls += ' bbs-section-card--locked';
  if (expanded) cardCls += ' bbs-section-card--expanded';

  return (
    <button
      type="button"
      className={cardCls}
      onClick={() => unlocked && onToggle(section.id)}
      disabled={!unlocked}
    >
      <div className={`bbs-section-icon bbs-section-icon--${accent}`}>
        <span className="material-symbols-outlined" style={{ fontSize: 30 }}>{meta.icon}</span>
      </div>
      <div className="bbs-section-info">
        <div className="bbs-section-top-row">
          <h3 className="bbs-section-card-title">{section.title}</h3>
          <span className={`bbs-pack-count-pill bbs-pack-count-pill--${accent}`}>
            {packCountLabel}
          </span>
        </div>
        <p className="bbs-section-desc">{section.description}</p>
        <div className="bbs-section-bottom">
          <div className="bbs-progress-track">
            <div
              className={`bbs-progress-fill bbs-progress-fill--${accent}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          {unlocked && (
            <span className={`bbs-continue-link bbs-continue-link--${accent}`}>
              {packsCompleted >= totalPacks ? 'Review' : 'Continue'}
              {' '}
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>arrow_forward</span>
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

/* ─── Random Review Card ──────────────────────────────────── */

function ReviewCard({ dueCount, weakCount, onPlay }) {
  const available = dueCount > 0 || weakCount > 0;

  let cardCls = 'bbs-review-card';
  if (!available) cardCls += ' bbs-review-card--disabled';

  return (
    <div className="bbs-review-wrap">
      <div className={cardCls}>
        <div className="bbs-review-icon-wrap">
          <span className="material-symbols-outlined" style={{ fontSize: 36, color: 'var(--m3-primary)', fontVariationSettings: "'FILL' 1" }}>casino</span>
        </div>
        <div className="bbs-review-info">
          <h3 className="bbs-review-title">Review Due Now</h3>
          <p className="bbs-review-desc">
            {available
              ? `${dueCount} due · ${weakCount} weak items`
              : 'Complete a pack first to unlock review.'}
          </p>
        </div>
        <button
          type="button"
          className="bbs-review-btn"
          onClick={() => available && onPlay()}
          disabled={!available}
        >
          Start Due Review
        </button>
      </div>
    </div>
  );
}

/* ─── Main Setup Screen ──────────────────────────────────── */

export default function BridgeBuilderSetup({ onPlay, onBack }) {
  const [goalFilter, setGoalFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('recommended');
  const [activeSubview, setActiveSubview] = useState(null); // goal | expert | null
  const [expandedSection, setExpandedSection] = useState(null);
  const [expandedPack, setExpandedPack] = useState(null);
  const [modeOverrides, setModeOverrides] = useState({});
  const [lastMethods, setLastMethods] = useState(() => getLastStudyMethods());

  const sections = useMemo(() => getSectionsInOrder(), []);
  const allProgress = useMemo(() => getAllWordProgress(), []);
  const dueReviewWordIds = useMemo(() => getDueReviewWordIds(), []);
  const weakWordIds = useMemo(() => getWeakWordIds(), []);
  const packCompletions = useMemo(() => getAllPackCompletions(), []);

  const sectionData = useMemo(() => {
    const allPacks = sections.flatMap(s => getPacksBySection(s.id));
    return sections.map(section => {
      const packs = getPacksBySection(section.id);
      const sectionProgress = getSectionProgress(section, packs, allProgress);
      const unlocked = isSectionUnlocked(section, sections, allPacks, allProgress);
      const packData = packs.map(pack => ({
        pack,
        progress: getPackProgress(pack, allProgress),
        unlocked: unlocked && isPackUnlocked(pack, packs, allProgress),
        completion: packCompletions[pack.id] || { bridgeBuilderComplete: false, loosePlanksComplete: false, deepScriptComplete: false },
      }));
      return { section, sectionProgress, unlocked, packData };
    });
  }, [sections, allProgress, packCompletions]);

  /* Find the recommended (current/active) pack across all sections */
  const activePackId = useMemo(() => {
    for (const sd of sectionData) {
      for (const pd of sd.packData) {
        if (pd.unlocked && pd.progress.wordsIntroducedCount > 0 && !pd.progress.completed) {
          return pd.pack.id;
        }
      }
    }
    // Fallback: first unlocked incomplete pack
    for (const sd of sectionData) {
      for (const pd of sd.packData) {
        if (pd.unlocked && !pd.progress.completed) return pd.pack.id;
      }
    }
    return null;
  }, [sectionData]);

  const handleToggleSection = useCallback((sectionId) => {
    setExpandedSection(prev => prev === sectionId ? null : sectionId);
    setExpandedPack(null); // collapse any expanded pack when switching sections
  }, []);

  const handleTogglePack = useCallback((packId) => {
    setExpandedPack(prev => prev === packId ? null : packId);
  }, []);

  const handleDotClick = useCallback((packId, mode) => {
    setModeOverrides(prev => {
      if (prev[packId] === mode) {
        const next = { ...prev };
        delete next[packId];
        return next;
      }
      return { ...prev, [packId]: mode };
    });
  }, []);

  const handlePlayPack = useCallback((sessionConfig) => {
    emit('analytics:bridge_setup', { event: 'session_start', ...sessionConfig });
    onPlay(sessionConfig);
  }, [onPlay]);

  /* Launch a pack in a specific study method from the path row */
  const handleLaunchPackMethod = useCallback((pack, method) => {
    const session = getRecommendedSessionForPack(pack);
    const completion = packCompletions[pack.id] || { bridgeBuilderComplete: false, loosePlanksComplete: false, deepScriptComplete: false };

    let gameMode;
    if (method === 'deep_script') {
      gameMode = 'deep_script';
    } else {
      // Vocab Builder: use natural progression (bridge_builder → loose_planks)
      gameMode = resolveGameMode(completion, null);
      // But don't auto-promote to deep_script — that's the explicit DS button
      if (gameMode === 'deep_script') gameMode = 'bridge_builder';
    }

    // Remember this choice
    setLastStudyMethod(pack.id, method);
    setLastMethods(prev => ({ ...prev, [pack.id]: method }));

    emit('analytics:bridge_setup', { event: 'session_start', method, packId: pack.id, gameMode });
    onPlay({
      sessionType: 'guided_pack',
      packId: pack.id,
      sessionId: session?.id || null,
      selectedWordIds: session ? [...session.targetWordIds, ...session.supportWordIds] : pack.wordIds,
      gameMode,
      entryPoint: 'guided',
      targetsNewCount: pack.targetsNewCount || pack.wordIds.length,
      supportReviewCount: pack.supportReviewCount || 0,
      estimatedTimeSec: pack.estimatedTimeSec || 0,
    });
  }, [onPlay, packCompletions]);

  const handlePlayReview = useCallback(() => {
    const reviewIds = dueReviewWordIds.length > 0 ? dueReviewWordIds : weakWordIds;
    emit('analytics:bridge_setup', { event: 'review_start', dueCount: dueReviewWordIds.length, weakCount: weakWordIds.length });
    onPlay({
      sessionType: 'due_review',
      packId: null,
      selectedWordIds: reviewIds,
      gameMode: 'bridge_builder',
      entryPoint: 'review_due',
    });
  }, [onPlay, dueReviewWordIds, weakWordIds]);

  const allUnlockedPackData = useMemo(
    () => sectionData.flatMap(sd => sd.packData).filter(pd => pd.unlocked),
    [sectionData]
  );
  const goalModePackData = useMemo(
    () => allUnlockedPackData.filter(pd => matchesGoal(pd.pack, goalFilter)),
    [allUnlockedPackData, goalFilter]
  );
  const expertModePackData = useMemo(() => {
    const filtered = allUnlockedPackData.filter(pd => matchesQuery(pd.pack, query));
    return sortPackData(filtered, sortBy);
  }, [allUnlockedPackData, query, sortBy]);

  return (
    <div className="bbs-screen">
      <div className="bbs-content">
        {/* Header */}
        <div className="bbs-header">
          <h1 className="bbs-title">Vocab Builder</h1>
          <p className="bbs-subtitle">Your learning path</p>
        </div>
        <div className="bbs-mode-tabs" role="tablist" aria-label="Browse modes">
          <button
            type="button"
            className={`bbs-mode-tab ${activeSubview === null ? 'active' : ''}`}
            onClick={() => setActiveSubview(null)}
          >
            Guided
          </button>
          <button
            type="button"
            className={`bbs-mode-tab ${activeSubview === 'goal' ? 'active' : ''}`}
            onClick={() => { setActiveSubview('goal'); emit('analytics:bridge_setup', { event: 'open_goal_browse' }); }}
          >
            Browse by goal
          </button>
          <button
            type="button"
            className={`bbs-mode-tab ${activeSubview === 'expert' ? 'active' : ''}`}
            onClick={() => { setActiveSubview('expert'); emit('analytics:bridge_setup', { event: 'open_expert_browse' }); }}
          >
            Advanced tools
          </button>
        </div>

        {/* Browse by Goal */}
        {activeSubview === 'goal' && (
          <div className="bbs-mode-panel">
            <h3 className="bbs-mode-title">What do you want to do today?</h3>
            <button type="button" className="bbs-subview-close" onClick={() => setActiveSubview(null)}>Back to guided</button>
            <div className="bbs-goal-filters">
              {GOAL_FILTERS.map(goal => (
                <button
                  key={goal.id}
                  type="button"
                  className={`bbs-goal-chip ${goalFilter === goal.id ? 'active' : ''}`}
                  onClick={() => {
                    setGoalFilter(goal.id);
                    emit('analytics:bridge_setup', { event: 'goal_filter_change', goalId: goal.id });
                  }}
                >
                  {goal.label}
                </button>
              ))}
            </div>
            <div className="bbs-upnext-list">
              {goalModePackData.slice(0, 12).map(pd => (
                <PackRow
                  key={pd.pack.id}
                  pack={pd.pack}
                  progress={pd.progress}
                  unlocked={pd.unlocked}
                  completion={pd.completion}
                  modeOverride={modeOverrides[pd.pack.id] || null}
                  onDotClick={handleDotClick}
                  onPlay={handlePlayPack}
                  compact
                  entryPoint="goal_browse"
                />
              ))}
            </div>
          </div>
        )}

        {/* Advanced Tools */}
        {activeSubview === 'expert' && (
          <div className="bbs-mode-panel">
            <h3 className="bbs-mode-title">Search & filter your library</h3>
            <button type="button" className="bbs-subview-close" onClick={() => setActiveSubview(null)}>Back to guided</button>
            <div className="bbs-expert-controls">
              <input
                type="search"
                className="bbs-search"
                placeholder="Search packs or goals"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  emit('analytics:bridge_setup', { event: 'expert_search_change', queryLength: e.target.value.length });
                }}
              />
              <select className="bbs-sort" value={sortBy} onChange={(e) => {
                setSortBy(e.target.value);
                emit('analytics:bridge_setup', { event: 'expert_sort_change', sortBy: e.target.value });
                e.target.blur();
              }}>
                <option value="recommended">Recommended</option>
                <option value="time">Shortest time</option>
                <option value="difficulty">Difficulty</option>
              </select>
            </div>
            <div className="bbs-upnext-list">
              {expertModePackData.slice(0, 20).map(pd => (
                <PackRow
                  key={pd.pack.id}
                  pack={pd.pack}
                  progress={pd.progress}
                  unlocked={pd.unlocked}
                  completion={pd.completion}
                  modeOverride={modeOverrides[pd.pack.id] || null}
                  onDotClick={handleDotClick}
                  onPlay={handlePlayPack}
                  compact
                  entryPoint="expert_browse"
                />
              ))}
            </div>
          </div>
        )}

        {/* ─── Guided Path View ───────────────────────────────── */}
        {activeSubview === null && (
          <>
            {sectionData.map(({ section, sectionProgress, unlocked, packData }) => {
              const isExpanded = expandedSection === section.id && unlocked;

              return (
                <section key={section.id} className="bbs-section">
                  <SectionCard
                    section={section}
                    sectionProgress={sectionProgress}
                    unlocked={unlocked}
                    expanded={isExpanded}
                    onToggle={handleToggleSection}
                  />
                  {isExpanded && (
                    <div className="bbs-expanded-area bbs-path-list">
                      {packData.map((pd) => (
                        <PackPathRow
                          key={pd.pack.id}
                          pack={pd.pack}
                          progress={pd.progress}
                          unlocked={pd.unlocked}
                          completion={pd.completion}
                          isExpanded={expandedPack === pd.pack.id}
                          isActive={pd.pack.id === activePackId}
                          lastMethod={lastMethods[pd.pack.id] || null}
                          onToggle={handleTogglePack}
                          onLaunch={handleLaunchPackMethod}
                        />
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </>
        )}

        {/* Random Review */}
        <ReviewCard dueCount={dueReviewWordIds.length} weakCount={weakWordIds.length} onPlay={handlePlayReview} />
      </div>
    </div>
  );
}
