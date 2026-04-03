import React from 'react';

/**
 * Minimal pre-run screen for standalone (non-guided) Deep Script runs.
 * Lets the player choose word source mode before starting.
 * Guided pack runs skip this screen entirely.
 */
export default function KitSelectScreen({
  onSelect,
  onBack,
  wordSourceMode = 'pack',
  onWordSourceModeChange = () => {},
}) {
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
        <p className="ds-kit-subtitle">Explore chambers and master words</p>
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
            <div className="ds-kit-desc">Draw words from a curated pack</div>
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
            <div className="ds-kit-desc">Draw from the full word pool</div>
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
