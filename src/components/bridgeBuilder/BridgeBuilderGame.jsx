import React from 'react';
import useBridgeBuilderGame from './useBridgeBuilderGame.js';
import './BridgeBuilder.css';

/* ─── HUD ──────────────────────────────────────────────── */

function HUD({ score, streak, hearts, maxHearts, wordIndex, totalWords }) {
  return (
    <div className="bb-hud">
      <div className="bb-hud-item">
        <span className="bb-hud-label">Score</span>
        <span className="bb-hud-value">{score}</span>
      </div>
      <div className="bb-hud-item">
        <span className="bb-hud-label">Streak</span>
        <span className="bb-hud-value">{streak}</span>
      </div>
      <div className="bb-hud-hearts">
        {Array.from({ length: maxHearts }).map((_, i) => (
          <span key={i} className={`bb-heart ${i < hearts ? '' : 'bb-heart--lost'}`}>
            {i < hearts ? '❤️' : '🖤'}
          </span>
        ))}
      </div>
      <div className="bb-hud-item">
        <span className="bb-hud-label">Bridge</span>
        <span className="bb-hud-value">{wordIndex}/{totalWords}</span>
      </div>
    </div>
  );
}

/* ─── Hebrew Prompt Card ───────────────────────────────── */

function HebrewPromptCard({ word, visible }) {
  if (!word) return null;
  return (
    <div className={`bb-prompt-card ${visible ? 'bb-prompt-card--visible' : ''}`}>
      <span className="bb-prompt-hebrew">{word.hebrew}</span>
    </div>
  );
}

/* ─── Bridge Area ──────────────────────────────────────── */

function BridgeArea({ segments, totalWords }) {
  return (
    <div className="bb-bridge-area">
      {/* River */}
      <div className="bb-river">
        <div className="bb-river-water" />
      </div>
      {/* Bridge planks */}
      <div className="bb-bridge">
        {segments.map((seg, i) => (
          <div key={seg.wordId + '-' + i} className="bb-bridge-segment bb-bridge-segment--placed">
            <div className="bb-plank bb-plank--bridge bb-plank--translit">
              {seg.transliteration}
            </div>
            {seg.translation && (
              <div className="bb-plank bb-plank--bridge bb-plank--meaning">
                {seg.translation}
              </div>
            )}
          </div>
        ))}
        {/* Empty slots for remaining */}
        {Array.from({ length: Math.max(0, totalWords - segments.length) }).map((_, i) => (
          <div key={'empty-' + i} className="bb-bridge-segment bb-bridge-segment--empty">
            <div className="bb-plank-slot" />
            <div className="bb-plank-slot" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Choice Plank ─────────────────────────────────────── */

function ChoicePlank({ text, onClick, state, disabled }) {
  let className = 'bb-choice-plank';
  if (state === 'correct') className += ' bb-choice-plank--correct';
  else if (state === 'wrong') className += ' bb-choice-plank--wrong';

  return (
    <button
      className={className}
      onClick={onClick}
      disabled={disabled}
      type="button"
    >
      {text}
    </button>
  );
}

/* ─── Meaning Teach Plank (single revealed) ────────────── */

function MeaningTeachPlank({ translation, onPlace }) {
  return (
    <div className="bb-teach-area">
      <button
        className="bb-choice-plank bb-choice-plank--teach"
        onClick={onPlace}
        type="button"
      >
        {translation}
      </button>
    </div>
  );
}

/* ─── Round Complete / Game Over screens ───────────────── */

function RoundCompleteScreen({ score, bridgeSegments, hearts, isGameOver, onRestart }) {
  return (
    <div className="bb-end-screen">
      <div className="bb-end-card">
        <h2 className="bb-end-title">
          {isGameOver ? 'Bridge Collapsed!' : 'Bridge Complete!'}
        </h2>
        <p className="bb-end-score">Score: {score}</p>
        <p className="bb-end-detail">
          {bridgeSegments.length} segment{bridgeSegments.length !== 1 ? 's' : ''} built
        </p>
        <button className="bb-restart-btn" onClick={onRestart} type="button">
          Build Again
        </button>
      </div>
    </div>
  );
}

/* ─── Main Component ───────────────────────────────────── */

export default function BridgeBuilderGame({ onBack }) {
  const game = useBridgeBuilderGame();

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
  } = game;

  if (isRoundComplete || isGameOver) {
    return (
      <div className="bb-container">
        <div className="bb-top-bar">
          <button className="bb-back-btn" onClick={onBack} type="button">
            ← Back
          </button>
        </div>
        <RoundCompleteScreen
          score={score}
          bridgeSegments={bridgeSegments}
          hearts={hearts}
          isGameOver={isGameOver}
          onRestart={restartGame}
        />
      </div>
    );
  }

  const showPrompt = phase !== 'roundComplete';
  const showTranslitChoices = phase === 'transliterationChoice';
  const showMeaningTeach = phase === 'meaningTeach';
  const showMeaningChoices = phase === 'meaningChoice';
  const isChoiceDisabled = choiceResult !== null;

  return (
    <div className="bb-container">
      <div className="bb-top-bar">
        <button className="bb-back-btn" onClick={onBack} type="button">
          ← Back
        </button>
      </div>

      <HUD
        score={score}
        streak={streak}
        hearts={hearts}
        maxHearts={maxHearts}
        wordIndex={wordIndex}
        totalWords={totalWords}
      />

      <HebrewPromptCard word={currentWord} visible={showPrompt} />

      <BridgeArea segments={bridgeSegments} totalWords={totalWords} />

      {/* Choice area — only one set of planks visible at a time */}
      <div className="bb-choices-area">
        {showTranslitChoices && (
          <div className="bb-choices bb-choices--enter">
            {translitChoices.map((choice) => {
              let state = null;
              if (selectedChoice === choice) state = choiceResult;
              return (
                <ChoicePlank
                  key={choice}
                  text={choice}
                  onClick={() => handleTransliterationChoice(choice)}
                  state={state}
                  disabled={isChoiceDisabled}
                />
              );
            })}
          </div>
        )}

        {showMeaningTeach && currentWord && (
          <div className="bb-choices bb-choices--enter">
            <MeaningTeachPlank
              translation={currentWord.translation}
              onPlace={handleMeaningTeachPlace}
            />
          </div>
        )}

        {showMeaningChoices && (
          <div className="bb-choices bb-choices--enter">
            {meaningChoices.map((choice) => {
              let state = null;
              if (selectedChoice === choice) state = choiceResult;
              return (
                <ChoicePlank
                  key={choice}
                  text={choice}
                  onClick={() => handleMeaningChoice(choice)}
                  state={state}
                  disabled={isChoiceDisabled}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
