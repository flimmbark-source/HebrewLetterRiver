import React, { useState } from 'react';
import { starterKits } from '../../data/deepScript/starterKits.js';
import { getGearById } from '../../data/deepScript/gear.js';

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
      <div className="ds-header">
        <button className="ds-back-btn" onClick={onBack} type="button">Back</button>
        <h1 className="ds-screen-title">Deep Script</h1>
        {showWordSourceToggle && (
          <button
            type="button"
            className="ds-source-toggle"
            onClick={() => onWordSourceModeChange(wordSourceMode === 'pack' ? 'random' : 'pack')}
            aria-label="Toggle floor word source"
          >
            <span>Pack</span>
            <span className={`ds-source-toggle-knob ${wordSourceMode === 'random' ? 'ds-source-toggle-knob--random' : ''}`} />
            <span>Random</span>
          </button>
        )}
      </div>

      <div className="ds-kit-intro">
        <p className="ds-kit-subtitle">Choose your path through the archive</p>
      </div>

      <div className="ds-kit-list">
        {starterKits.map(kit => {
          const isSelected = selectedKit === kit.id;
          return (
            <button
              key={kit.id}
              type="button"
              className={`ds-kit-card ${isSelected ? 'ds-kit-card--selected' : ''}`}
              onClick={() => setSelectedKit(kit.id)}
            >
              <div className="ds-kit-icon">{kit.icon}</div>
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

      <div className="ds-footer">
        <button
          type="button"
          className={`ds-primary-btn ${selectedKit ? 'ds-primary-btn--active' : ''}`}
          onClick={() => selectedKit && onSelect(selectedKit)}
          disabled={!selectedKit}
        >
          Begin Expedition
        </button>
      </div>
    </div>
  );
}
