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
          <h1 className="text-3xl font-bold text-white sm:text-4xl">{t('wordRiver.title')}</h1>
          <p className="text-sm text-slate-300 sm:text-base">{t('wordRiver.subtitle')}</p>
        </div>
        <button
          type="button"
          onClick={handleBack}
          className={classNames(
            'inline-flex items-center justify-center gap-2 rounded-full border border-slate-700',
            'bg-slate-900/70 px-4 py-2 text-sm font-semibold text-slate-200 transition',
            'hover:border-cyan-400 hover:text-white'
          )}
        >
          ← {t('wordRiver.actions.back')}
        </button>
      </div>

      <div
        className={classNames(
          'relative overflow-hidden rounded-3xl border border-cyan-500/20',
          'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 shadow-2xl'
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
