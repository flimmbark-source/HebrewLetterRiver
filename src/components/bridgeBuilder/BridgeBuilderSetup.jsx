import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { getSectionsInOrder } from '../../data/bridgeBuilderSections.js';
import { getPacksBySection } from '../../data/bridgeBuilderPacks.js';
import {
  getAllWordProgress,
  getPackProgress,
  isPackUnlocked,
  getSectionProgress,
  isSectionUnlocked,
  getReviewEligibleWordIds,
  getAllPackCompletions,
} from '../../lib/bridgeBuilderStorage.js';
import {
  getRecommendedPack,
  getPreviewPacks,
  getRemainingCount,
  getPackButtonLabel,
  PREVIEW_LIMIT,
} from './bridgeBuilderSetupHelpers.js';
import './BridgeBuilderSetup.css';

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

function PackRow({ pack, progress, unlocked, completion, modeOverride, onDotClick, onPlay, compact = false }) {
  const { wordsIntroducedCount, wordsLearnedCount, totalWords, completed } = progress;
  const statusInfo = getPackStatusInfo(progress, unlocked);
  const buttonLabel = getPackButtonLabel(progress);

  const handlePlay = (e) => {
    e.stopPropagation();
    if (!unlocked) return;
    const gameMode = resolveGameMode(completion, modeOverride);
    onPlay({
      sessionType: 'guided_pack',
      packId: pack.id,
      selectedWordIds: pack.wordIds,
      gameMode,
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
    onPlay({
      sessionType: 'guided_pack',
      packId: pack.id,
      selectedWordIds: pack.wordIds,
      gameMode,
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

function SectionCard({ section, sectionProgress, unlocked, expanded, onToggle, recommendedPackTitle }) {
  const { packsCompleted, totalPacks, wordsIntroducedCount } = sectionProgress;

  let statusLabel;
  let statusModifier;
  if (!unlocked) {
    statusLabel = 'Locked';
    statusModifier = 'locked';
  } else if (packsCompleted >= totalPacks) {
    statusLabel = 'Completed';
    statusModifier = 'completed';
  } else if (wordsIntroducedCount > 0) {
    statusLabel = `${packsCompleted}/${totalPacks} packs`;
    statusModifier = 'progress';
  } else {
    statusLabel = `${totalPacks} packs`;
    statusModifier = 'new';
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
      <div className="bbs-section-icon">
        {!unlocked ? '\ud83d\udd12' : packsCompleted >= totalPacks ? '\u2b50' : '\ud83d\udcd6'}
      </div>
      <div className="bbs-section-info">
        <div className="bbs-section-card-title">{section.title}</div>
        <div className="bbs-section-desc">{section.description}</div>
        <div className="bbs-section-meta">
          <StatusPill modifier={statusModifier} label={statusLabel} />
          {unlocked && recommendedPackTitle && (
            <span className="bbs-section-continue">
              Continue: <span className="bbs-section-continue-title">{recommendedPackTitle}</span>
            </span>
          )}
        </div>
      </div>
      {unlocked && (
        <div className={`bbs-section-chevron ${expanded ? 'bbs-section-chevron--open' : ''}`}>
          {'\u25b8'}
        </div>
      )}
      {unlocked && wordsIntroducedCount > 0 && (
        <div className="bbs-section-bar">
          <div
            className="bbs-section-bar-fill"
            style={{ width: `${(packsCompleted / totalPacks) * 100}%` }}
          />
        </div>
      )}
    </button>
  );
}

/* ─── Random Review Card ──────────────────────────────────── */

function ReviewCard({ eligibleCount, onPlay }) {
  const available = eligibleCount > 0;

  let cardCls = 'bbs-review-card';
  if (!available) cardCls += ' bbs-review-card--disabled';

  return (
    <button
      type="button"
      className={cardCls}
      onClick={() => available && onPlay()}
      disabled={!available}
    >
      <div className="bbs-review-info">
        <div className="bbs-review-title">Random Review</div>
        <div className="bbs-review-desc">
          {available
            ? `Practice ${eligibleCount} introduced word${eligibleCount !== 1 ? 's' : ''}`
            : 'Complete a pack first to unlock review'}
        </div>
      </div>
    </button>
  );
}

/* ─── Main Setup Screen ──────────────────────────────────── */

export default function BridgeBuilderSetup({ onPlay, onBack }) {
  const [expandedSection, setExpandedSection] = useState('foundations');
  const [drawerSectionId, setDrawerSectionId] = useState(null);
  const [modeOverrides, setModeOverrides] = useState({});

  const sections = useMemo(() => getSectionsInOrder(), []);
  const allProgress = useMemo(() => getAllWordProgress(), []);
  const reviewWordIds = useMemo(() => getReviewEligibleWordIds(), []);
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
    onPlay(sessionConfig);
  }, [onPlay]);

  const handlePlayReview = useCallback(() => {
    onPlay({
      sessionType: 'random_review',
      packId: null,
      selectedWordIds: reviewWordIds,
      gameMode: 'bridge_builder',
    });
  }, [onPlay, reviewWordIds]);

  const handleOpenDrawer = useCallback((sectionId) => {
    setDrawerSectionId(sectionId);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setDrawerSectionId(null);
  }, []);

  const drawerSection = drawerSectionId
    ? sectionData.find(sd => sd.section.id === drawerSectionId)
    : null;

  return (
    <div className="bbs-screen">
      {/* Header */}
      <div className="bbs-header">
        <h1 className="bbs-title">Vocab Builder</h1>
      </div>

      {/* Scrollable content */}
      <div className="bbs-content">
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
                recommendedPackTitle={recommended ? recommended.pack.title : null}
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

        {/* Random Review */}
        <section className="bbs-section">
          <div className="bbs-section-title">Review</div>
          <ReviewCard
            eligibleCount={reviewWordIds.length}
            onPlay={handlePlayReview}
          />
        </section>
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
