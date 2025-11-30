import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WordRiverSceneView from '../game/wordRiver/WordRiverSceneView.jsx';
import WordRiverFocusOverlay from '../game/wordRiver/WordRiverFocusOverlay.jsx';
import { getDefaultWordRiverScene } from '../game/wordRiver/wordScenes.js';
import { useLocalization } from '../context/LocalizationContext.jsx';
import { classNames } from '../lib/classNames.js';

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
        />
      </div>
    </div>
  );
}
