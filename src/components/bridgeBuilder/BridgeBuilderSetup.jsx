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

/* ─── Progress Dots (shared between card types) ──────────── */

function PackDots({ pack, completion, modeOverride, unlocked, onDotClick }) {
  const { bridgeBuilderComplete, loosePlanksComplete, deepScriptComplete } = completion;
  const dot1Override = modeOverride === 'bridge_builder';
  const dot2Override = modeOverride === 'loose_planks';
  const dot3Override = modeOverride === 'deep_script';

  let dot1Cls = 'bbs-pack-dot';
  if (dot1Override) dot1Cls += ' bbs-pack-dot--override';
  else if (bridgeBuilderComplete) dot1Cls += ' bbs-pack-dot--complete';

  let dot2Cls = 'bbs-pack-dot';
  if (dot2Override) dot2Cls += ' bbs-pack-dot--override';
  else if (loosePlanksComplete) dot2Cls += ' bbs-pack-dot--complete';

  let dot3Cls = 'bbs-pack-dot';
  if (dot3Override) dot3Cls += ' bbs-pack-dot--override';
  else if (deepScriptComplete) dot3Cls += ' bbs-pack-dot--complete';

  const handleClick = (mode) => (e) => {
    e.stopPropagation();
    if (!unlocked) return;
    onDotClick(pack.id, mode);
  };

  return (
    <div className="bbs-pack-dots">
      <div className="bbs-pack-dot-col" onClick={handleClick('bridge_builder')} role="button" tabIndex={unlocked ? 0 : -1}>
        <span className="bbs-pack-dot-emoji">{'\u{1FAA2}'}</span>
        <span className={dot1Cls} />
      </div>
      <div className="bbs-pack-dot-col" onClick={handleClick('loose_planks')} role="button" tabIndex={unlocked ? 0 : -1}>
        <span className="bbs-pack-dot-emoji">{'\u{1FAB5}'}</span>
        <span className={dot2Cls} />
      </div>
      <div className="bbs-pack-dot-col" onClick={handleClick('deep_script')} role="button" tabIndex={unlocked ? 0 : -1}>
        <span className="bbs-pack-dot-emoji">{'\ud83d\udcdc'}</span>
        <span className={dot3Cls} />
      </div>
    </div>
  );
}

/* ─── Status helpers ─────────────────────────────────────── */

function getPackStatus(progress, unlocked) {
  const { wordsIntroducedCount, totalWords, completed } = progress;
  if (!unlocked) return { label: 'Locked', cls: 'bbs-pack-status bbs-pack-status--locked' };
  if (completed) return { label: 'Completed', cls: 'bbs-pack-status bbs-pack-status--completed' };
  if (wordsIntroducedCount > 0) return { label: `${wordsIntroducedCount}/${totalWords} introduced`, cls: 'bbs-pack-status bbs-pack-status--progress' };
  return { label: 'New', cls: 'bbs-pack-status bbs-pack-status--new' };
}

/* ─── Game mode resolver (shared) ────────────────────────── */

function resolveGameMode(completion, modeOverride) {
  const { bridgeBuilderComplete, loosePlanksComplete, deepScriptComplete } = completion;
  if (modeOverride) return modeOverride;
  if (bridgeBuilderComplete && loosePlanksComplete && !deepScriptComplete) return 'deep_script';
  if (bridgeBuilderComplete && !loosePlanksComplete) return 'loose_planks';
  return 'bridge_builder';
}

/* ─── Pack Card (full, used in drawer) ───────────────────── */

function PackCard({ pack, progress, unlocked, completion, modeOverride, onDotClick, onPlay }) {
  const { wordsIntroducedCount, wordsLearnedCount, totalWords, completed } = progress;
  const status = getPackStatus(progress, unlocked);

  let cardCls = 'bbs-pack-card';
  if (!unlocked) cardCls += ' bbs-pack-card--locked';

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
    <div className={cardCls}>
      <PackDots pack={pack} completion={completion} modeOverride={modeOverride} unlocked={unlocked} onDotClick={onDotClick} />
      <div className="bbs-pack-icon">
        {!unlocked ? '\ud83d\udd12' : completed ? '\u2705' : '\ud83d\udce6'}
      </div>
      <div className="bbs-pack-info">
        <div className="bbs-pack-title">{pack.title}</div>
        <div className="bbs-pack-desc">{pack.description}</div>
        <div className={status.cls}>{status.label}</div>
      </div>
      {unlocked && (
        <button type="button" className="bbs-pack-action" onClick={handlePlay}>
          {buttonLabel}
        </button>
      )}
      {unlocked && wordsIntroducedCount > 0 && (
        <div className="bbs-pack-bar">
          <div className="bbs-pack-bar-fill" style={{ width: `${(wordsLearnedCount / totalWords) * 100}%` }} />
        </div>
      )}
    </div>
  );
}

/* ─── Compact Pack Row (preview list) ────────────────────── */

