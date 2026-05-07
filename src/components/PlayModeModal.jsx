import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext.jsx';
import { useLocalization } from '../context/LocalizationContext.jsx';
import Modal from './ui/Modal.jsx';
import './PlayModeModal.css';

function ModeIcon({ children, className = '' }) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{ fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24" }}
      aria-hidden="true"
    >
      {children}
    </span>
  );
}

export default function PlayModeModal() {
  const { showPlayModal, setShowPlayModal, openGame } = useGame();
  const { t } = useLocalization();
  const navigate = useNavigate();

  const handleClose = () => setShowPlayModal(false);

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
    navigate('/deep-script');
  };

  return (
    <Modal
      isOpen={showPlayModal}
      onClose={handleClose}
      titleId="play-mode-title"
      className="play-mode-modal"
    >
      <button className="play-mode-close" onClick={handleClose} type="button" aria-label={t('app.playMode.close', 'Close')}>
        <ModeIcon className="text-lg">close</ModeIcon>
      </button>
      <h2 id="play-mode-title" className="play-mode-title">{t('app.playMode.title', 'Choose Your Mode')}</h2>

      <div className="play-mode-options">
        <button type="button" className="play-mode-card play-mode-card--river" onClick={handleLetterRiver}>
          <div className="play-mode-icon">
            <ModeIcon className="text-2xl">waves</ModeIcon>
          </div>
          <div className="play-mode-info">
            <div className="play-mode-name">{t('app.playMode.letterRiver.name', 'Letter River')}</div>
            <div className="play-mode-desc">{t('app.playMode.letterRiver.description', 'Catch letters as they flow down the river')}</div>
          </div>
        </button>

        <button type="button" className="play-mode-card play-mode-card--bridge" onClick={handleBridgeBuilder}>
          <div className="play-mode-icon">
            <ModeIcon className="text-2xl">extension</ModeIcon>
          </div>
          <div className="play-mode-info">
            <div className="play-mode-name">{t('app.playMode.vocabBuilder.name', 'Vocab Builder')}</div>
            <div className="play-mode-desc">{t('app.playMode.vocabBuilder.description', 'Play games to learn and practice vocabulary')}</div>
          </div>
        </button>

        <button type="button" className="play-mode-card play-mode-card--deep" onClick={handleDeepScript}>
          <div className="play-mode-icon">
            <ModeIcon className="text-2xl">explore</ModeIcon>
          </div>
          <div className="play-mode-info">
            <div className="play-mode-name">{t('app.playMode.deepScript.name', 'Deep Script')}</div>
            <div className="play-mode-desc">{t('app.playMode.deepScript.description', 'Endless dungeon-crawl through vocabulary words')}</div>
          </div>
        </button>
      </div>
    </Modal>
  );
}
