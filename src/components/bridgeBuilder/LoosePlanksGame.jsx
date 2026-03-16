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
 * Generate center-biased scattered positions for planks.
 * Uses a Gaussian-like distribution to cluster planks toward the center.
 */
function generatePositions(count, containerEl) {
  const cw = containerEl?.offsetWidth || 360;
  const ch = containerEl?.offsetHeight || 500;

  const plankW = 140;
  const plankH = 56;
  const minGapX = 16;
  const minGapY = 12;
  const edgeX = 24;
  const edgeY = 24;

  const maxX = cw - plankW - edgeX;
  const maxY = ch - plankH - edgeY;
  const rangeX = maxX - edgeX;
  const rangeY = maxY - edgeY;
  const centerX = edgeX + rangeX / 2;
  const centerY = edgeY + rangeY / 2;

  // Center-biased random: average of two uniform randoms pulls toward center
  function centerRand(center, range) {
    const r = (Math.random() + Math.random()) / 2; // triangular distribution, peaks at 0.5
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
      const y = Math.max(edgeY, Math.min(maxY, centerRand(centerY, rangeY)));
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
      const cellH = rangeY / Math.ceil(count / cols);
      best = {
        x: edgeX + cellW * c + cellW * 0.3,
        y: edgeY + cellH * r + cellH * 0.3,
      };
    }
    placed.push(best);
  }

  return shuffle(placed.map(p => ({ top: `${p.y}px`, left: `${p.x}px` })));
}

/**
 * LoosePlanksGame — second-pass reinforcement mode.
 *
 * Hebrew planks sit in a fixed row at the top. The floating planks on the
 * water are either transliteration or translation, chosen randomly per round.
 * Each word must be matched in both modes before the game is complete.
 */
