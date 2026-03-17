import React, { useState, useMemo } from 'react';
import { getRandomUpgrades } from '../../data/deepScript/upgrades.js';
import RunStatusBar from './RunStatusBar.jsx';

export default function ShrineScreen({ runState, onComplete }) {
  const [selectedId, setSelectedId] = useState(null);
  const [confirmed, setConfirmed] = useState(false);

  const ownedUpgradeIds = Object.keys(runState.upgrades || {});
  const options = useMemo(
    () => getRandomUpgrades(3, ownedUpgradeIds),
    [ownedUpgradeIds]
  );

  const handleConfirm = () => {
    if (!selectedId) return;
    setConfirmed(true);
    setTimeout(() => onComplete(selectedId), 800);
  };

  return (
    <div className="ds-screen ds-shrine">
      <RunStatusBar runState={runState} />

      <div className="ds-shrine-content">
        <div className="ds-shrine-icon">🏛️</div>
        <h2 className="ds-shrine-title">Ancient Shrine</h2>
        <p className="ds-shrine-desc">Choose a blessing to carry forward</p>

        <div className="ds-shrine-options">
          {options.map(upgrade => (
            <button
              key={upgrade.id}
              type="button"
              className={`ds-shrine-card ${selectedId === upgrade.id ? 'ds-shrine-card--selected' : ''}`}
              onClick={() => !confirmed && setSelectedId(upgrade.id)}
              disabled={confirmed}
            >
              <div className="ds-shrine-card-icon">{upgrade.icon}</div>
              <div className="ds-shrine-card-info">
                <div className="ds-shrine-card-name">{upgrade.name}</div>
                <div className="ds-shrine-card-desc">{upgrade.description}</div>
              </div>
            </button>
          ))}
        </div>

        <button
          type="button"
          className={`ds-primary-btn ${selectedId ? 'ds-primary-btn--active' : ''} ${confirmed ? 'ds-primary-btn--done' : ''}`}
          onClick={handleConfirm}
          disabled={!selectedId || confirmed}
        >
          {confirmed ? 'Blessed' : 'Accept Blessing'}
        </button>
      </div>
    </div>
  );
}
