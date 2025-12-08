import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WordRiverSceneView from '../game/wordRiver/WordRiverSceneView.jsx';
import WordRiverFocusOverlay from '../game/wordRiver/WordRiverFocusOverlay.jsx';
import { getDefaultWordRiverScene } from '../game/wordRiver/wordScenes.js';
import { useLocalization } from '../context/LocalizationContext.jsx';
import { classNames } from '../lib/classNames.js';
import WordRiverTutorial from '../game/wordRiver/WordRiverTutorial.jsx';
import { loadState, saveState } from '../lib/storage.js';

function loadTutorialPreference(tutorialSeen) {
  // Always surface the tutorial at least once for new players, regardless of
  // any stored accessibility toggle values.
  if (tutorialSeen === false) {
    return true;
  }

  try {
    const saved = localStorage.getItem('gameSettings');
    if (!saved) return true;
    const settings = JSON.parse(saved);
    if (settings.showLetterRiverTutorial !== undefined) {
      return settings.showLetterRiverTutorial;
    }
    if (settings.showWordRiverTutorial !== undefined) {
      return settings.showWordRiverTutorial;
    }
    return true;
  } catch (err) {
    console.error('Failed to load Letter River tutorial setting', err);
    return true;
  }
}

function loadTutorialSeen() {
  const letterRiverSeen = loadState('letterRiverTutorialSeen', null);
  if (typeof letterRiverSeen === 'boolean') {
    return letterRiverSeen;
  }

  // Always surface the Letter River tutorial at least once, even if an older
  // Word River flag exists from a previous build.
  return false;
}

const SCENE_PHASE = 'sceneView';
const MEANING_PHASE = 'focusMeaning';
const SPELLING_PHASE = 'spelling';
const SUCCESS_PHASE = 'success';

export default function WordRiverView() {
  const navigate = useNavigate();
  const { languagePack, t } = useLocalization();
  const fontClass = languagePack.metadata?.fontClass ?? 'language-font-hebrew';
  const textDirection = languagePack.metadata?.textDirection ?? 'rtl';
  const [scene] = useState(() => getDefaultWordRiverScene());
  const [phase, setPhase] = useState(SCENE_PHASE);
  const [selectedObjectId, setSelectedObjectId] = useState(null);
  const [learnedObjectIds, setLearnedObjectIds] = useState([]);
  const [difficulty] = useState('easy');
  const [tutorialSeen, setTutorialSeen] = useState(() => loadTutorialSeen());
  const [tutorialEnabled, setTutorialEnabled] = useState(() => loadTutorialPreference(tutorialSeen));
  const [showTutorial, setShowTutorial] = useState(() => tutorialEnabled && !tutorialSeen);
  const [tutorialStage, setTutorialStage] = useState('scene');

  const selectedObject = useMemo(() => {
    if (!scene) return null;
    return scene.objects.find((object) => object.id === selectedObjectId) ?? null;
  }, [scene, selectedObjectId]);

  const handleBack = useCallback(() => {
    navigate('/home');
  }, [navigate]);

  const handleSelectObject = useCallback(
    (object) => {
      setSelectedObjectId(object.id);
      setPhase(MEANING_PHASE);
    },
    []
  );

  const handleMeaningComplete = useCallback(() => {
    setPhase(SPELLING_PHASE);
  }, []);

  const handleSpellingComplete = useCallback(() => {
    setPhase(SUCCESS_PHASE);
  }, []);

  const handleSuccessComplete = useCallback(() => {
    if (selectedObjectId) {
      setLearnedObjectIds((prev) => (prev.includes(selectedObjectId) ? prev : [...prev, selectedObjectId]));
    }
    setPhase(SCENE_PHASE);
    setSelectedObjectId(null);
  }, [selectedObjectId]);

  const handleDismissTutorial = useCallback(() => {
    setTutorialSeen(true);
    saveState('letterRiverTutorialSeen', true);
  }, []);

  const handleFirstLetterShown = useCallback(() => {
    setTutorialStage('drag');
  }, []);

  useEffect(() => {
    if (!showTutorial) return;
    if (phase === SCENE_PHASE) {
      setTutorialStage('scene');
      return;
    }
    if (phase === SPELLING_PHASE && tutorialStage === 'scene') {
      setTutorialStage('spelling');
    }
  }, [phase, showTutorial, tutorialStage]);

  useEffect(() => {
    setShowTutorial(tutorialEnabled && !tutorialSeen);
  }, [tutorialEnabled, tutorialSeen]);

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === 'gameSettings') {
        setTutorialEnabled(loadTutorialPreference(tutorialSeen));
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const isOverlayActive = phase !== SCENE_PHASE && selectedObject;

  return (
    <div className="space-y-8 sm:space-y-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2 text-center sm:text-left">
          <h1 className="text-3xl font-bold text-arcade-text-main sm:text-4xl">{t('wordRiver.title')}</h1>
          <p className="text-sm text-arcade-text-soft sm:text-base">{t('wordRiver.subtitle')}</p>
        </div>
        <button
          type="button"
          onClick={handleBack}
          className={classNames(
            'inline-flex items-center justify-center gap-2 rounded-full border-2 border-arcade-panel-border',
            'bg-gradient-to-b from-arcade-panel-light to-arcade-panel-medium px-4 py-2 text-sm font-semibold text-arcade-text-main transition',
            'shadow-arcade-sm hover:shadow-arcade-md hover:border-arcade-accent-orange'
          )}
        >
          ← {t('wordRiver.actions.back')}
        </button>
      </div>

      <div
        className={classNames(
          'relative overflow-hidden rounded-3xl border-2 border-arcade-panel-border',
          'bg-gradient-to-br from-arcade-panel-light via-arcade-panel-medium to-arcade-panel-light',
          'shadow-arcade-lg'
        )}
      >
        <WordRiverSceneView
          scene={scene}
          learnedObjectIds={learnedObjectIds}
          onSelectObject={handleSelectObject}
          disabled={Boolean(isOverlayActive)}
          activeObjectId={selectedObjectId}
        />
        <WordRiverFocusOverlay
          phase={phase}
          object={selectedObject}
          difficulty={difficulty}
          fontClass={fontClass}
          textDirection={textDirection}
          onMeaningComplete={handleMeaningComplete}
          onSpellingComplete={handleSpellingComplete}
          onSuccessComplete={handleSuccessComplete}
          onFirstLetterShown={showTutorial ? handleFirstLetterShown : null}
        />
        <WordRiverTutorial
          visible={showTutorial}
          stage={tutorialStage}
          phase={phase}
          onDismiss={handleDismissTutorial}
        />
      </div>
    </div>
  );
}
