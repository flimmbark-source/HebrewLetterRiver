import React, { useState, useEffect, useRef } from 'react';
import useBridgeBuilderGame from './useBridgeBuilderGame.js';
import './BridgeBuilder.css';

/* ─── HUD (compact strip) ──────────────────────────────── */

function HUD({ score, streak, hearts, maxHearts, wordIndex, totalWords }) {
  return (
    <div className="bb-hud">
      <span className="bb-hud-stat">
        {score}<span className="bb-hud-stat-label"> pts</span>
      </span>
      <span className="bb-hud-stat bb-hud-streak">
        {streak}x
      </span>
      <span className="bb-hud-hearts" aria-label={`${hearts} of ${maxHearts} hearts`}>
        {Array.from({ length: maxHearts }).map((_, i) => (
          <span key={i} className={i < hearts ? 'bb-heart' : 'bb-heart bb-heart--lost'} />
        ))}
      </span>
      <span className="bb-hud-stat">
        {wordIndex}<span className="bb-hud-stat-label">/{totalWords}</span>
      </span>
    </div>
  );
}

/* ─── Bridge Slot — the two plank positions between the rails ─── */

function BridgeSlot({ segment, slideState }) {
  const hasTranslit = segment && segment.transliteration;
  const hasMeaning = segment && segment.translation;

  return (
    <div className={`bb-slot bb-slot--${slideState}`}>
      {/* Left plank: transliteration */}
      <div className="bb-slot-pos">
        {hasTranslit ? (
          <div className="bb-placed bb-placed--translit bb-placed--drop" key={segment.transliteration}>
            <span className="bb-placed-grain" />
            <span className="bb-placed-text">{segment.transliteration}</span>
          </div>
        ) : (
          <div className="bb-gap">
            <span className="bb-gap-q">?</span>
          </div>
        )}
      </div>

      {/* Right plank: meaning */}
      <div className="bb-slot-pos">
        {hasMeaning ? (
          <div className="bb-placed bb-placed--meaning bb-placed--drop" key={segment.translation}>
            <span className="bb-placed-grain" />
            <span className="bb-placed-text">{segment.translation}</span>
          </div>
        ) : (
          <div className="bb-gap">
            <span className="bb-gap-q">?</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Choice Plank ─────────────────────────────────────── */

function ChoicePlank({ text, onClick, state, disabled, variant, exiting }) {
  let cls = 'bb-choice';
  if (variant === 'teach') cls += ' bb-choice--teach';
  if (state === 'correct') cls += ' bb-choice--correct';
  else if (state === 'wrong') cls += ' bb-choice--wrong';
  if (exiting) cls += ' bb-choice--exit';

  return (
    <button className={cls} onClick={onClick} disabled={disabled} type="button">
      <span className="bb-choice-grain" />
      <span className="bb-choice-text">{text}</span>
    </button>
  );
}

/* ─── End Screen ───────────────────────────────────────── */

function EndScreen({ score, bridgeSegments, isGameOver, onRestart, onBack }) {
  return (
    <div className="bb-end">
      <div className="bb-end-card">
        <h2 className="bb-end-title">
          {isGameOver ? 'Bridge Collapsed!' : 'Bridge Complete!'}
        </h2>
        <div className="bb-end-bridge-mini">
          {bridgeSegments.map((seg, i) => (
            <div key={i} className="bb-end-seg">
              <span className="bb-end-plank bb-end-plank--t">{seg.transliteration}</span>
              {seg.translation && (
                <span className="bb-end-plank bb-end-plank--m">{seg.translation}</span>
              )}
            </div>
          ))}
        </div>
        <p className="bb-end-score">{score} points</p>
        <div className="bb-end-actions">
          <button className="bb-end-btn bb-end-btn--primary" onClick={onRestart} type="button">
            Build Again
          </button>
          <button className="bb-end-btn bb-end-btn--secondary" onClick={onBack} type="button">
            Back
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main ─────────────────────────────────────────────── */

export default function BridgeBuilderGame({ sessionConfig, onBack }) {
  const {
    phase,
    currentWord,
    score,
    streak,
    hearts,
    maxHearts,
    bridgeSegments,
    totalWords,
    wordIndex,
    isRoundComplete,
    isGameOver,
    translitChoices,
    meaningChoices,
    selectedChoice,
    choiceResult,
    handleTransliterationChoice,
    handleMeaningTeachPlace,
    handleMeaningChoice,
    restartGame,
  } = useBridgeBuilderGame(sessionConfig);

  // Track slide transition state for bridge slot
  const [slideState, setSlideState] = useState('center');
  const [displaySegment, setDisplaySegment] = useState(null);
  const prevWordIndex = useRef(wordIndex);

  // Current segment being built
  const currentSegment = bridgeSegments.length > 0 && bridgeSegments[bridgeSegments.length - 1].wordId === currentWord?.id
    ? bridgeSegments[bridgeSegments.length - 1]
    : null;

  useEffect(() => {
    if (wordIndex !== prevWordIndex.current) {
      // Slide old content off to the left
      setSlideState('exit');
      const timer = setTimeout(() => {
        setDisplaySegment(null);
        setSlideState('enter');
        const timer2 = setTimeout(() => {
          setSlideState('center');
        }, 50);
        return () => clearTimeout(timer2);
      }, 400);
      prevWordIndex.current = wordIndex;
      return () => clearTimeout(timer);
    } else {
      setDisplaySegment(currentSegment);
    }
  }, [wordIndex, currentSegment]);

  // Progress dots
  const dots = Array.from({ length: totalWords }).map((_, i) => {
    let cls = 'bb-dot';
    if (i < wordIndex) cls += ' bb-dot--done';
    else if (i === wordIndex) cls += ' bb-dot--active';
    return <span key={i} className={cls} />;
  });

  if (isRoundComplete || isGameOver) {
    return (
      <div className="bb-world">
        <div className="bb-topbar">
          <button className="bb-back" onClick={onBack} type="button">Back</button>
        </div>
        <EndScreen
          score={score}
          bridgeSegments={bridgeSegments}
          isGameOver={isGameOver}
          onRestart={restartGame}
          onBack={onBack}
        />
      </div>
    );
  }

  const promptVisible = phase !== 'roundComplete';
  const showTranslit = phase === 'transliterationChoice';
  const showTeach = phase === 'meaningTeach';
  const showMeaning = phase === 'meaningChoice';
  const disabled = choiceResult !== null;

  return (
    <div className="bb-world">
      {/* Top: back + HUD */}
      <div className="bb-topbar">
        <button className="bb-back" onClick={onBack} type="button">Back</button>
        <HUD
          score={score}
          streak={streak}
          hearts={hearts}
          maxHearts={maxHearts}
          wordIndex={wordIndex}
          totalWords={totalWords}
        />
      </div>

      {/* Hebrew prompt area — fixed height, centered */}
      <div className="bb-prompt-zone">
        {currentWord && (
          <div className={`bb-prompt ${promptVisible ? 'bb-prompt--visible' : ''}`}>
            <span className="bb-prompt-hebrew">{currentWord.hebrew}</span>
          </div>
        )}
      </div>

      {/* River scene — fixed height */}
      <div className="bb-scene">
        <div className="bb-bank bb-bank--top">
          <div className="bb-bank-grass" />
          <div className="bb-bank-dirt" />
        </div>

        <div className="bb-river-zone">
          <div className="bb-water">
            <div className="bb-water-surface" />
            <div className="bb-water-shimmer" />
          </div>

          {/* Bridge: rails + slot centered between them */}
          <div className="bb-bridge">
            <div className="bb-rail bb-rail--top" />
            <BridgeSlot segment={displaySegment} slideState={slideState} />
            <div className="bb-rail bb-rail--bottom" />
          </div>
        </div>

        <div className="bb-bank bb-bank--bottom">
          <div className="bb-bank-dirt" />
          <div className="bb-bank-grass" />
        </div>
      </div>

      {/* Answer planks */}
      <div className="bb-planks-tray">
        {showTranslit && (
          <div className="bb-planks bb-planks--enter" key={'t-' + wordIndex}>
            {translitChoices.map((c) => (
              <ChoicePlank
                key={c}
                text={c}
                onClick={() => handleTransliterationChoice(c)}
                state={selectedChoice === c ? choiceResult : null}
                disabled={disabled}
              />
            ))}
          </div>
        )}

        {showTeach && currentWord && (
          <div className="bb-planks bb-planks--enter" key={'teach-' + wordIndex}>
            <ChoicePlank
              text={currentWord.translation}
              onClick={handleMeaningTeachPlace}
              variant="teach"
              state={null}
              disabled={false}
            />
          </div>
        )}

        {showMeaning && (
          <div className="bb-planks bb-planks--enter" key={'m-' + wordIndex}>
            {meaningChoices.map((c) => (
              <ChoicePlank
                key={c}
                text={c}
                onClick={() => handleMeaningChoice(c)}
                state={selectedChoice === c ? choiceResult : null}
                disabled={disabled}
              />
            ))}
          </div>
        )}
      </div>

      {/* Progress dots — pinned to bottom */}
      <div className="bb-progress-bar">
        {dots}
      </div>
    </div>
  );
}
