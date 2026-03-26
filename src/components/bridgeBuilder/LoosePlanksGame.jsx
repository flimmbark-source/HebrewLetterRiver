import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { bridgeBuilderWords } from '../../data/bridgeBuilderWords.js';
import { markLoosePlanksComplete } from '../../lib/bridgeBuilderStorage.js';
import { useFontSettings } from '../../hooks/useFontSettings.js';
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
 * Generate center-biased scattered positions for planks.
 */
function generatePositions(count, containerEl, minTopClearance = 0) {
  const cw = containerEl?.offsetWidth || 360;
  const ch = containerEl?.offsetHeight || 500;

  // Keep this aligned with CSS max width so planks stay on-screen on mobile.
  const plankW = 180;
  const plankH = 56;
  const minGapX = 16;
  const minGapY = 12;
  const edgeX = 24;
  const edgeY = 24;

  const maxX = cw - plankW - edgeX;
  const minY = Math.max(edgeY, minTopClearance);
  const maxY = ch - plankH - edgeY;
  const rangeX = maxX - edgeX;
  const rangeY = Math.max(0, maxY - minY);
  const centerX = edgeX + rangeX / 2;
  const centerY = minY + rangeY / 2;

  function centerRand(center, range) {
    const r = (Math.random() + Math.random()) / 2;
    return center + (r - 0.5) * range;
  }

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
    for (let attempt = 0; attempt < 300; attempt++) {
      const x = Math.max(edgeX, Math.min(maxX, centerRand(centerX, rangeX)));
      const y = Math.max(minY, Math.min(maxY, centerRand(centerY, rangeY)));
      if (!overlaps(x, y, placed)) {
        best = { x, y };
        break;
      }
    }
    if (!best) {
      const cols = Math.min(count, 3);
      const r = Math.floor(i / cols);
      const c = i % cols;
      const cellW = rangeX / cols;
      const cellH = rangeY / Math.ceil(count / cols || 1);
      best = {
        x: edgeX + cellW * c + cellW * 0.3,
        y: minY + cellH * r + cellH * 0.3,
      };
    }
    placed.push(best);
  }

  return shuffle(placed.map(p => ({ top: `${p.y}px`, left: `${p.x}px` })));
}

/**
 * LoosePlanksGame — second-pass reinforcement mode.
 *
 * Hebrew planks sit in a row at the top. Floating planks on the water are
 * randomly either transliteration or translation per word per round.
 */