function CompactPackRow({ pack, progress, unlocked, completion, modeOverride, onDotClick, onPlay }) {
  const { wordsIntroducedCount, wordsLearnedCount, totalWords, completed } = progress;
  const status = getPackStatus(progress, unlocked);
  const buttonLabel = getPackButtonLabel(progress);

  let rowCls = 'bbs-compact-row';
  if (!unlocked) rowCls += ' bbs-compact-row--locked';

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
    <div className={rowCls}>
      <PackDots pack={pack} completion={completion} modeOverride={modeOverride} unlocked={unlocked} onDotClick={onDotClick} />
      <div className="bbs-compact-row-icon">
        {!unlocked ? '\ud83d\udd12' : completed ? '\u2705' : '\ud83d\udce6'}
      </div>
      <div className="bbs-compact-row-info">
        <div className="bbs-compact-row-title">{pack.title}</div>
        <div className={status.cls}>{status.label}</div>
      </div>
      {unlocked && (
        <button type="button" className="bbs-pack-action bbs-pack-action--compact" onClick={handlePlay}>
          {buttonLabel}
        </button>
      )}
      {unlocked && wordsIntroducedCount > 0 && (
        <div className="bbs-pack-bar">
          <div className="bbs-pack-bar-fill" style={{ width: `${(wordsLearnedCount / totalWords) * 100}%` }} />
        </div>
      )}
    </div>
  );
}

/* ─── Quick Start Card (featured pack) ───────────────────── */

function QuickStartCard({ packData, modeOverride, onDotClick, onPlay }) {
  const { pack, progress, unlocked, completion } = packData;
  const { wordsIntroducedCount, wordsLearnedCount, totalWords, completed } = progress;
  const status = getPackStatus(progress, unlocked);
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
      <PackDots pack={pack} completion={completion} modeOverride={modeOverride} unlocked={unlocked} onDotClick={onDotClick} />
      <div className="bbs-quickstart-label">Quick Start</div>
      <div className="bbs-quickstart-body">
        <div className="bbs-quickstart-text">
          <div className="bbs-quickstart-title">{pack.title}</div>
          <div className="bbs-quickstart-desc">{pack.description}</div>
          <div className={status.cls}>{status.label}</div>
        </div>
        {unlocked && (
          <button type="button" className="bbs-pack-action bbs-pack-action--featured" onClick={handlePlay}>
            {buttonLabel}
          </button>
        )}
      </div>
      {unlocked && wordsIntroducedCount > 0 && (
        <div className="bbs-pack-bar">
          <div className="bbs-pack-bar-fill" style={{ width: `${(wordsLearnedCount / totalWords) * 100}%` }} />
        </div>
      )}
    </div>
  );
}

/* ─── Bottom Drawer ──────────────────────────────────────── */

function PackDrawer({ sectionTitle, packData, modeOverrides, onDotClick, onPlay, onClose }) {
  // Prevent body scroll while drawer is open
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
        <div className="bbs-drawer-header">
          <h2 className="bbs-drawer-title">{sectionTitle}</h2>
          <button type="button" className="bbs-drawer-close" onClick={onClose}>
            {'\u2715'}
          </button>
        </div>
        <div className="bbs-drawer-content">
          {packData.map(({ pack, progress, unlocked, completion }) => (
            <PackCard
              key={pack.id}
              pack={pack}
              progress={progress}
              unlocked={unlocked}
              completion={completion}
              modeOverride={modeOverrides[pack.id] || null}
              onDotClick={onDotClick}
              onPlay={onPlay}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Section Header Card ─────────────────────────────────── */

function SectionCard({ section, sectionProgress, unlocked, expanded, onToggle }) {
  const { packsCompleted, totalPacks, wordsIntroducedCount } = sectionProgress;

  let statusLabel;
  let statusCls = 'bbs-section-status';
  if (!unlocked) {
    statusLabel = 'Locked';
    statusCls += ' bbs-section-status--locked';
  } else if (packsCompleted >= totalPacks) {
    statusLabel = 'Completed';
    statusCls += ' bbs-section-status--completed';
  } else if (wordsIntroducedCount > 0) {
    statusLabel = `${packsCompleted}/${totalPacks} packs`;
    statusCls += ' bbs-section-status--progress';
  } else {
    statusLabel = `${totalPacks} packs`;
    statusCls += ' bbs-section-status--new';
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
        <div className={statusCls}>{statusLabel}</div>
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
      <div className="bbs-review-icon">{'\ud83d\udd00'}</div>
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

  // Build section data with packs
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

  // Find the drawer section data
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
        {/* Curriculum Sections */}
        {sectionData.map(({ section, sectionProgress, unlocked, packData }) => {
          const isExpanded = expandedSection === section.id && unlocked;
          const recommended = isExpanded ? getRecommendedPack(packData) : null;
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
                <div className="bbs-pack-list">
                  {/* Featured Quick Start card */}
                  <QuickStartCard
                    packData={recommended}
                    modeOverride={modeOverrides[recommended.pack.id] || null}
                    onDotClick={handleDotClick}
                    onPlay={handlePlayPack}
                  />

                  {/* Up Next preview rows */}
                  {previewPacks.length > 0 && (
                    <div className="bbs-upnext">
                      <div className="bbs-upnext-label">Up Next</div>
                      {previewPacks.map(pd => (
                        <CompactPackRow
                          key={pd.pack.id}
                          pack={pd.pack}
                          progress={pd.progress}
                          unlocked={pd.unlocked}
                          completion={pd.completion}
                          modeOverride={modeOverrides[pd.pack.id] || null}
                          onDotClick={handleDotClick}
                          onPlay={handlePlayPack}
                        />
                      ))}
                    </div>
                  )}

                  {/* Show all action */}
                  {remainingCount > 0 && (
                    <button
                      type="button"
                      className="bbs-show-all"
                      onClick={() => handleOpenDrawer(section.id)}
                    >
                      Show all {packData.length} packs
                      <span className="bbs-show-all-badge">+{remainingCount} more</span>
                    </button>
                  )}
                </div>
              )}
            </section>
          );
        })}

        {/* Random Review */}
        <section className="bbs-section">
          <h2 className="bbs-section-title">Review</h2>
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
