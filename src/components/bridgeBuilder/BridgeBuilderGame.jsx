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

/* ─── Bridge Slot — the two plank positions for the current word ─── */

function BridgeSlot({ segment, phase, slideState }) {
  // slideState: 'center' | 'exit' | 'enter'
  const hasTranslit = segment && segment.transliteration;
  const hasMeaning = segment && segment.translation;

  // Determine what to show in each slot
  const showTranslitPlank = hasTranslit;
  const showMeaningPlank = hasMeaning;
  const showTranslitGap = !hasTranslit;
  const showMeaningGap = hasTranslit && !hasMeaning;

  return (
    <div className={`bb-slot bb-slot--${slideState}`}>
      {/* Transliteration position */}
      {showTranslitPlank ? (
        <div className="bb-placed bb-placed--translit bb-placed--drop">
          <span className="bb-placed-grain" />
          <span className="bb-placed-text">{segment.transliteration}</span>
        </div>
      ) : showTranslitGap ? (
        <div className="bb-gap">
          <span className="bb-gap-q">?</span>
        </div>
      ) : null}

      {/* Meaning position */}
      {showMeaningPlank ? (
        <div className="bb-placed bb-placed--meaning bb-placed--drop">
          <span className="bb-placed-grain" />
          <span className="bb-placed-text">{segment.translation}</span>
        </div>
      ) : showMeaningGap ? (
        <div className="bb-gap">
          <span className="bb-gap-q">?</span>
        </div>
      ) : null}
    </div>
  );
}

/* ─── River Scene ──────────────────────────────────────── */

function RiverScene({ segment, currentWord, promptVisible, phase, wordIndex, totalWords }) {
  const [slideState, setSlideState] = useState('center');
  const [displaySegment, setDisplaySegment] = useState(segment);
  const prevWordIndex = useRef(wordIndex);

  useEffect(() => {
    // When wordIndex changes, trigger the slide transition
    if (wordIndex !== prevWordIndex.current) {
      // Slide old content off to the left
      setSlideState('exit');

      const timer = setTimeout(() => {
        // Swap to new content positioned off-right, then slide to center
        setDisplaySegment(segment);
        setSlideState('enter');

        const timer2 = setTimeout(() => {
          setSlideState('center');
        }, 50);
        return () => clearTimeout(timer2);
      }, 400);

      prevWordIndex.current = wordIndex;
      return () => clearTimeout(timer);
    } else {
      // Same word, just update the segment (plank was placed)
      setDisplaySegment(segment);
    }
  }, [wordIndex, segment]);

  // Progress dots
  const dots = Array.from({ length: totalWords }).map((_, i) => {
    let cls = 'bb-dot';
    if (i < wordIndex) cls += ' bb-dot--done';
    else if (i === wordIndex) cls += ' bb-dot--active';
    return <span key={i} className={cls} />;
  });

  return (
    <div className="bb-scene">
      {/* Top bank */}
      <div className="bb-bank bb-bank--top">
        <div className="bb-bank-grass" />
        <div className="bb-bank-dirt" />
      </div>

      {/* River zone */}
      <div className="bb-river-zone">
        <div className="bb-water">
          <div className="bb-water-surface" />
          <div className="bb-water-shimmer" />
        </div>

        {/* Bridge rails */}
        <div className="bb-rails">
          <div className="bb-rail bb-rail--top" />
          <div className="bb-rail bb-rail--bottom" />
        </div>

        {/* Hebrew prompt — above the build area */}
        {currentWord && (
          <div className={`bb-prompt ${promptVisible ? 'bb-prompt--visible' : ''}`}>
            <span className="bb-prompt-hebrew">{currentWord.hebrew}</span>
          </div>
        )}

        {/* Current build slot */}
        <BridgeSlot
          segment={displaySegment}
          phase={phase}
          slideState={slideState}
        />

        {/* Progress dots below the bridge area */}
        <div className="bb-progress-dots">
          {dots}
        </div>
      </div>

      {/* Bottom bank */}
      <div className="bb-bank bb-bank--bottom">
        <div className="bb-bank-dirt" />
        <div className="bb-bank-grass" />
      </div>
    </div>
  );
}

/* ─── Choice Plank ─────────────────────────────────────── */

function ChoicePlank({ text, onClick, state, disabled, variant }) {
  let cls = 'bb-choice';
  if (variant === 'teach') cls += ' bb-choice--teach';
  if (state === 'correct') cls += ' bb-choice--correct';
  else if (state === 'wrong') cls += ' bb-choice--wrong';

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

export default function BridgeBuilderGame({ onBack }) {
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
  } = useBridgeBuilderGame();

  // The current segment being built (last in bridgeSegments, or null if not started)
  const currentSegment = bridgeSegments.length > 0 && bridgeSegments[bridgeSegments.length - 1].wordId === currentWord?.id
    ? bridgeSegments[bridgeSegments.length - 1]
    : null;

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
      {/* Top controls */}
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

      {/* Center: the river scene with only the current word */}
      <RiverScene
        segment={currentSegment}
        currentWord={currentWord}
        promptVisible={promptVisible}
        phase={phase}
        wordIndex={wordIndex}
        totalWords={totalWords}
      />

      {/* Bottom: answer planks */}
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
    </div>
  );
}
