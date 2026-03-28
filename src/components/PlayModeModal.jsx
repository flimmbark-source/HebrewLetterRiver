import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext.jsx';
import './PlayModeModal.css';

export default function PlayModeModal() {
  const { showPlayModal, setShowPlayModal, openGame } = useGame();
  const navigate = useNavigate();

  if (!showPlayModal) return null;

  const handleLetterRiver = () => {
    setShowPlayModal(false);
    openGame({ autostart: false });
  };

  const handleBridgeBuilder = () => {
    setShowPlayModal(false);
    navigate('/bridge');
  };

  const handleDeepScript = () => {
    setShowPlayModal(false);
    navigate('/bridge', { state: { deepScript: true } });
  };

  const handleClose = () => {
    setShowPlayModal(false);
  };

  return (
    <div className="play-mode-overlay" onClick={handleClose}>
      <div className="play-mode-modal" onClick={(e) => e.stopPropagation()}>
        <button className="play-mode-close" onClick={handleClose} type="button" aria-label="Close">
          &times;
        </button>
        <h2 className="play-mode-title">Choose Your Mode</h2>

        <div className="play-mode-options">
          <button type="button" className="play-mode-card play-mode-card--river" onClick={handleLetterRiver}>
            <div className="play-mode-icon">🌊</div>
            <div className="play-mode-info">
              <div className="play-mode-name">Letter River</div>
              <div className="play-mode-desc">Catch letters as they flow down the river</div>
            </div>
          </button>

          <button type="button" className="play-mode-card play-mode-card--bridge" onClick={handleBridgeBuilder}>
            <div className="play-mode-icon">🛠️</div>
            <div className="play-mode-info">
              <div className="play-mode-name">Vocab Builder</div>
              <div className="play-mode-desc">Play games to learn and practice vocabulary</div>
            </div>
          </button>

          <button type="button" className="play-mode-card play-mode-card--deep" onClick={handleDeepScript}>
            <div className="play-mode-icon">📜</div>
            <div className="play-mode-info">
              <div className="play-mode-name">Deep Script</div>
              <div className="play-mode-desc">Endless dungeon-crawl through vocabulary words</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
