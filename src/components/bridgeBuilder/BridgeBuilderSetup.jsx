import React, { useMemo } from 'react';
import { getPacksInOrder } from '../../data/bridgeBuilderPacks.js';
import {
  getAllWordProgress,
  getPackProgress,
  isPackUnlocked,
  getReviewEligibleWordIds,
} from '../../lib/bridgeBuilderStorage.js';
import './BridgeBuilderSetup.css';

/* ─── Pack Card ───────────────────────────────────────────── */

function PackCard({ pack, progress, unlocked, selected, onSelect }) {
  const { wordsIntroducedCount, wordsLearnedCount, totalWords, completed } = progress;

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

  return (
    <button
      type="button"
      className={cardCls}
      onClick={() => unlocked && onSelect(pack.id)}
      disabled={!unlocked}
    >
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

export default function BridgeBuilderSetup({ onPlay, onBack }) {
  const [selection, setSelection] = React.useState(null); // { type: 'pack', packId } | { type: 'review' } | null

  const packs = useMemo(() => getPacksInOrder(), []);
  const allProgress = useMemo(() => getAllWordProgress(), []);
  const reviewWordIds = useMemo(() => getReviewEligibleWordIds(), []);

  const packData = useMemo(() => {
    return packs.map(pack => ({
      pack,
      progress: getPackProgress(pack, allProgress),
      unlocked: isPackUnlocked(pack, packs, allProgress),
    }));
  }, [packs, allProgress]);

  const handlePackSelect = (packId) => {
    setSelection({ type: 'pack', packId });
  };

  const handleReviewSelect = () => {
    setSelection({ type: 'review' });
  };

  const handlePlay = () => {
    if (!selection) return;
    if (selection.type === 'pack') {
      const pack = packs.find(p => p.id === selection.packId);
      if (!pack) return;
      onPlay({
        sessionType: 'guided_pack',
        packId: pack.id,
        selectedWordIds: pack.wordIds,
      });
    } else if (selection.type === 'review') {
      onPlay({
        sessionType: 'random_review',
        packId: null,
        selectedWordIds: reviewWordIds,
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
        {/* Guided Packs */}
        <section className="bbs-section">
          <h2 className="bbs-section-title">Guided Packs</h2>
          <div className="bbs-pack-list">
            {packData.map(({ pack, progress, unlocked }) => (
              <PackCard
                key={pack.id}
                pack={pack}
                progress={progress}
                unlocked={unlocked}
                selected={isPackSelected(pack.id)}
                onSelect={handlePackSelect}
              />
            ))}
          </div>
        </section>

        {/* Random Review */}
        <section className="bbs-section">
          <h2 className="bbs-section-title">Review</h2>
          <ReviewCard
            eligibleCount={reviewWordIds.length}
            selected={isReviewSelected}
            onSelect={handleReviewSelect}
          />
        </section>
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
