import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { bridgeBuilderWords } from '../../data/bridgeBuilderWords.js';
import { markLoosePlanksComplete } from '../../lib/bridgeBuilderStorage.js';
import './LoosePlanks.css';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Generate scattered positions for planks.
 * Returns an array of { top, left } percentage values.
 */
function generatePositions(count, containerEl) {
  const cw = containerEl?.offsetWidth || 360;
  const ch = containerEl?.offsetHeight || 500;

  // Generous plank size estimate (includes padding, border, shadow)
  const plankW = 140;
  const plankH = 56;

  // Minimum gap between any two planks
  const minGapX = 16;
  const minGapY = 12;

  // Edge buffer
  const edgeX = 20;
  const edgeY = 20;

  // Bounding box for plank top-left corner placement
  const maxX = cw - plankW - edgeX;
  const maxY = ch - plankH - edgeY;

  // Check if candidate overlaps any placed position (including min gap)
  function overlaps(x, y, placed) {
    for (const p of placed) {
      if (Math.abs(x - p.x) < plankW + minGapX && Math.abs(y - p.y) < plankH + minGapY) {
        return true;
      }
    }
    return false;
  }

  const placed = [];
  for (let i = 0; i < count; i++) {
    let best = null;
    // Try random candidates, pick one that doesn't overlap
    for (let attempt = 0; attempt < 200; attempt++) {
      const x = edgeX + Math.random() * (maxX - edgeX);
      const y = edgeY + Math.random() * (maxY - edgeY);
      if (!overlaps(x, y, placed)) {
        best = { x, y };
        break;
      }
    }
    // Fallback: if all random attempts collided, use grid placement
    if (!best) {
      const cols = Math.min(count, 3);
      const r = Math.floor(i / cols);
      const c = i % cols;
      const cellW = (maxX - edgeX) / cols;
      const cellH = (maxY - edgeY) / Math.ceil(count / cols);
      best = {
        x: edgeX + cellW * c + cellW * 0.2,
        y: edgeY + cellH * r + cellH * 0.2,
      };
    }
    placed.push(best);
  }

  return shuffle(placed.map(p => ({ top: `${p.y}px`, left: `${p.x}px` })));
}

/**
 * LoosePlanksGame — second-pass reinforcement mode.
 *
 * All planks (Hebrew and transliteration) float randomly on the water.
 * Player taps any plank, then taps the matching plank of the other type.
 */
