import React, { useState } from 'react';
import { getSeenPacks } from '../../lib/packProgression.js';
import Icon from '../Icon.jsx';

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
  selectedPackId = null,
  onSelectedPackIdChange = () => {},
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
            <Icon name="arrow_back" style={{ fontSize: 20 }} />
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
                <Icon name="check_circle" filled style={{ fontSize: 20 }} />
              </div>
            )}
            <div className={`ds-kit-icon ${expeditionMode === 'words' ? 'ds-kit-icon--selected' : ''}`}>
              <Icon name="spellcheck" style={{ fontSize: 28 }} />
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
                <Icon name="check_circle" filled style={{ fontSize: 20 }} />
              </div>
            )}
            <div className={`ds-kit-icon ${expeditionMode === 'sentences' ? 'ds-kit-icon--selected' : ''} ${!sentenceModeAvailable ? 'ds-kit-icon--locked' : ''}`}>
              <Icon name={sentenceModeAvailable ? 'format_align_left' : 'lock'} style={{ fontSize: 28 }} />
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

  const seenPacks = getSeenPacks();

  return (
    <div className="ds-kit-select-scroll">
      {/* Header */}
      <div className="ds-header">
        <button className="ds-back-btn" onClick={handleBackToMode} type="button">
          <Icon name="arrow_back" style={{ fontSize: 20 }} />
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
        <div>
          <button
            type="button"
            className={`ds-kit-card ${wordSourceMode === 'pack' ? 'ds-kit-card--selected' : ''}`}
            onClick={() => onWordSourceModeChange('pack')}
            style={{ width: '100%' }}
          >
            {wordSourceMode === 'pack' && (
              <div className="ds-kit-check">
                <Icon name="check_circle" filled style={{ fontSize: 20 }} />
              </div>
            )}
            <div className={`ds-kit-icon ${wordSourceMode === 'pack' ? 'ds-kit-icon--selected' : ''}`}>
              <Icon name="inventory_2" style={{ fontSize: 28 }} />
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

          {wordSourceMode === 'pack' && (
            <div className="ds-pack-dropdown-wrap">
              {seenPacks.length === 0 ? (
                <p className="ds-pack-dropdown-empty">Play a pack in Vocab Builder first to unlock it here.</p>
              ) : (
                <select
                  className="ds-pack-dropdown"
                  value={selectedPackId ?? ''}
                  onChange={(e) => onSelectedPackIdChange(e.target.value || null)}
                >
                  <option value="">Random seen pack</option>
                  {seenPacks.map((pack) => (
                    <option key={pack.id} value={pack.id}>{pack.title}</option>
                  ))}
                </select>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          className={`ds-kit-card ${wordSourceMode === 'random' ? 'ds-kit-card--selected' : ''}`}
          onClick={() => onWordSourceModeChange('random')}
        >
          {wordSourceMode === 'random' && (
            <div className="ds-kit-check">
              <Icon name="check_circle" filled style={{ fontSize: 20 }} />
            </div>
          )}
          <div className={`ds-kit-icon ${wordSourceMode === 'random' ? 'ds-kit-icon--selected' : ''}`}>
            <Icon name="shuffle" style={{ fontSize: 28 }} />
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
          <Icon name="east" style={{ fontSize: 20 }} />
        </button>
      </div>
    </div>
  );
}