export default function LoosePlanksGame({ sessionConfig, onBack }) {
  const { packId, selectedWordIds } = sessionConfig;

  const allWords = useMemo(() => {
    const wordMap = new Map(bridgeBuilderWords.map(w => [w.id, w]));
    return selectedWordIds.map(id => wordMap.get(id)).filter(Boolean);
  }, [selectedWordIds]);

  // Per-word completion: wordId → { translit: bool, translation: bool }
  const [wordDone, setWordDone] = useState(() => {
    const d = {};
    for (const w of allWords) d[w.id] = { translit: false, translation: false };
    return d;
  });

  // Build rounds: groups of 3, each round picks a plank type (translit or translation).
  // A word appears in a round for whichever type it still needs.
  // We rebuild rounds whenever wordDone changes.
  const rounds = useMemo(() => {
    // Collect words that still need translit, and words that still need translation
    const needTranslit = allWords.filter(w => !wordDone[w.id].translit);
    const needTranslation = allWords.filter(w => !wordDone[w.id].translation);

    const result = [];

    // Build rounds from needTranslit
    for (let i = 0; i < needTranslit.length; i += 3) {
      result.push({
        words: needTranslit.slice(i, i + 3),
        plankType: 'translit',
      });
    }
    // Build rounds from needTranslation
    for (let i = 0; i < needTranslation.length; i += 3) {
      result.push({
        words: needTranslation.slice(i, i + 3),
        plankType: 'translation',
      });
    }

    return shuffle(result);
  }, [allWords, wordDone]);

  const [roundIndex, setRoundIndex] = useState(0);
  const [matched, setMatched] = useState(new Set());
  const [selected, setSelected] = useState(null);
  const [wrongPair, setWrongPair] = useState(null);
  const [roundComplete, setRoundComplete] = useState(false);

  const riverRef = useRef(null);
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

  const currentRound = rounds[roundIndex] || null;
  const currentWords = currentRound?.words || [];
  const currentPlankType = currentRound?.plankType || 'translit';

  // Hebrew planks for the current round
  const hebrewPlanks = useMemo(() =>
    currentWords.map(w => ({
      key: `h-${w.id}-${roundIndex}`,
      type: 'hebrew',
      wordId: w.id,
      text: w.hebrew,
    })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [roundIndex, currentWords.length]
  );

  // Floating planks: either transliteration or translation
  const floatingLayout = useMemo(() => {
    const planks = shuffle(currentWords).map(w => ({
      key: `f-${w.id}-${roundIndex}`,
      type: currentPlankType,
      wordId: w.id,
      text: currentPlankType === 'translit' ? w.transliteration : w.translation,
    }));
    const positions = generatePositions(planks.length, riverRef.current);
    return planks.map((p, i) => ({ ...p, style: positions[i] }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundIndex, currentWords.length, riverSize]);

  const floatVariants = ['lp-plank--float-a', 'lp-plank--float-b', 'lp-plank--float-c',
                         'lp-plank--float-d', 'lp-plank--float-e', 'lp-plank--float-f'];

  const advanceRound = useCallback(() => {
    if (roundIndex + 1 >= rounds.length) {
      // All current rounds done — check if everything is fully complete
      // (wordDone will be updated, triggering rounds recalc)
      // If rounds becomes empty after update, we're done
      setRoundComplete(true);
    } else {
      setTimeout(() => {
        setRoundIndex(r => r + 1);
        setMatched(new Set());
        setSelected(null);
      }, 600);
    }
  }, [roundIndex, rounds.length]);

  // When wordDone changes, check if all words have both types done
  const allComplete = useMemo(() =>
    allWords.every(w => wordDone[w.id].translit && wordDone[w.id].translation),
    [allWords, wordDone]
  );

  // When roundComplete is set but not allComplete, restart with new rounds
  useEffect(() => {
    if (roundComplete && !allComplete) {
      // More rounds needed — reset for the new rounds list
      setRoundComplete(false);
      setRoundIndex(0);
      setMatched(new Set());
      setSelected(null);
    }
  }, [roundComplete, allComplete]);

  // When truly all complete, mark pack done
  useEffect(() => {
    if (allComplete && roundComplete) {
      if (packId) markLoosePlanksComplete(packId);
    }
  }, [allComplete, roundComplete, packId]);

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

      // Mark this plank type as done for the word
      setWordDone(prev => ({
        ...prev,
        [plank.wordId]: {
          ...prev[plank.wordId],
          [currentPlankType]: true,
        },
      }));

      if (newMatched.size >= currentWords.length) {
        advanceRound();
      }
    } else {
      setWrongPair({ wordId1: selected.wordId, wordId2: plank.wordId });
      setTimeout(() => {
        setWrongPair(null);
        setSelected(null);
      }, 600);
    }
  }, [selected, matched, currentWords, currentPlankType, wrongPair, advanceRound]);

  // Progress tracking
  const totalPairs = allWords.length * 2; // each word needs translit + translation
  const donePairs = allWords.reduce((n, w) =>
    n + (wordDone[w.id].translit ? 1 : 0) + (wordDone[w.id].translation ? 1 : 0), 0
  );

  if (allComplete && roundComplete) {
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
            {donePairs}<span className="lp-hud-label">/{totalPairs}</span>
          </span>
        </div>
      </div>

      {/* Instruction */}
      <div className="lp-instruction">
        {selected
          ? 'Now tap the matching plank'
          : `Match the ${currentPlankType === 'translit' ? 'transliteration' : 'translation'}`}
      </div>

      {/* Hebrew planks — fixed row at top, wraps if needed */}
      <div className="lp-hebrew-row" key={`hrow-${roundIndex}`}>
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
              <span className="lp-plank-text lp-plank-text--rtl">
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
                <span className="lp-plank-text">
                  {plank.text}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Progress dots — pinned to bottom */}
      <div className="lp-progress-bar">
        {Array.from({ length: totalPairs }).map((_, i) => {
          let cls = 'lp-dot';
          if (i < donePairs) cls += ' lp-dot--done';
          else if (i === donePairs) cls += ' lp-dot--active';
          return <span key={i} className={cls} />;
        })}
      </div>
    </div>
  );
}