export default function LoosePlanksGame({ sessionConfig, onBack }) {
  const { packId, selectedWordIds } = sessionConfig;

  const allWords = useMemo(() => {
    const wordMap = new Map(bridgeBuilderWords.map(w => [w.id, w]));
    return selectedWordIds.map(id => wordMap.get(id)).filter(Boolean);
  }, [selectedWordIds]);

  // Break words into groups of 3
  const groups = useMemo(() => {
    const g = [];
    for (let i = 0; i < allWords.length; i += 3) {
      g.push(allWords.slice(i, i + 3));
    }
    return g;
  }, [allWords]);

  const [groupIndex, setGroupIndex] = useState(0);
  const [matched, setMatched] = useState(new Set());
  // selected: { type: 'hebrew' | 'translit', wordId } | null
  const [selected, setSelected] = useState(null);
  const [wrongPair, setWrongPair] = useState(null); // { wordId1, wordId2 }
  const [roundComplete, setRoundComplete] = useState(false);

  const riverRef = useRef(null);
  const [riverSize, setRiverSize] = useState(null);

  // Measure the river container once it mounts (and on resize)
  useEffect(() => {
    const el = riverRef.current;
    if (!el) return;
    const measure = () => setRiverSize({ w: el.offsetWidth, h: el.offsetHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const currentGroup = groups[groupIndex] || [];

  // Generate all plank data for current group: Hebrew + transliteration, shuffled positions
  const plankLayout = useMemo(() => {
    const hebrewPlanks = currentGroup.map(w => ({
      key: `h-${w.id}`,
      type: 'hebrew',
      wordId: w.id,
      text: w.hebrew,
      isRtl: true,
    }));
    const translitPlanks = shuffle(currentGroup).map(w => ({
      key: `t-${w.id}`,
      type: 'translit',
      wordId: w.id,
      text: w.transliteration,
      isRtl: false,
    }));
    const allPlanks = shuffle([...hebrewPlanks, ...translitPlanks]);
    const positions = generatePositions(allPlanks.length, riverRef.current);
    return allPlanks.map((p, i) => ({ ...p, style: positions[i] }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupIndex, currentGroup.length, riverSize]);

  // Float animation index (cycles through variants)
  const floatVariants = ['lp-plank--float-a', 'lp-plank--float-b', 'lp-plank--float-c',
                         'lp-plank--float-d', 'lp-plank--float-e', 'lp-plank--float-f'];

  const handlePlankTap = useCallback((plank) => {
    if (matched.has(plank.wordId) || wrongPair) return;

    if (!selected) {
      // Nothing selected — select this plank
      setSelected({ type: plank.type, wordId: plank.wordId });
      return;
    }

    if (selected.type === plank.type) {
      // Same type — switch selection to this plank
      if (selected.wordId === plank.wordId) {
        setSelected(null); // deselect
      } else {
        setSelected({ type: plank.type, wordId: plank.wordId });
      }
      return;
    }

    // Different type — attempt match
    if (selected.wordId === plank.wordId) {
      // Correct match
      const newMatched = new Set(matched);
      newMatched.add(plank.wordId);
      setMatched(newMatched);
      setSelected(null);

      if (newMatched.size >= currentGroup.length) {
        if (groupIndex + 1 >= groups.length) {
          if (packId) markLoosePlanksComplete(packId);
          setRoundComplete(true);
        } else {
          setTimeout(() => {
            setGroupIndex(g => g + 1);
            setMatched(new Set());
            setSelected(null);
          }, 600);
        }
      }
    } else {
      // Wrong match
      setWrongPair({ wordId1: selected.wordId, wordId2: plank.wordId });
      setTimeout(() => {
        setWrongPair(null);
        setSelected(null);
      }, 600);
    }
  }, [selected, matched, currentGroup, groupIndex, groups.length, packId, wrongPair]);

  const totalMatched = groupIndex * 3 + matched.size;
  const totalWords = allWords.length;

  if (roundComplete) {
    return (
      <div className="lp-world">
        <div className="lp-topbar">
          <button className="lp-back" onClick={onBack} type="button">Back</button>
        </div>
        <div className="lp-end">
          <div className="lp-end-card">
            <h2 className="lp-end-title">Planks Secured!</h2>
            <div className="lp-end-words">
              {allWords.map(w => (
                <div key={w.id} className="lp-end-word">
                  <span className="lp-end-hebrew">{w.hebrew}</span>
                  <span className="lp-end-translit">{w.transliteration}</span>
                </div>
              ))}
            </div>
            <div className="lp-end-actions">
              <button className="lp-end-btn lp-end-btn--primary" onClick={onBack} type="button">
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lp-world">
      {/* Top bar */}
      <div className="lp-topbar">
        <button className="lp-back" onClick={onBack} type="button">Back</button>
        <div className="lp-hud">
          <span className="lp-hud-stat">
            {totalMatched}<span className="lp-hud-label">/{totalWords}</span>
          </span>
        </div>
      </div>

      {/* Instruction */}
      <div className="lp-instruction">
        {selected
          ? 'Now tap the matching plank'
          : 'Tap a plank to select it'}
      </div>

      {/* Top bank only — river extends to the bottom */}
      <div className="lp-bank lp-bank--top">
        <div className="lp-bank-grass" />
        <div className="lp-bank-dirt" />
      </div>

      {/* Full river area with all planks floating */}
      <div className="lp-river" ref={riverRef}>
        <div className="lp-water">
          <div className="lp-water-surface" />
          <div className="lp-water-shimmer" />
        </div>

        {/* All planks scattered on the water */}
        <div className="lp-floating-area" key={groupIndex}>
          {plankLayout.map((plank, i) => {
            const isMatched = matched.has(plank.wordId);
            const isSelected = selected?.wordId === plank.wordId && selected?.type === plank.type;
            const isWrongSrc = wrongPair && (
              (selected?.wordId === plank.wordId && selected?.type === plank.type) ||
              (wrongPair.wordId1 === plank.wordId || wrongPair.wordId2 === plank.wordId)
            );

            let cls = plank.type === 'hebrew' ? 'lp-plank lp-plank--hebrew' : 'lp-plank lp-plank--translit';
            if (isMatched) cls += ' lp-plank--matched';
            else if (isWrongSrc) cls += ' lp-plank--wrong';
            else if (isSelected) cls += ' lp-plank--selected';
            // Float animation variant
            if (!isMatched) cls += ` ${floatVariants[i % floatVariants.length]}`;

            return (
              <button
                key={plank.key}
                className={cls}
                style={{ top: plank.style.top, left: plank.style.left }}
                onClick={() => handlePlankTap(plank)}
                disabled={isMatched}
                type="button"
              >
                <span className="lp-plank-grain" />
                <span className={`lp-plank-text ${plank.isRtl ? 'lp-plank-text--rtl' : ''}`}>
                  {plank.text}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Progress dots — pinned to bottom */}
      <div className="lp-progress-bar">
        {Array.from({ length: totalWords }).map((_, i) => {
          let cls = 'lp-dot';
          if (i < totalMatched) cls += ' lp-dot--done';
          else if (i === totalMatched) cls += ' lp-dot--active';
          return <span key={i} className={cls} />;
        })}
      </div>
    </div>
  );
}
