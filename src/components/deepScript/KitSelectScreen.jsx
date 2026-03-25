import React, { useState } from 'react';
import { starterKits } from '../../data/deepScript/starterKits.js';
import { getGearById } from '../../data/deepScript/gear.js';

/* ─── Kit icon mapping to Material Symbols ─────────────── */
const KIT_ICONS = {
  scribe: 'history_edu',
  interpreter: 'glass_cup',
  rootkeeper: 'eco',
};

export default function KitSelectScreen({
  onSelect,
  onBack,
  wordSourceMode = 'pack',
  onWordSourceModeChange = () => {},
  showWordSourceToggle = false,
}) {
  const [selectedKit, setSelectedKit] = useState(null);

  return (
    <div className="ds-screen ds-kit-select">
      {/* Header */}
      <div className="ds-header">
        <button className="ds-back-btn" onClick={onBack} type="button">
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>arrow_back</span>
        </button>
        <h1 className="ds-screen-title">Deep Script</h1>
        {showWordSourceToggle && (
          <div className="ds-source-pill">
            <button
              type="button"
              className={`ds-source-pill-btn ${wordSourceMode === 'pack' ? 'ds-source-pill-btn--active' : ''}`}
              onClick={() => onWordSourceModeChange('pack')}
            >
              Pack
            </button>
            <button
              type="button"
              className={`ds-source-pill-btn ${wordSourceMode === 'random' ? 'ds-source-pill-btn--active' : ''}`}
              onClick={() => onWordSourceModeChange('random')}
            >
              Random
            </button>
          </div>
        )}
      </div>

      {/* Hero Section */}
      <div className="ds-kit-hero">
        <div className="ds-kit-badge">
          <span className="ds-kit-badge-text">Selection Archive</span>
        </div>
        <h2 className="ds-kit-hero-title">Expedition Route</h2>
        <p className="ds-kit-subtitle">Choose your path through the archive</p>
      </div>

      {/* Kit Cards */}
      <div className="ds-kit-list">
        {starterKits.map(kit => {
          const isSelected = selectedKit === kit.id;
          const materialIcon = KIT_ICONS[kit.id] || 'category';
          return (
            <button
              key={kit.id}
              type="button"
              className={`ds-kit-card ${isSelected ? 'ds-kit-card--selected' : ''}`}
              onClick={() => setSelectedKit(kit.id)}
            >
              {isSelected && (
                <div className="ds-kit-check">
                  <span className="material-symbols-outlined" style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                </div>
              )}
              <div className={`ds-kit-icon ${isSelected ? 'ds-kit-icon--selected' : ''}`}>
                <span className="material-symbols-outlined" style={{ fontSize: 28 }}>{materialIcon}</span>
              </div>
              <div className="ds-kit-info">
                <div className="ds-kit-name">{kit.name}</div>
                <div className="ds-kit-desc">{kit.description}</div>
                {isSelected && (
                  <div className="ds-kit-details">
                    <p className="ds-kit-flavor">{kit.flavor}</p>
                    <div className="ds-kit-stats">
                      <span>HP: {kit.health}</span>
                      <span>Tray: {kit.traySize}</span>
                      <span>Satchel: {kit.satchelSize}</span>
                    </div>
                    <div className="ds-kit-gear">
                      {kit.gearIds.map(gId => {
                        const g = getGearById(gId);
                        return g ? (
                          <span key={gId} className="ds-kit-gear-tag">
                            {g.icon} {g.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* CTA */}
      <div className="ds-footer">
        <button
          type="button"
          className={`ds-primary-btn ${selectedKit ? 'ds-primary-btn--active' : ''}`}
          onClick={() => selectedKit && onSelect(selectedKit)}
          disabled={!selectedKit}
        >
          Begin Expedition
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>east</span>
        </button>
      </div>
    </div>
  );
}
