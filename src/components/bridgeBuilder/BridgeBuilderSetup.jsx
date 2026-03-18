import React, { useMemo, useState } from 'react';
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
import './BridgeBuilderSetup.css';

/* ─── Pack Card ───────────────────────────────────────────── */

function PackCard({ pack, progress, unlocked, selected, onSelect, completion, modeOverride, onDotClick }) {
  const { wordsIntroducedCount, wordsLearnedCount, totalWords, completed } = progress;
  const { bridgeBuilderComplete, loosePlanksComplete, deepScriptComplete } = completion;

  let statusLabel;
  let statusCls = 'bbs-pack-status';
  if (!unlocked) {
    statusLabel = 'Locked';
    statusCls += ' bbs-pack-status--locked';
  } else if (completed) {
    statusLabel = 'Completed';
    statusCls += ' bbs-pack-status--completed';
  } else if (wordsIntroducedCount > 0) {
    statusLabel = `${wordsIntroducedCount}/${totalWords} introduced`;
    statusCls += ' bbs-pack-status--progress';
  } else {
    statusLabel = 'New';
    statusCls += ' bbs-pack-status--new';
  }

  let cardCls = 'bbs-pack-card';
  if (selected) cardCls += ' bbs-pack-card--selected';
  if (!unlocked) cardCls += ' bbs-pack-card--locked';

  // Dot 1 = Bridge Builder, Dot 2 = Loose Planks, Dot 3 = Deep Script
  // Natural state: gray (incomplete) or green (complete)
  // Override state: yellow (this mode will be played)
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

  const handleDot1Click = (e) => {
    e.stopPropagation();
    if (!unlocked) return;
    onDotClick(pack.id, 'bridge_builder');
  };

  const handleDot2Click = (e) => {
    e.stopPropagation();
    if (!unlocked) return;
    onDotClick(pack.id, 'loose_planks');
  };

  const handleDot3Click = (e) => {
    e.stopPropagation();
    if (!unlocked) return;
    onDotClick(pack.id, 'deep_script');
  };

  return (
    <button
      type="button"
      className={cardCls}
      onClick={() => unlocked && onSelect(pack.id)}
      disabled={!unlocked}
    >
      {/* Progress dots — top-right corner, individually clickable */}
      <div className="bbs-pack-dots">
        <div className="bbs-pack-dot-col" onClick={handleDot1Click} role="button" tabIndex={unlocked ? 0 : -1}>
          <span className="bbs-pack-dot-emoji">🪢</span>
          <span className={dot1Cls} />
        </div>
        <div className="bbs-pack-dot-col" onClick={handleDot2Click} role="button" tabIndex={unlocked ? 0 : -1}>
          <span className="bbs-pack-dot-emoji">🪵</span>
          <span className={dot2Cls} />
        </div>
        <div className="bbs-pack-dot-col" onClick={handleDot3Click} role="button" tabIndex={unlocked ? 0 : -1}>
          <span className="bbs-pack-dot-emoji">📜</span>
          <span className={dot3Cls} />
        </div>
      </div>
      <div className="bbs-pack-icon">
        {!unlocked ? '🔒' : completed ? '✅' : '📦'}
      </div>
      <div className="bbs-pack-info">
        <div className="bbs-pack-title">{pack.title}</div>
        <div className="bbs-pack-desc">{pack.description}</div>
        <div className={statusCls}>{statusLabel}</div>
      </div>
      {unlocked && wordsIntroducedCount > 0 && (
        <div className="bbs-pack-bar">
          <div
            className="bbs-pack-bar-fill"
            style={{ width: `${(wordsLearnedCount / totalWords) * 100}%` }}
          />
        </div>
      )}
    </button>
  );
}

/* ─── Section Header Card ─────────────────────────────────── */

