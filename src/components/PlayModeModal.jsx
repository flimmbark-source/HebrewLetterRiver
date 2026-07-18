import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext.jsx';
import { useLocalization } from '../context/LocalizationContext.jsx';
import { useJourney } from '../hooks/useJourney.js';
import Modal from './ui/Modal.jsx';
import Icon from './Icon.jsx';
import './PlayModeModal.css';

function StageChip({ label, locked }) {
  if (!label) return null;
  return (
    <div className="play-mode-stage-chip">
      {locked && <Icon name="lock" className="text-xs" filled />}
      <span>{label}</span>
    </div>
  );
}

export default function PlayModeModal() {
  const { showPlayModal, setShowPlayModal, openGame } = useGame();
  const { t } = useLocalization();
  const navigate = useNavigate();
  const { stages } = useJourney();
  const stageById = React.useMemo(
    () => Object.fromEntries(stages.map((stage) => [stage.id, stage])),
    [stages]
  );

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

  const handleConversation = () => {
    setShowPlayModal(false);
    navigate('/read');
  };

  const stageChipLabel = (stageId) => {
    const stage = stageById[stageId];
    if (!stage) return null;
    return t('journey.chip.stage', 'Stage {{number}} · {{label}}', {
      number: stage.index + 1,
      label: stage.label
    });
  };

  return (
    <Modal
      isOpen={showPlayModal}
      onClose={handleClose}
      titleId="play-mode-title"
      className="play-mode-modal"
    >
      <button className="play-mode-close" onClick={handleClose} type="button" aria-label={t('app.playMode.close', 'Close')}>
        <Icon name="close" className="text-lg" filled />
      </button>
      <h2 id="play-mode-title" className="play-mode-title">{t('app.playMode.title', 'Choose Your Mode')}</h2>

      <div className="play-mode-options">
        <button type="button" className="play-mode-card play-mode-card--river" onClick={handleLetterRiver}>
          <div className="play-mode-icon">
            <Icon name="waves" className="text-2xl" filled />
          </div>
          <div className="play-mode-info">
            <StageChip label={stageChipLabel('letters')} locked={false} />
            <div className="play-mode-name">{t('app.playMode.letterRiver.name', 'Letter River')}</div>
            <div className="play-mode-desc">{t('app.playMode.letterRiver.description', 'Catch letters as they flow down the river')}</div>
          </div>
        </button>

        <button type="button" className="play-mode-card play-mode-card--bridge" onClick={handleBridgeBuilder}>
          <div className="play-mode-icon">
            <Icon name="extension" className="text-2xl" filled />
          </div>
          <div className="play-mode-info">
            <StageChip label={stageChipLabel('words')} locked={stageById.words ? !stageById.words.unlocked : false} />
            <div className="play-mode-name">{t('app.playMode.vocabBuilder.name', 'Vocab Builder')}</div>
            <div className="play-mode-desc">{t('app.playMode.vocabBuilder.description', 'Play games to learn and practice vocabulary')}</div>
          </div>
        </button>

        <button type="button" className="play-mode-card play-mode-card--read" onClick={handleConversation}>
          <div className="play-mode-icon">
            <Icon name="forum" className="text-2xl" filled />
          </div>
          <div className="play-mode-info">
            <StageChip
              label={t('journey.chip.stagesReadConversation', 'Stages 3–4 · Sentences & Conversation')}
              locked={stageById.reading ? !stageById.reading.unlocked : false}
            />
            <div className="play-mode-name">{t('app.playMode.conversation.name', 'Conversation')}</div>
            <div className="play-mode-desc">{t('app.playMode.conversation.description', 'Practice real conversations and read in context')}</div>
          </div>
        </button>

        <button type="button" className="play-mode-card play-mode-card--deep" onClick={handleDeepScript}>
          <div className="play-mode-icon">
            <Icon name="explore" className="text-2xl" filled />
          </div>
          <div className="play-mode-info">
            <StageChip label={t('journey.chip.reinforcement', 'Reinforcement · Every stage')} locked={false} />
            <div className="play-mode-name">{t('app.playMode.deepScript.name', 'Deep Script')}</div>
            <div className="play-mode-desc">{t('app.playMode.deepScript.description', 'Dungeon runs that reinforce letters, words, and sentences')}</div>
          </div>
        </button>
      </div>
    </Modal>
  );
}
