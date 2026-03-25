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
  getRecommendedPack,
  getPreviewPacks,
  getRemainingCount,
  getPackButtonLabel,
  PREVIEW_LIMIT,
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

/* ─── Progress Dots ──────────────────────────────────────── */

function ProgressDots({ completion, modeOverride, unlocked, packId, onDotClick }) {
  const { bridgeBuilderComplete, loosePlanksComplete, deepScriptComplete } = completion;
  const dots = [
    { complete: bridgeBuilderComplete, override: modeOverride === 'bridge_builder', mode: 'bridge_builder' },
    { complete: loosePlanksComplete, override: modeOverride === 'loose_planks', mode: 'loose_planks' },
    { complete: deepScriptComplete, override: modeOverride === 'deep_script', mode: 'deep_script' },
  ];

  return (
    <div className="bbs-dots" aria-label="Progress dots">
      {dots.map((dot, i) => {
        let cls = 'bbs-dot';
        if (dot.override) cls += ' bbs-dot--override';
        else if (dot.complete) cls += ' bbs-dot--complete';
        return (
          <span
            key={i}
            className={cls}
            role="button"
            tabIndex={unlocked ? 0 : -1}
            onClick={(e) => {
              e.stopPropagation();
              if (unlocked && onDotClick) onDotClick(packId, dot.mode);
            }}
          />
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

/* ─── Pack Row (used in preview + drawer) ────────────────── */

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

/* ─── Quick Start Card (featured pack) ───────────────────── */

function QuickStartCard({ packData, modeOverride, onDotClick, onPlay }) {
  const { pack, progress, unlocked, completion } = packData;
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
      entryPoint: 'guided_recommended',
      targetsNewCount: pack.targetsNewCount || pack.wordIds.length,
      supportReviewCount: pack.supportReviewCount || 0,
      estimatedTimeSec: pack.estimatedTimeSec || 0,
    });
  };

  return (
    <div className="bbs-quickstart">
      <div className="bbs-quickstart-inner">
        <div className="bbs-quickstart-icon-wrap">
          <span className="bbs-quickstart-icon-emoji">{'\u2728'}</span>
        </div>
        <div className="bbs-quickstart-body">
          <div className="bbs-quickstart-label">Quick Start</div>
          <div className="bbs-quickstart-title">{pack.title}</div>
          <div className="bbs-quickstart-desc">{pack.description}</div>
          <div className="bbs-pack-meta">
            <span className="bbs-pack-chip">{pack.primaryType || 'mixed'}</span>
            <span className="bbs-pack-chip">{pack.difficultyBand || 'Core'}</span>
            <span className="bbs-pack-chip">{pack.targetsNewCount || pack.wordIds.length} new</span>
            <span className="bbs-pack-chip">{pack.supportReviewCount || 0} review</span>
            <span className="bbs-pack-chip">{formatEstimatedMinutes(pack.estimatedTimeSec)}</span>
          </div>
          <div className="bbs-pack-why">{pack.whyItMatters}</div>
          <div className="bbs-quickstart-bottom">
            <ProgressDots
              completion={completion}
              modeOverride={modeOverride}
              unlocked={unlocked}
              packId={pack.id}
              onDotClick={onDotClick}
            />
            {unlocked && (
              <button type="button" className="bbs-action-btn bbs-action-btn--featured" onClick={handlePlay}>
                {buttonLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Bottom Drawer ──────────────────────────────────────── */

function PackDrawer({ sectionTitle, packData, modeOverrides, onDotClick, onPlay, onClose }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="bbs-drawer-backdrop" onClick={handleBackdropClick}>
      <div className="bbs-drawer">
        <div className="bbs-drawer-handle" />
        <div className="bbs-drawer-header">
          <div>
            <h2 className="bbs-drawer-title">{sectionTitle}</h2>
            <div className="bbs-drawer-subtitle">All packs in this section</div>
          </div>
          <button type="button" className="bbs-drawer-close" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="bbs-drawer-content">
          {packData.map(({ pack, progress, unlocked, completion }) => (
            <PackRow
              key={pack.id}
              pack={pack}
              progress={progress}
              unlocked={unlocked}
              completion={completion}
              modeOverride={modeOverrides[pack.id] || null}
              onDotClick={onDotClick}
              onPlay={onPlay}
              compact
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Section Card ────────────────────────────────────────── */

function SectionCard({ section, sectionProgress, unlocked, expanded, onToggle }) {
  const { packsCompleted, totalPacks, wordsIntroducedCount } = sectionProgress;
  const meta = getSectionMeta(section.id);
  const accent = meta.accent;

  const progressPercent = totalPacks > 0 ? (packsCompleted / totalPacks) * 100 : 0;

  // Pack count label
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
      {/* Icon */}
      <div className={`bbs-section-icon bbs-section-icon--${accent}`}>
        <span className="material-symbols-outlined" style={{ fontSize: 30 }}>{meta.icon}</span>
      </div>

      {/* Body */}
      <div className="bbs-section-info">
        <div className="bbs-section-top-row">
          <h3 className="bbs-section-card-title">{section.title}</h3>
          <span className={`bbs-pack-count-pill bbs-pack-count-pill--${accent}`}>
            {packCountLabel}
          </span>
        </div>
        <p className="bbs-section-desc">{section.description}</p>

        {/* Bottom: progress bar + continue link */}
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
  const [drawerSectionId, setDrawerSectionId] = useState(null);
  const [modeOverrides, setModeOverrides] = useState({});

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

  const handleToggleSection = useCallback((sectionId) => {
    setExpandedSection(prev => prev === sectionId ? null : sectionId);
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

  const handleOpenDrawer = useCallback((sectionId) => {
    setDrawerSectionId(sectionId);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setDrawerSectionId(null);
  }, []);

  const drawerSection = drawerSectionId
    ? sectionData.find(sd => sd.section.id === drawerSectionId)
    : null;

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
      {/* Scrollable content */}
      <div className="bbs-content">
        {/* Header */}
        <div className="bbs-header">
          <h1 className="bbs-title">Vocab Builder</h1>
          <p className="bbs-subtitle">Master your Hebrew journey through themed categories.</p>
        </div>
        <div className="bbs-mode-tabs" role="tablist" aria-label="Browse modes">
          <button type="button" className="bbs-mode-tab active">Guided</button>
          <button type="button" className="bbs-mode-tab" onClick={() => { setActiveSubview('goal'); emit('analytics:bridge_setup', { event: 'open_goal_browse' }); }}>Browse by goal</button>
          <button type="button" className="bbs-mode-tab" onClick={() => { setActiveSubview('expert'); emit('analytics:bridge_setup', { event: 'open_expert_browse' }); }}>Advanced tools</button>
        </div>
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
              }}>
                <option value="recommended">Recommended order</option>
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
        {activeSubview === null && (
          <>
        {sectionData.map(({ section, sectionProgress, unlocked, packData }) => {
          const recommended = getRecommendedPack(packData);
          const isExpanded = expandedSection === section.id && unlocked;
          const previewPacks = isExpanded && recommended
            ? getPreviewPacks(packData, recommended.pack.id, PREVIEW_LIMIT)
            : [];
          const remainingCount = isExpanded ? getRemainingCount(packData, PREVIEW_LIMIT) : 0;

          return (
            <section key={section.id} className="bbs-section">
              <SectionCard
                section={section}
                sectionProgress={sectionProgress}
                unlocked={unlocked}
                expanded={isExpanded}
                onToggle={handleToggleSection}
              />
              {isExpanded && recommended && (
                <div className="bbs-expanded-area">
                  {/* Featured Quick Start card */}
                  <QuickStartCard
                    packData={recommended}
                    modeOverride={modeOverrides[recommended.pack.id] || null}
                    onDotClick={handleDotClick}
                    onPlay={handlePlayPack}
                  />

                  {/* Up Next preview rows */}
                  {previewPacks.length > 0 && (
                    <div className="bbs-upnext-wrapper">
                      <div className="bbs-upnext-header">
                        <div className="bbs-upnext-label">Up Next</div>
                        {remainingCount > 0 && (
                          <button
                            type="button"
                            className="bbs-show-all-link"
                            onClick={() => handleOpenDrawer(section.id)}
                          >
                            Show all {packData.length}
                          </button>
                        )}
                      </div>
                      <div className="bbs-upnext-list">
                        {previewPacks.map(pd => (
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
                          />
                        ))}
                      </div>
                      {remainingCount > 0 && (
                        <button
                          type="button"
                          className="bbs-more-packs-btn"
                          onClick={() => handleOpenDrawer(section.id)}
                        >
                          + {remainingCount} more packs
                        </button>
                      )}
                    </div>
                  )}
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

      {/* Bottom Drawer */}
      {drawerSection && (
        <PackDrawer
          sectionTitle={drawerSection.section.title}
          packData={drawerSection.packData}
          modeOverrides={modeOverrides}
          onDotClick={handleDotClick}
          onPlay={handlePlayPack}
          onClose={handleCloseDrawer}
        />
      )}
    </div>
  );
}
