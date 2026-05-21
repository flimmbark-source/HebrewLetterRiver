import { useState, useCallback, useMemo, useRef } from 'react';
import { useLocalization } from '../../context/LocalizationContext.jsx';
import SpotPackWords from './SpotPackWords.jsx';
import PackSceneBuildLine from './PackSceneBuildLine.jsx';
import PackSceneNotAvailable from './PackSceneNotAvailable.jsx';
import PackSceneDevError from './PackSceneDevError.jsx';
import VisualCue from './VisualCue.jsx';
import { resolvePackScene } from '../../data/packScenes/resolver/resolvePackScene.js';
import { markPackSceneComplete } from '../../lib/bridgeBuilderStorage.js';
import Icon from '../Icon.jsx';

const SPEAKER_LABEL_KEYS = {
  server: { key: 'packScene.speaker.server', fallback: 'Server:' },
  friend: { key: 'packScene.speaker.friend', fallback: 'Friend:' },
  player: { key: 'packScene.speaker.player', fallback: 'You:' },
};

function DialogueCue({ line, cueLabel, direction }) {
  if (!line) return null;
  return (
    <div className="rounded-[1.25rem] border border-[#e8cfa0] bg-[#fff8e8] px-4 py-3 shadow-sm">
      {cueLabel && (
        <div className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#7b6b47]">
          {cueLabel}
        </div>
      )}
      <div className="text-xl font-bold leading-snug text-[#183d2e]" dir={direction || 'ltr'}>
        {line.targetText}
      </div>
    </div>
  );
}

function getCueLineForBeat(beat) {
  if (beat.cueLine) return beat.cueLine;
  if (beat.actionType === 'spotPackWords') return beat.activeLine;
  return null;
}

