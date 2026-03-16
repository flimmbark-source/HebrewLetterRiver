import React, { useState, useMemo, useCallback } from 'react';
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
 * LoosePlanksGame — second-pass reinforcement mode.
 *
 * Shows 3 Hebrew word planks fixed on the bridge and 3 transliteration planks
 * floating on the river below. Player taps a Hebrew plank, then taps the
 * matching transliteration plank to secure it.
 *
 * The river extends all the way to the bottom of the screen.
 */
export default function LoosePlanksGame({ sessionConfig, onBack }) {
  const { packId, selectedWordIds } = sessionConfig;

  // Resolve word objects
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
  const [selectedHebrew, setSelectedHebrew] = useState(null);
  const [wrongPair, setWrongPair] = useState(null);
  const [roundComplete, setRoundComplete] = useState(false);

  const currentGroup = groups[groupIndex] || [];

  const shuffledTranslits = useMemo(
    () => shuffle(currentGroup.map(w => ({ wordId: w.id, transliteration: w.transliteration }))),
    [groupIndex, currentGroup.length] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const handleHebrewTap = useCallback((wordId) => {
    if (matched.has(wordId) || wrongPair) return;
    setSelectedHebrew(prev => prev === wordId ? null : wordId);
  }, [matched, wrongPair]);

  const handleTranslitTap = useCallback((translit) => {
    if (!selectedHebrew || matched.has(translit.wordId) || wrongPair) return;

    if (translit.wordId === selectedHebrew) {
      const newMatched = new Set(matched);
      newMatched.add(translit.wordId);
      setMatched(newMatched);
      setSelectedHebrew(null);

      if (newMatched.size >= currentGroup.length) {
        if (groupIndex + 1 >= groups.length) {
          if (packId) markLoosePlanksComplete(packId);
          setRoundComplete(true);
        } else {
          setTimeout(() => {
            setGroupIndex(g => g + 1);
            setMatched(new Set());
            setSelectedHebrew(null);
          }, 600);
        }
      }
    } else {
      setWrongPair({ hebrewId: selectedHebrew, translitId: translit.wordId });
      setTimeout(() => {
        setWrongPair(null);
        setSelectedHebrew(null);
      }, 600);
    }
  }, [selectedHebrew, matched, currentGroup, groupIndex, groups.length, packId, wrongPair]);

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
        {selectedHebrew
          ? 'Now tap the matching transliteration'
          : 'Tap a Hebrew plank to select it'}
      </div>

      {/* Top bank only — river extends to the bottom */}
      <div className="lp-bank lp-bank--top">
        <div className="lp-bank-grass" />
        <div className="lp-bank-dirt" />
      </div>

      {/* Full river area: bridge at top, floating planks below */}
      <div className="lp-river">
        <div className="lp-water">
          <div className="lp-water-surface" />
          <div className="lp-water-shimmer" />
        </div>

        {/* Bridge rails + Hebrew fixed planks */}
        <div className="lp-bridge">
          <div className="lp-rail lp-rail--top" />
          <div className="lp-fixed-planks">
            {currentGroup.map(w => {
              const isMatched = matched.has(w.id);
              const isSelected = selectedHebrew === w.id;
              const isWrong = wrongPair?.hebrewId === w.id;
              let cls = 'lp-hebrew-plank';
              if (isMatched) cls += ' lp-hebrew-plank--matched';
              else if (isWrong) cls += ' lp-hebrew-plank--wrong';
              else if (isSelected) cls += ' lp-hebrew-plank--selected';
              return (
                <button
                  key={w.id}
                  className={cls}
                  onClick={() => handleHebrewTap(w.id)}
                  disabled={isMatched}
                  type="button"
                >
                  <span className="lp-plank-grain" />
                  <span className="lp-hebrew-text">{w.hebrew}</span>
                  {isMatched && (
                    <span className="lp-matched-translit">{w.transliteration}</span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="lp-rail lp-rail--bottom" />
        </div>

        {/* Floating transliteration planks — on the water */}
        <div className="lp-floating-area" key={groupIndex}>
          {shuffledTranslits.map((t, i) => {
            const isMatched = matched.has(t.wordId);
            const isWrong = wrongPair?.translitId === t.wordId;
            let cls = 'lp-translit-plank';
            if (isMatched) cls += ' lp-translit-plank--matched';
            else if (isWrong) cls += ' lp-translit-plank--wrong';
            // Stagger positions for organic floating feel
            cls += ` lp-translit-plank--pos${i}`;
            return (
              <button
                key={t.wordId}
                className={cls}
                onClick={() => handleTranslitTap(t)}
                disabled={isMatched}
                type="button"
              >
                <span className="lp-plank-grain" />
                <span className="lp-translit-text">{t.transliteration}</span>
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