function SectionCard({ section, sectionProgress, unlocked, expanded, onToggle }) {
  const { packsCompleted, totalPacks, wordsIntroducedCount, totalWords } = sectionProgress;

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
        {!unlocked ? '🔒' : packsCompleted >= totalPacks ? '⭐' : '📖'}
      </div>
      <div className="bbs-section-info">
        <div className="bbs-section-card-title">{section.title}</div>
        <div className="bbs-section-desc">{section.description}</div>
        <div className={statusCls}>{statusLabel}</div>
      </div>
      {unlocked && (
        <div className={`bbs-section-chevron ${expanded ? 'bbs-section-chevron--open' : ''}`}>
          ▸
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

function ReviewCard({ eligibleCount, selected, onSelect }) {
  const available = eligibleCount > 0;

  let cardCls = 'bbs-review-card';
  if (selected) cardCls += ' bbs-review-card--selected';
  if (!available) cardCls += ' bbs-review-card--disabled';

  return (
    <button
      type="button"
      className={cardCls}
      onClick={() => available && onSelect()}
      disabled={!available}
    >
      <div className="bbs-review-icon">🔀</div>
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

export default function BridgeBuilderSetup({ onPlay, onBack, onDeepScript }) {
  const [selection, setSelection] = useState(null); // { type: 'pack', packId } | { type: 'review' } | null
  const [expandedSection, setExpandedSection] = useState('foundations'); // start with first section open
  // Per-pack mode override: { [packId]: 'bridge_builder' | 'loose_planks' }
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

  const handleToggleSection = (sectionId) => {
    setExpandedSection(prev => prev === sectionId ? null : sectionId);
  };

  const handlePackSelect = (packId) => {
    setSelection({ type: 'pack', packId });
  };

  const handleDotClick = (packId, mode) => {
    // Also select this pack when a dot is clicked
    setSelection({ type: 'pack', packId });
    setModeOverrides(prev => {
      // Toggle: if same mode already set, clear it; otherwise set it
      if (prev[packId] === mode) {
        const next = { ...prev };
        delete next[packId];
        return next;
      }
      return { ...prev, [packId]: mode };
    });
  };

  const handleReviewSelect = () => {
    setSelection({ type: 'review' });
  };

  const handlePlay = () => {
    if (!selection) return;
    if (selection.type === 'pack') {
      // Find the pack across all sections
      const allPackData = sectionData.flatMap(sd => sd.packData);
      const pd = allPackData.find(p => p.pack.id === selection.packId);
      if (!pd) return;
      const pack = pd.pack;
      const { bridgeBuilderComplete, loosePlanksComplete } = pd.completion;

      // Determine game mode: override takes priority, then completion state
      const { deepScriptComplete } = pd.completion;
      const override = modeOverrides[pack.id];
      let gameMode;
      if (override) {
        gameMode = override;
      } else if (bridgeBuilderComplete && loosePlanksComplete && !deepScriptComplete) {
        gameMode = 'deep_script';
      } else if (bridgeBuilderComplete && !loosePlanksComplete) {
        gameMode = 'loose_planks';
      } else {
        gameMode = 'bridge_builder';
      }

      onPlay({
        sessionType: 'guided_pack',
        packId: pack.id,
        selectedWordIds: pack.wordIds,
        gameMode,
      });
    } else if (selection.type === 'review') {
      onPlay({
        sessionType: 'random_review',
        packId: null,
        selectedWordIds: reviewWordIds,
        gameMode: 'bridge_builder',
      });
    }
  };

  const isPackSelected = (packId) =>
    selection?.type === 'pack' && selection.packId === packId;

  const isReviewSelected = selection?.type === 'review';

  return (
    <div className="bbs-screen">
      {/* Header */}
      <div className="bbs-header">
        <button className="bbs-back" onClick={onBack} type="button">Back</button>
        <h1 className="bbs-title">Bridge Builder</h1>
      </div>

      {/* Scrollable content */}
      <div className="bbs-content">
        {/* Curriculum Sections */}
        {sectionData.map(({ section, sectionProgress, unlocked, packData }) => (
          <section key={section.id} className="bbs-section">
            <SectionCard
              section={section}
              sectionProgress={sectionProgress}
              unlocked={unlocked}
              expanded={expandedSection === section.id}
              onToggle={handleToggleSection}
            />
            {expandedSection === section.id && unlocked && (
              <div className="bbs-pack-list">
                {packData.map(({ pack, progress, unlocked: packUnlocked, completion }) => (
                  <PackCard
                    key={pack.id}
                    pack={pack}
                    progress={progress}
                    unlocked={packUnlocked}
                    selected={isPackSelected(pack.id)}
                    onSelect={handlePackSelect}
                    completion={completion}
                    modeOverride={modeOverrides[pack.id] || null}
                    onDotClick={handleDotClick}
                  />
                ))}
              </div>
            )}
          </section>
        ))}

        {/* Random Review */}
        <section className="bbs-section">
          <h2 className="bbs-section-title">Review</h2>
          <ReviewCard
            eligibleCount={reviewWordIds.length}
            selected={isReviewSelected}
            onSelect={handleReviewSelect}
          />
        </section>

        {/* Deep Script Mode */}
        {onDeepScript && (
          <section className="bbs-section">
            <h2 className="bbs-section-title">Adventure</h2>
            <button
              type="button"
              className="bbs-deep-script-card"
              onClick={onDeepScript}
            >
              <div className="bbs-deep-script-icon">📜</div>
              <div className="bbs-deep-script-info">
                <div className="bbs-deep-script-title">Deep Script</div>
                <div className="bbs-deep-script-desc">
                  Dungeon-crawl through Hebrew words — build letters, manage your tray, defeat word guardians
                </div>
                <div className="bbs-deep-script-badge">Roguelike Mode</div>
              </div>
            </button>
          </section>
        )}
      </div>

      {/* Play Button — pinned to bottom */}
      <div className="bbs-footer">
        <button
          type="button"
          className={`bbs-play ${selection ? 'bbs-play--active' : ''}`}
          onClick={handlePlay}
          disabled={!selection}
        >
          Play
        </button>
      </div>
    </div>
  );
}
