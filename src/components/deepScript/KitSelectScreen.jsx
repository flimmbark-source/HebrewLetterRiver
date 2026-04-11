import React, { useState } from 'react';

/**
 * KitSelectScreen — pre-run screen for standalone (non-guided) Deep Script runs.
 *
 * Two-step selection flow:
 *   Step 1: Choose expedition mode — Words or Sentences
 *   Step 2: Choose word source — Word Pack or Random
 *
 * Guided pack runs skip this screen entirely.
 */
export default function KitSelectScreen({
  onSelect,
  onBack,
  wordSourceMode = 'pack',
  onWordSourceModeChange = () => {},
  expeditionMode = 'words',
  onExpeditionModeChange = () => {},
  sentenceModeAvailable = false,
}) {
  const [step, setStep] = useState('mode'); // 'mode' | 'source'

  const handleModeSelect = (mode) => {
    onExpeditionModeChange(mode);
    setStep('source');
  };

  const handleBackToMode = () => {
    setStep('mode');
  };

  // ─── Step 1: Mode selection (Words / Sentences) ──────────

  if (step === 'mode') {
    return (
      <div className="ds-kit-select-scroll">
        {/* Header */}
        <div className="ds-header">
          <button className="ds-back-btn" onClick={onBack} type="button">
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_back</span>
          </button>
          <h1 className="ds-screen-title">Deep Script</h1>
        </div>

        {/* Hero Section */}
        <div className="ds-kit-hero">
          <h2 className="ds-kit-hero-title">Begin Expedition</h2>
          <p className="ds-kit-subtitle">Choose your expedition type</p>
        </div>

        {/* Mode Selection */}
        <div className="ds-kit-list">
          <button
            type="button"
            className={`ds-kit-card ${expeditionMode === 'words' ? 'ds-kit-card--selected' : ''}`}
            onClick={() => handleModeSelect('words')}
          >
            {expeditionMode === 'words' && (
              <div className="ds-kit-check">
                <span className="material-symbols-outlined" style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              </div>
            )}
            <div className={`ds-kit-icon ${expeditionMode === 'words' ? 'ds-kit-icon--selected' : ''}`}>
              <span className="material-symbols-outlined" style={{ fontSize: 28 }}>spellcheck</span>
            </div>
            <div className="ds-kit-info">
              <div className="ds-kit-name">Words</div>
              <div className="ds-kit-desc">Spell words letter by letter</div>
            </div>
          </button>

          <button
            type="button"
            className={`ds-kit-card ${expeditionMode === 'sentences' ? 'ds-kit-card--selected' : ''} ${!sentenceModeAvailable ? 'ds-kit-card--locked' : ''}`}
            onClick={() => sentenceModeAvailable && handleModeSelect('sentences')}
            disabled={!sentenceModeAvailable}
          >
            {expeditionMode === 'sentences' && sentenceModeAvailable && (
              <div className="ds-kit-check">
                <span className="material-symbols-outlined" style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              </div>
            )}
            <div className={`ds-kit-icon ${expeditionMode === 'sentences' ? 'ds-kit-icon--selected' : ''} ${!sentenceModeAvailable ? 'ds-kit-icon--locked' : ''}`}>
              <span className="material-symbols-outlined" style={{ fontSize: 28 }}>
                {sentenceModeAvailable ? 'format_align_left' : 'lock'}
              </span>
            </div>
            <div className="ds-kit-info">
              <div className="ds-kit-name">Sentences</div>
              <div className="ds-kit-desc">
                {sentenceModeAvailable
                  ? 'Build sentences from word blocks'
                  : 'Complete a vocab pack to unlock'}
              </div>
            </div>
          </button>
        </div>
      </div>
    );
  }

  // ─── Step 2: Source selection (Word Pack / Random) ────────

  return (
    <div className="ds-kit-select-scroll">
      {/* Header */}
      <div className="ds-header">
        <button className="ds-back-btn" onClick={handleBackToMode} type="button">
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_back</span>
        </button>
        <h1 className="ds-screen-title">Deep Script</h1>
      </div>

      {/* Hero Section */}
      <div className="ds-kit-hero">
        <h2 className="ds-kit-hero-title">
          {expeditionMode === 'words' ? 'Word Expedition' : 'Sentence Expedition'}
        </h2>
        <p className="ds-kit-subtitle">
          {expeditionMode === 'words'
            ? 'Choose your word source'
            : 'Choose your word source'}
        </p>
      </div>

      {/* Word Source Selection */}
      <div className="ds-kit-list">
        <button
          type="button"
          className={`ds-kit-card ${wordSourceMode === 'pack' ? 'ds-kit-card--selected' : ''}`}
          onClick={() => onWordSourceModeChange('pack')}
        >
          {wordSourceMode === 'pack' && (
            <div className="ds-kit-check">
              <span className="material-symbols-outlined" style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
          )}
          <div className={`ds-kit-icon ${wordSourceMode === 'pack' ? 'ds-kit-icon--selected' : ''}`}>
            <span className="material-symbols-outlined" style={{ fontSize: 28 }}>inventory_2</span>
          </div>
          <div className="ds-kit-info">
            <div className="ds-kit-name">Word Pack</div>
            <div className="ds-kit-desc">
              {expeditionMode === 'words'
                ? 'Draw words from a curated pack'
                : 'Use words from a learned pack'}
            </div>
          </div>
        </button>

        <button
          type="button"
          className={`ds-kit-card ${wordSourceMode === 'random' ? 'ds-kit-card--selected' : ''}`}
          onClick={() => onWordSourceModeChange('random')}
        >
          {wordSourceMode === 'random' && (
            <div className="ds-kit-check">
              <span className="material-symbols-outlined" style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
          )}
          <div className={`ds-kit-icon ${wordSourceMode === 'random' ? 'ds-kit-icon--selected' : ''}`}>
            <span className="material-symbols-outlined" style={{ fontSize: 28 }}>shuffle</span>
          </div>
          <div className="ds-kit-info">
            <div className="ds-kit-name">Random</div>
            <div className="ds-kit-desc">
              {expeditionMode === 'words'
                ? 'Draw from the full word pool'
                : 'Draw from all learned words'}
            </div>
          </div>
        </button>
      </div>

      {/* CTA */}
      <div className="ds-footer">
        <button
          type="button"
          className="ds-primary-btn ds-primary-btn--active"
          onClick={() => onSelect()}
        >
          Begin Expedition
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>east</span>
        </button>
      </div>
    </div>
  );
}
