import React, { useRef, useEffect } from 'react';
import useBridgeBuilderGame from './useBridgeBuilderGame.js';
import './BridgeBuilder.css';

/* ─── HUD (compact strip) ──────────────────────────────── */

function HUD({ score, streak, hearts, maxHearts, wordIndex, totalWords }) {
  return (
    <div className="bb-hud">
      <span className="bb-hud-stat">
        {score}<span className="bb-hud-stat-label"> pts</span>
      </span>
      <span className="bb-hud-stat bb-hud-streak" title="Streak">
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

/* ─── River Scene ──────────────────────────────────────── */

function RiverScene({ segments, totalWords, currentWord, promptVisible, phase }) {
  const bridgeRef = useRef(null);

  // Auto-scroll bridge to show the leading edge
  useEffect(() => {
    if (bridgeRef.current) {
      bridgeRef.current.scrollLeft = bridgeRef.current.scrollWidth;
    }
  }, [segments.length]);

  // How many plank slots total (each word = 2 planks side by side)
  const totalSlots = totalWords;
  const builtCount = segments.length;
  // Is the current word partially placed (transliteration done, meaning pending)?
  const lastSeg = segments[segments.length - 1];
  const lastSegPartial = lastSeg && !lastSeg.translation;

  return (
    <div className="bb-scene">
      {/* Left bank */}
      <div className="bb-bank bb-bank--left">
        <div className="bb-bank-grass" />
        <div className="bb-bank-dirt" />
      </div>

      {/* River + bridge */}
      <div className="bb-river-zone">
        {/* Water layers */}
        <div className="bb-water">
          <div className="bb-water-surface" />
          <div className="bb-water-shimmer" />
        </div>

        {/* Bridge rail / track across the river */}
        <div className="bb-bridge-track" ref={bridgeRef}>
          {/* Built segments */}
          {segments.map((seg, i) => (
            <div
              key={seg.wordId + '-' + i}
              className={`bb-segment ${i === builtCount - 1 ? 'bb-segment--newest' : ''}`}
            >
              <div className="bb-plank bb-plank--translit">
                <span className="bb-plank-text">{seg.transliteration}</span>
              </div>
              {seg.translation ? (
                <div className="bb-plank bb-plank--meaning">
                  <span className="bb-plank-text">{seg.translation}</span>
                </div>
              ) : (
                <div className="bb-plank bb-plank--gap">
                  <span className="bb-plank-text">?</span>
                </div>
              )}
            </div>
          ))}

          {/* Current gap — the active build point */}
          {builtCount < totalSlots && !lastSegPartial && (
            <div className="bb-segment bb-segment--active">
              <div className="bb-plank bb-plank--gap">
                <span className="bb-plank-text">?</span>
              </div>
              <div className="bb-plank bb-plank--gap">
                <span className="bb-plank-text">?</span>
              </div>
            </div>
          )}

          {/* Future segments */}
          {Array.from({
            length: Math.max(0, totalSlots - builtCount - (lastSegPartial ? 0 : 1)),
          }).map((_, i) => (
            <div key={'future-' + i} className="bb-segment bb-segment--future">
              <div className="bb-plank bb-plank--ghost" />
              <div className="bb-plank bb-plank--ghost" />
            </div>
          ))}
        </div>

        {/* Hebrew prompt floats above the gap */}
        {currentWord && (
          <div className={`bb-prompt ${promptVisible ? 'bb-prompt--visible' : ''}`}>
            <span className="bb-prompt-hebrew">{currentWord.hebrew}</span>
          </div>
        )}
      </div>

      {/* Right bank */}
      <div className="bb-bank bb-bank--right">
        <div className="bb-bank-grass" />
        <div className="bb-bank-dirt" />
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

/* ─── Round Complete / Game Over ───────────────────────── */

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

      {/* Center: the river scene */}
      <RiverScene
        segments={bridgeSegments}
        totalWords={totalWords}
        currentWord={currentWord}
        promptVisible={promptVisible}
        phase={phase}
      />

      {/* Bottom: answer planks */}
      <div className="bb-planks-tray">
        {showTranslit && (
          <div className="bb-planks bb-planks--enter" key="translit">
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
          <div className="bb-planks bb-planks--enter" key="teach">
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
          <div className="bb-planks bb-planks--enter" key="meaning">
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