function shuffleArray(items) {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function MeaningChoiceInteraction({ beat, onResult, supportDirection }) {
  const [selectedId, setSelectedId] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const options = useMemo(() => shuffleArray(beat.options || []), [beat]);

  const handleClick = (opt) => {
    if (submitted) return;
    if (selectedId === opt.id) {
      setSubmitted(true);
      setTimeout(() => {
        onResult({
          type: 'meaningChoice',
          isCorrect: opt.isCorrect,
          understoodConceptIds: opt.isCorrect ? (beat.targetConceptIds || []) : [],
        });
      }, 700);
    } else {
      setSelectedId(opt.id);
    }
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-2" dir={supportDirection || 'ltr'}>
      {options.map((opt) => {
        const isSelected = selectedId === opt.id;
        const isCorrectChoice = submitted && opt.isCorrect;
        const isWrongSelected = submitted && isSelected && !opt.isCorrect;

        let cls = 'w-full rounded-2xl border px-3 py-3 text-left font-semibold transition-all duration-200 active:scale-[0.99] ';
        if (!submitted) {
          cls += isSelected
            ? 'border-[#2f6b4c] bg-[#e4f0df] text-[#183d2e] ring-2 ring-[#2f6b4c]/15 shadow-md'
            : 'border-[#d8cdb7] bg-white/72 text-[#253d35] shadow-sm hover:-translate-y-0.5 hover:bg-white hover:shadow-md';
        } else if (isCorrectChoice) {
          cls += 'border-[#2f6b4c] bg-[#e4f0df] text-[#183d2e] ring-2 ring-[#2f6b4c]/15 shadow-md';
        } else if (isWrongSelected) {
          cls += 'border-[#c77912] bg-[#fff0d8] text-[#6d4213] ring-2 ring-[#c77912]/15 shadow-md';
        } else {
          cls += 'border-[#d8cdb7]/70 bg-white/45 text-[#7b8077] opacity-65';
        }

        return (
          <button key={opt.id} type="button" onClick={() => handleClick(opt)} disabled={submitted} className={cls}>
            <div className="flex items-center gap-3">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                  isCorrectChoice
                    ? 'border-[#2f6b4c] bg-[#2f6b4c] text-white'
                    : isWrongSelected
                      ? 'border-[#c77912] bg-[#c77912] text-white'
                      : isSelected
                        ? 'border-[#2f6b4c] bg-[#2f6b4c] text-white'
                        : 'border-[#b8ad97] bg-[#fffaf0] text-transparent'
                }`}
                aria-hidden="true"
              >
                {isCorrectChoice ? '✓' : isWrongSelected ? '×' : isSelected ? '●' : '•'}
              </span>
              <span className="text-base sm:text-lg">{opt.text}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function ChooseReplyInteraction({ beat, onResult, supportDirection }) {
  const { t } = useLocalization();
  const [selectedId, setSelectedId] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const options = useMemo(() => shuffleArray(beat.options || []), [beat]);
  const selectedOption = options.find((opt) => opt.id === selectedId);

  const handleClick = (opt) => {
    if (submitted) return;
    setSelectedId(opt.id);
    setSubmitted(true);
  };

  const handleContinue = () => {
    if (!selectedOption) return;
    onResult({
      type: 'chooseReply',
      isCorrect: selectedOption.isCorrect,
      producedConceptIds: selectedOption.isCorrect ? (beat.targetConceptIds || []) : [],
    });
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-2">
      {options.map((opt) => {
        const isSelected = selectedId === opt.id;
        const isCorrectChoice = submitted && opt.isCorrect;
        const isWrongSelected = submitted && isSelected && !opt.isCorrect;

        let cls = 'w-full rounded-2xl border px-3 py-3 text-left transition-all duration-200 active:scale-[0.99] ';
        if (!submitted) {
          cls += 'border-[#d8cdb7] bg-white/72 shadow-sm hover:-translate-y-0.5 hover:bg-white hover:shadow-md';
        } else if (isCorrectChoice) {
          cls += 'border-[#2f6b4c] bg-[#e4f0df] ring-2 ring-[#2f6b4c]/15 shadow-md';
        } else if (isWrongSelected) {
          cls += 'border-[#c77912] bg-[#fff0d8] ring-2 ring-[#c77912]/15 shadow-md';
        } else {
          cls += 'border-[#d8cdb7]/70 bg-white/45 opacity-55';
        }

        const textColor = isCorrectChoice ? 'text-[#183d2e]' : isWrongSelected ? 'text-[#6d4213]' : 'text-[#183d2e]';
        const subColor = isCorrectChoice ? 'text-[#2f6b4c]' : isWrongSelected ? 'text-[#c07a10]' : 'text-[#4e665b]';

        return (
          <button key={opt.id} type="button" onClick={() => handleClick(opt)} disabled={submitted} className={cls}>
            <div className="flex items-start gap-3">
              <span
                className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                  isCorrectChoice
                    ? 'border-[#2f6b4c] bg-[#2f6b4c] text-white'
                    : isWrongSelected
                      ? 'border-[#c77912] bg-[#c77912] text-white'
                      : isSelected
                        ? 'border-[#2f6b4c] bg-[#2f6b4c] text-white'
                        : 'border-[#b8ad97] bg-[#fffaf0] text-transparent'
                }`}
                aria-hidden="true"
              >
                {isCorrectChoice ? '✓' : isWrongSelected ? '×' : isSelected ? '●' : '•'}
              </span>
              <div className="flex-1 min-w-0">
                <div className={`text-lg font-bold ${textColor}`} dir={opt.direction || 'ltr'}>
                  {opt.targetText}
                </div>
                {submitted && isSelected && opt.supportText && (
                  <div className={`text-sm font-medium ${subColor}`} dir={supportDirection || 'ltr'}>
                    {opt.supportText}
                  </div>
                )}
              </div>
            </div>
          </button>
        );
      })}

      {submitted && selectedOption && (
        <div className={`rounded-2xl border px-3 py-2 text-center text-sm font-semibold ${
          selectedOption.isCorrect
            ? 'border-[#2f6b4c]/30 bg-[#e4f0df] text-[#183d2e]'
            : 'border-[#c77912]/35 bg-[#fff0d8] text-[#6d4213]'
        }`}
        >
          {selectedOption.isCorrect
            ? t('packScene.chooseReply.correctMessage', 'That works in the scene.')
            : t('packScene.chooseReply.wrongMessage', 'That does not fit this moment.')}
        </div>
      )}

      {submitted && selectedOption && (
        <button
          type="button"
          onClick={handleContinue}
          className="w-full rounded-2xl px-5 py-4 text-lg font-bold text-white shadow-lg transition hover:brightness-105 active:scale-[0.99]"
          style={{ background: 'linear-gradient(180deg, #2f6b4c, #1e4d35)', boxShadow: '0 12px 28px rgba(31,77,53,0.28)' }}
        >
          {t('packScene.chooseReply.continue', 'Continue')}
        </button>
      )}
    </div>
  );
}