export default function LoosePlanksGame({ sessionConfig, onBack, onNext }) {
  const { getGameFontClass } = useFontSettings();
  const { packId, selectedWordIds } = sessionConfig;

  const allWords = useMemo(() => {
    const wordMap = new Map(bridgeBuilderWords.map(w => [w.id, w]));
    return selectedWordIds.map(id => wordMap.get(id)).filter(Boolean);
  }, [selectedWordIds]);

  // Build rounds: two passes per group of 3 — first pass random type, second pass flipped.
  // Rounds are shuffled so the two passes for the same group aren't back-to-back.
  const rounds = useMemo(() => {
    const wordGroups = [];
    for (let i = 0; i < allWords.length; i += 3) {
      wordGroups.push(allWords.slice(i, i + 3));
    }
    // Track which type each word has been assigned so far
    const wordFirstType = {}; // wordId → 'translit' | 'translation'
    const roundList = [];
    for (const group of wordGroups) {
      // Pass 1: random type per word, independently
      const pass1Types = {};
      for (const w of group) {
        pass1Types[w.id] = Math.random() < 0.5 ? 'translit' : 'translation';
        wordFirstType[w.id] = pass1Types[w.id];
      }
      roundList.push({ words: group, plankTypes: pass1Types });
    }
    for (const group of wordGroups) {
      // Pass 2: each word gets whichever type it didn't get in pass 1,
      // but the per-word assignments are still mixed within the round
      const pass2Types = {};
      for (const w of group) {
        pass2Types[w.id] = wordFirstType[w.id] === 'translit' ? 'translation' : 'translit';
      }
      roundList.push({ words: group, plankTypes: pass2Types });
    }
    return shuffle(roundList);
  }, [allWords]);

  const [roundIndex, setRoundIndex] = useState(0);
  const [matched, setMatched] = useState(new Set());
  const [selected, setSelected] = useState(null);
  const [wrongPair, setWrongPair] = useState(null);
  const [roundComplete, setRoundComplete] = useState(false);

  const riverRef = useRef(null);
  const hebrewRowRef = useRef(null);
  const [riverSize, setRiverSize] = useState(null);

  useEffect(() => {
    const el = riverRef.current;
    if (!el) return;
    const measure = () => setRiverSize({ w: el.offsetWidth, h: el.offsetHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const currentRound = rounds[roundIndex] || {};
  const currentGroup = currentRound.words || [];
  const plankTypes = currentRound.plankTypes || {};

  // Hebrew planks — fixed row at top
  const hebrewPlanks = useMemo(() =>
    currentGroup.map(w => ({
      key: `h-${w.id}-${roundIndex}`,
      type: 'hebrew',
      wordId: w.id,
      text: w.hebrew,
    })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [roundIndex, currentGroup.length]
  );

  // Floating planks — translit or translation per word
  const floatingLayout = useMemo(() => {
    const planks = shuffle(currentGroup).map(w => {
      const pt = plankTypes[w.id];
      return {
        key: `f-${w.id}-${roundIndex}`,
        type: pt,
        wordId: w.id,
        text: pt === 'translit' ? w.transliteration : w.translation,
      };
    });
    const riverRect = riverRef.current?.getBoundingClientRect();
    const hebrewRect = hebrewRowRef.current?.getBoundingClientRect();

    // Keep floating planks at least 20px below any top Hebrew plank overlap.
    const overlapIntoRiver =
      riverRect && hebrewRect
        ? Math.max(0, hebrewRect.bottom - riverRect.top)
        : 0;
    const minTopClearance = overlapIntoRiver + 50;

    const positions = generatePositions(planks.length, riverRef.current, minTopClearance);
    return planks.map((p, i) => ({ ...p, style: positions[i] }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundIndex, currentGroup.length, plankTypes, riverSize]);

  const floatVariants = ['lp-plank--float-a', 'lp-plank--float-b', 'lp-plank--float-c',
                         'lp-plank--float-d', 'lp-plank--float-e', 'lp-plank--float-f'];

  const handlePlankTap = useCallback((plank) => {
    if (matched.has(plank.wordId) || wrongPair) return;

    if (!selected) {
      setSelected({ type: plank.type, wordId: plank.wordId });
      return;
    }

    if (selected.type === plank.type) {
      if (selected.wordId === plank.wordId) {
        setSelected(null);
      } else {
        setSelected({ type: plank.type, wordId: plank.wordId });
      }
      return;
    }

    // Different type — attempt match
    if (selected.wordId === plank.wordId) {
      const newMatched = new Set(matched);
      newMatched.add(plank.wordId);
      setMatched(newMatched);
      setSelected(null);

      if (newMatched.size >= currentGroup.length) {
        if (roundIndex + 1 >= rounds.length) {
          if (packId) markLoosePlanksComplete(packId);
          setRoundComplete(true);
        } else {
          setTimeout(() => {
            setRoundIndex(r => r + 1);
            setMatched(new Set());
            setSelected(null);
          }, 600);
        }
      }
    } else {
      setWrongPair({ wordId1: selected.wordId, wordId2: plank.wordId });
      setTimeout(() => {
        setWrongPair(null);
        setSelected(null);
      }, 600);
    }
  }, [selected, matched, currentGroup, roundIndex, rounds.length, packId, wrongPair]);

  const totalMatched = rounds.slice(0, roundIndex).reduce((n, r) => n + r.words.length, 0) + matched.size;
  const totalWords = rounds.reduce((n, r) => n + r.words.length, 0);

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
                  <span className={`lp-end-hebrew ${getGameFontClass(`${w.id}-hebrew`)}`}>{w.hebrew}</span>
                  <span className={`lp-end-translit ${getGameFontClass(`${w.id}-translit`)}`}>{w.transliteration}</span>
                </div>
              ))}
            </div>
            <div className="lp-end-actions">
              {onNext && (
                <button className="lp-end-btn lp-end-btn--primary" onClick={onNext} type="button">
                  Next
                </button>
              )}
              <button className={`lp-end-btn ${onNext ? 'lp-end-btn--secondary' : 'lp-end-btn--primary'}`} onClick={onBack} type="button">
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

      {/* Hebrew planks — fixed row at top, wraps if needed */}
      <div className="lp-hebrew-row" key={`hrow-${roundIndex}`} ref={hebrewRowRef}>
        {hebrewPlanks.map((plank) => {
          const isMatched = matched.has(plank.wordId);
          const isSelected = selected?.wordId === plank.wordId && selected?.type === plank.type;
          const isWrongSrc = wrongPair && (
            (selected?.wordId === plank.wordId && selected?.type === plank.type) ||
            (wrongPair.wordId1 === plank.wordId || wrongPair.wordId2 === plank.wordId)
          );

          let cls = 'lp-plank-inline lp-plank--hebrew';
          if (isMatched) cls += ' lp-plank--matched';
          else if (isWrongSrc) cls += ' lp-plank--wrong';
          else if (isSelected) cls += ' lp-plank--selected';

          return (
            <button
              key={plank.key}
              className={cls}
              onClick={() => handlePlankTap(plank)}
              disabled={isMatched}
              type="button"
            >
              <span className="lp-plank-grain" />
              <span className={`lp-plank-text lp-plank-text--rtl ${getGameFontClass(plank.key)}`}>
                {plank.text}
              </span>
            </button>
          );
        })}
      </div>

      {/* Top bank — river extends to the bottom */}
      <div className="lp-bank lp-bank--top">
        <div className="lp-bank-grass" />
        <div className="lp-bank-dirt" />
      </div>

      {/* River area with floating planks */}
      <div className="lp-river" ref={riverRef}>
        <div className="lp-water">
          <div className="lp-water-surface" />
          <div className="lp-water-shimmer" />
        </div>

        <div className="lp-floating-area" key={roundIndex}>
          {floatingLayout.map((plank, i) => {
            const isMatched = matched.has(plank.wordId);
            const isSelected = selected?.wordId === plank.wordId && selected?.type === plank.type;
            const isWrongSrc = wrongPair && (
              (selected?.wordId === plank.wordId && selected?.type === plank.type) ||
              (wrongPair.wordId1 === plank.wordId || wrongPair.wordId2 === plank.wordId)
            );

            let cls = 'lp-plank lp-plank--translit';
            if (isMatched) cls += ' lp-plank--matched';
            else if (isWrongSrc) cls += ' lp-plank--wrong';
            else if (isSelected) cls += ' lp-plank--selected';
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
                <span className={`lp-plank-text ${getGameFontClass(plank.key)}`}>
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