function PackSceneBrief({ scene, onStart, onExit }) {
  const { t } = useLocalization();
  const { appStrings, blueprint, directionConfig } = scene;
  const conceptDisplayNames = appStrings.shared?.conceptDisplayNames || {};

  return (
    <div className="fixed inset-0 z-30 overflow-hidden bg-[#fbf4e4] text-[#173d2e]">
      <div className="mx-auto flex h-[100dvh] w-full max-w-[430px] flex-col px-5 pb-[calc(var(--bottom-nav-safe-space)+8px)] pt-10 md:max-w-[680px] md:px-8">
        <header className="flex items-center justify-between">
          <button
            type="button"
            onClick={onExit}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/78 text-[#315846] shadow-sm transition hover:bg-white"
            aria-label={t('packScene.brief.back', 'Back')}
          >
            <Icon name="arrow_back" className="text-xl" aria-hidden="true" />
          </button>
          <h1 className="text-lg font-bold text-[#1b352b]" style={{ fontFamily: '"Baloo 2", system-ui, sans-serif' }}>
            {t('packScene.brief.title', 'Practice in Context')}
          </h1>
          <div className="w-9" aria-hidden="true" />
        </header>

        <main className="mt-8 flex flex-1 flex-col gap-5" dir={directionConfig.supportDirection}>
          <section className="rounded-[1.75rem] border border-[#d8cdb7] bg-[#fff9ea]/90 p-5 shadow-sm text-center">
            <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#2a6a44]">
              {t('packScene.brief.sceneLabel', 'Scene')}
            </div>
            <p className="text-sm font-medium text-[#4e665b]">{appStrings.briefDescription}</p>
            {appStrings.goalText && (
              <p className="mt-2 text-sm font-medium text-[#4e665b]">
                <span className="font-bold text-[#2a6a44]">{t('packScene.brief.goalLabel', 'Goal: ')}</span>
                {appStrings.goalText}
              </p>
            )}
          </section>

          <section className="rounded-[1.75rem] border border-[#d8cdb7] bg-white/60 p-4 shadow-sm">
            <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#2a6a44]">
              {t('packScene.brief.youWillPractice', "You'll practice")}
            </div>
            <div className="flex flex-wrap gap-2">
              {(blueprint.packConceptIds || []).map((id) => (
                <span key={id} className="rounded-full border border-[#d8cdb7] bg-[#fff8e8] px-3 py-1 text-sm font-semibold text-[#315846]">
                  {conceptDisplayNames[id] || id}
                </span>
              ))}
            </div>
          </section>

          <div className="mt-auto">
            <button
              type="button"
              onClick={onStart}
              className="w-full rounded-2xl px-5 py-4 text-lg font-bold text-white shadow-lg transition hover:brightness-105 active:scale-[0.99]"
              style={{ background: 'linear-gradient(180deg, #d98818, #b96a10)', boxShadow: '0 12px 28px rgba(175,101,14,0.28)' }}
            >
              {t('packScene.brief.start', 'Begin Scene')}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

function PackSceneRecap({ scene, conceptResults, onFinish }) {
  const { t } = useLocalization();
  const { appStrings, directionConfig, blueprint } = scene;
  const conceptDisplayNames = appStrings.shared?.conceptDisplayNames || {};
  const recapTemplates = appStrings.recapTemplates || {};

  const packConceptIds = blueprint.packConceptIds || [];
  const seen = packConceptIds.filter((id) => conceptResults[id]?.seen);
  const produced = packConceptIds.filter((id) => conceptResults[id]?.produced);
  const display = (id) => conceptDisplayNames[id] || id;

  return (
    <div className="fixed inset-0 z-30 flex flex-col overflow-hidden bg-[#fbf4e4] text-[#173d2e]">
      <div
        className="mx-auto flex w-full max-w-[430px] flex-1 flex-col px-5 pb-[calc(var(--bottom-nav-safe-space)+1rem)] pt-10 md:max-w-[560px]"
        dir={directionConfig.supportDirection}
      >
        <div className="text-center">
          <div className="mb-2 text-5xl" aria-hidden="true">✦</div>
          <h1 className="text-2xl font-bold text-[#183d2e]" style={{ fontFamily: '"Baloo 2", system-ui, sans-serif' }}>
            {t('packScene.recap.title', 'Scene complete!')}
          </h1>
          {recapTemplates.intro && (
            <p className="mt-1 text-sm font-medium text-[#4e665b]">{recapTemplates.intro}</p>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-3">
          {seen.length > 0 && (
            <div className="rounded-[1.5rem] border border-[#d8cdb7] bg-[#fff9ea]/90 p-4 shadow-sm">
              <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#2a6a44]">
                {t('packScene.recap.youRecognised', 'You recognised')}
              </div>
              <div className="flex flex-wrap gap-2">
                {seen.map((id) => (
                  <span key={id} className="rounded-full border border-[#2f6b4c]/30 bg-[#e4f0df] px-3 py-1 text-sm font-semibold text-[#183d2e]">
                    {display(id)}
                  </span>
                ))}
              </div>
            </div>
          )}
          {produced.length > 0 && (
            <div className="rounded-[1.5rem] border border-[#d8cdb7] bg-[#fff9ea]/90 p-4 shadow-sm">
              <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#2a6a44]">
                {recapTemplates.learnedPrefix || t('packScene.recap.youUsed', 'You used')}
              </div>
              <div className="flex flex-wrap gap-2">
                {produced.map((id) => (
                  <span key={id} className="rounded-full border border-[#c77912]/30 bg-[#fff0d8] px-3 py-1 text-sm font-semibold text-[#6d4213]">
                    {display(id)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-auto pt-6">
          <button
            type="button"
            onClick={onFinish}
            className="w-full rounded-2xl px-5 py-4 text-lg font-bold text-white shadow-lg transition hover:brightness-105 active:scale-[0.99]"
            style={{ background: 'linear-gradient(180deg, #2f6b4c, #1e4d35)', boxShadow: '0 12px 28px rgba(31,77,53,0.28)' }}
          >
            {t('packScene.recap.finish', 'Back to Journey')}
          </button>
        </div>
      </div>
    </div>
  );
}

function PackSceneBeatScreen({ scene, beat, onResult, onExit, beatIndex, totalBeats }) {
  const { t } = useLocalization();
  const { appStrings, directionConfig } = scene;
  const [resultReceived, setResultReceived] = useState(false);
  const [buildState, setBuildState] = useState(null);

  const handleResult = useCallback((res) => {
    if (resultReceived) return;
    setResultReceived(true);
    const delay = res.type === 'buildLine' ? 250 : 0;
    setTimeout(() => onResult(res), delay);
  }, [resultReceived, onResult]);

  const handleBuildContinue = useCallback(() => {
    handleResult({
      type: 'buildLine',
      isCorrect: Boolean(buildState?.isCorrect),
      producedConceptIds: buildState?.producedConceptIds || [],
    });
  }, [buildState, handleResult]);

  const progress = ((beatIndex + 1) / totalBeats) * 100;
  const cueLine = getCueLineForBeat(beat);
  const cueSpeaker = cueLine?.speaker;
  const cueLabelEntry = cueSpeaker ? SPEAKER_LABEL_KEYS[cueSpeaker] : null;
  const cueLabel = cueLabelEntry ? t(cueLabelEntry.key, cueLabelEntry.fallback) : null;

  return (
    <div className="fixed inset-0 z-30 flex flex-col overflow-hidden bg-[#fbf4e4] text-[#173d2e]">
      <div className="h-1 w-full shrink-0 bg-[#e8dfc8]" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full bg-[#2f6b4c] transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      <header className="flex shrink-0 items-center justify-between px-5 py-3">
        <button
          type="button"
          onClick={onExit}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/78 text-[#315846] shadow-sm transition hover:bg-white"
          aria-label={t('packScene.scene.exit', 'Exit scene')}
        >
          <Icon name="close" className="text-xl" aria-hidden="true" />
        </button>
        <div className="text-center" dir={directionConfig.supportDirection}>
          <div className="text-sm font-bold text-[#183d2e]" style={{ fontFamily: '"Baloo 2", system-ui, sans-serif' }}>
            {t('packScene.brief.title', 'Practice in Context')}
          </div>
          {appStrings.goalText && (
            <div className="text-[11px] font-medium text-[#4e665b]">{appStrings.goalText}</div>
          )}
        </div>
        <div className="w-9" aria-hidden="true" />
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-4 pb-[calc(var(--bottom-nav-safe-space)+1rem)]">
        <DialogueCue line={cueLine} cueLabel={cueLabel} direction={directionConfig.cueDirection} />
        <VisualCue visualCue={beat.visualCue} />

        {beat.prompt && (
          <p className="mt-4 mb-3 text-center text-sm font-bold text-[#4e665b]" dir={directionConfig.promptDirection}>
            {beat.prompt}
          </p>
        )}

        {beat.actionType === 'spotPackWords' && (
          <SpotPackWords
            beat={beat}
            line={beat.activeLine}
            onResult={handleResult}
            suppressHeader
            direction={directionConfig.tileDirection}
          />
        )}
        {beat.actionType === 'meaningChoice' && (
          <MeaningChoiceInteraction beat={beat} onResult={handleResult} supportDirection={directionConfig.supportDirection} />
        )}
        {beat.actionType === 'buildLine' && (
          <>
            <PackSceneBuildLine beat={beat} direction={directionConfig.answerDirection} onStateChange={setBuildState} />
            {buildState?.submitted && (
              <button
                type="button"
                onClick={handleBuildContinue}
                className="mx-auto mt-3 block w-full max-w-2xl rounded-2xl px-5 py-4 text-lg font-bold text-white shadow-lg transition hover:brightness-105 active:scale-[0.99]"
                style={{ background: 'linear-gradient(180deg, #2f6b4c, #1e4d35)', boxShadow: '0 12px 28px rgba(31,77,53,0.28)' }}
              >
                {t('packScene.buildLine.continue', 'Continue')}
              </button>
            )}
          </>
        )}
        {beat.actionType === 'chooseReply' && (
          <ChooseReplyInteraction beat={beat} onResult={handleResult} supportDirection={directionConfig.supportDirection} />
        )}
      </div>
    </div>
  );
}

export default function PackSceneSession({ packId, onExit }) {
  const { practiceLanguageId, appLanguageId } = useLocalization();
  const [phase, setPhase] = useState('brief');
  const [beatIndex, setBeatIndex] = useState(0);
  const conceptResultsRef = useRef({});

  const resolution = useMemo(
    () => resolvePackScene({
      packId,
      targetLanguageId: practiceLanguageId,
      appLanguageId,
    }),
    [packId, practiceLanguageId, appLanguageId],
  );

  const scene = resolution.status === 'ok' ? resolution.scene : null;
  const beats = scene?.beats || [];

  const handleBeatResult = useCallback((result) => {
    const cr = conceptResultsRef.current;
    if (result.seenConceptIds) result.seenConceptIds.forEach((id) => { cr[id] = { ...cr[id], seen: true }; });
    if (result.understoodConceptIds) result.understoodConceptIds.forEach((id) => { cr[id] = { ...cr[id], understood: true }; });
    if (result.producedConceptIds) result.producedConceptIds.forEach((id) => { cr[id] = { ...cr[id], produced: true }; });

    if (!scene) return;
    const next = beatIndex + 1;
    if (next >= beats.length) {
      markPackSceneComplete(packId, {
        sceneId: `${scene.blueprint.packId}.${scene.blueprint.goalId}`,
        conceptResults: { ...cr },
      });
      setPhase('recap');
    } else {
      setBeatIndex(next);
    }
  }, [scene, beats.length, beatIndex, packId]);

  if (resolution.status !== 'ok') {
    const isInvalidShape =
      resolution.status === 'invalid_blueprint' || resolution.status === 'invalid_resolved_scene';
    if (isInvalidShape && import.meta.env.DEV) {
      return <PackSceneDevError status={resolution} onExit={onExit} />;
    }
    return <PackSceneNotAvailable status={resolution} onExit={onExit} />;
  }

  const currentBeat = beats[beatIndex];

  if (phase === 'brief') {
    return <PackSceneBrief scene={scene} onStart={() => setPhase('beat')} onExit={onExit} />;
  }

  if (phase === 'recap') {
    return <PackSceneRecap scene={scene} conceptResults={conceptResultsRef.current} onFinish={onExit} />;
  }

  if (!currentBeat) return null;

  return (
    <PackSceneBeatScreen
      key={currentBeat.id}
      scene={scene}
      beat={currentBeat}
      beatIndex={beatIndex}
      totalBeats={beats.length}
      onResult={handleBeatResult}
      onExit={onExit}
    />
  );
}
