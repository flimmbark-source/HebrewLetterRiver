import { useState, useCallback, useMemo, useRef } from 'react';
import { useLocalization } from '../../context/LocalizationContext.jsx';
import SpotPackWords from './SpotPackWords.jsx';
import ListenMeaningChoice from '../conversation/modules/ListenMeaningChoice.jsx';
import BuildLine from '../conversation/modules/BuildLine.jsx';
import {
  getPackSceneForPack,
  packSceneLineToConversationLine,
} from '../../data/packScenes/packSceneAdapter.js';
import { markPackSceneComplete } from '../../lib/bridgeBuilderStorage.js';

// ─── Interaction: Meaning Choice ─────────────────────────────────────────────

function MeaningChoiceInteraction({ interaction, line, onResult }) {
  const convLine = packSceneLineToConversationLine(line, 'pack-meaning');
  const distractorLines = (interaction.options || [])
    .filter((o) => !o.isCorrect)
    .map((o) => ({ en: o.text, he: '', tl: '' }));

  return (
    <ListenMeaningChoice
      line={convLine}
      distractorLines={distractorLines}
      onResult={(res) =>
        onResult({
          type: 'meaningChoice',
          isCorrect: res.isCorrect,
          understoodConceptIds: res.isCorrect ? (interaction.targetConceptIds || []) : [],
        })
      }
    />
  );
}

// ─── Interaction: Build Line ──────────────────────────────────────────────────

function BuildLineInteraction({ interaction, line, onResult }) {
  const convLine = packSceneLineToConversationLine(line, 'pack-build');

  return (
    <BuildLine
      line={convLine}
      onResult={(res) =>
        onResult({
          type: 'buildLine',
          isCorrect: res.isCorrect,
          producedConceptIds: res.isCorrect ? (interaction.targetConceptIds || []) : [],
        })
      }
    />
  );
}

// ─── Interaction: Choose Reply ────────────────────────────────────────────────

function ChooseReplyInteraction({ interaction, line, onResult }) {
  const { t } = useLocalization();
  const [selectedId, setSelectedId] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const options = interaction.options || [];

  const handleClick = (opt) => {
    if (submitted) return;
    if (selectedId === opt.id) {
      setSubmitted(true);
      setTimeout(() => {
        onResult({
          type: 'chooseReply',
          selectedOptionId: opt.id,
          isCorrect: opt.isCorrect,
          producedConceptIds: opt.isCorrect ? (interaction.targetConceptIds || []) : [],
        });
      }, 900);
    } else {
      setSelectedId(opt.id);
    }
  };

  const correctOpt = options.find((o) => o.isCorrect);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-3">
      <div className="flex flex-col gap-2">
        {options.map((opt) => {
          const isSelected = selectedId === opt.id;
          const isCorrectChoice = submitted && opt.isCorrect;
          const isWrongSelected = submitted && isSelected && !opt.isCorrect;

          let cls =
            'w-full rounded-2xl border px-3 py-3 text-left font-semibold transition-all duration-200 active:scale-[0.99] ';
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
            <button
              key={opt.id}
              type="button"
              onClick={() => handleClick(opt)}
              disabled={submitted}
              className={cls}
            >
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

      {submitted && correctOpt && (
        <div className="rounded-[1.35rem] border border-[#2f6b4c]/30 bg-[#e4f0df] p-4 text-center">
          <div className="text-2xl font-bold text-[#183d2e]" dir="rtl">
            {line.targetText}
          </div>
          {line.transliteration && (
            <div className="mt-1 text-sm italic text-[#2f6b4c]">{line.transliteration}</div>
          )}
        </div>
      )}

      {!submitted && selectedId && (
        <div className="rounded-2xl border border-[#d8cdb7] bg-[#fff8e8]/70 px-3 py-2 text-center text-xs font-semibold text-[#4e665b]">
          {t('packScene.chooseReply.submitHint', 'Tap the selected answer again to submit')}
        </div>
      )}
    </div>
  );
}

// ─── Dialogue Bubble ─────────────────────────────────────────────────────────

function DialogueBubble({ moment, line, isActive }) {
  const isOther = moment.speaker === 'other';
  const showPlaceholder = isActive && !isOther;

  return (
    <div className={`flex flex-col gap-0.5 ${isOther ? 'items-start' : 'items-end'}`}>
      <div
        className={`text-[10px] font-bold uppercase tracking-[0.12em] transition-opacity ${
          isOther ? 'pl-1 text-[#7b6b47]' : 'pr-1 text-[#4e665b]'
        } ${!isActive ? 'opacity-50' : ''}`}
      >
        {moment.speakerLabel}
      </div>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 transition-opacity ${
          isOther
            ? `bg-[#fff0d8] border border-[#e8cfa0] ${!isActive ? 'opacity-50' : ''}`
            : `bg-[#e4f0df] border border-[#b8d9c4] ${!isActive ? 'opacity-50' : ''}`
        }`}
      >
        {showPlaceholder ? (
          <span className="text-xl tracking-widest text-[#8aaa90]" aria-label="Composing reply">
            · · ·
          </span>
        ) : (
          <>
            <div className="text-xl font-bold text-[#183d2e]" dir="rtl">
              {line.targetText}
            </div>
            {line.transliteration && (
              <div className="mt-0.5 text-xs italic text-[#4e665b]">{line.transliteration}</div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Brief Screen ─────────────────────────────────────────────────────────────

function PackSceneBrief({ definition, onStart, onExit }) {
  const { t } = useLocalization();

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
            <span className="material-symbols-outlined text-xl" aria-hidden="true">arrow_back</span>
          </button>
          <h1
            className="text-lg font-bold text-[#1b352b]"
            style={{ fontFamily: '"Baloo 2", system-ui, sans-serif' }}
          >
            {t('packScene.brief.title', 'Practice in Context')}
          </h1>
          <div className="w-9" aria-hidden="true" />
        </header>

        <main className="mt-8 flex flex-1 flex-col gap-5">
          <section className="rounded-[1.75rem] border border-[#d8cdb7] bg-[#fff9ea]/90 p-5 shadow-sm text-center">
            <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#2a6a44]">
              {t('packScene.brief.sceneLabel', 'Scene')}
            </div>
            <h2
              className="text-2xl font-bold text-[#183d2e]"
              style={{ fontFamily: '"Baloo 2", system-ui, sans-serif' }}
            >
              {definition.title}
            </h2>
            {definition.goal && (
              <p className="mt-2 text-sm font-medium text-[#4e665b]">
                <span className="font-bold text-[#2a6a44]">{t('packScene.brief.goalLabel', 'Goal: ')}</span>
                {definition.goal}
              </p>
            )}
          </section>

          <section className="rounded-[1.75rem] border border-[#d8cdb7] bg-white/60 p-4 shadow-sm">
            <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#2a6a44]">
              {t('packScene.brief.youWillPractice', "You'll practice")}
            </div>
            <div className="flex flex-wrap gap-2">
              {definition.targetConceptIds.map((id) => (
                <span
                  key={id}
                  className="rounded-full border border-[#d8cdb7] bg-[#fff8e8] px-3 py-1 text-sm font-semibold text-[#315846]"
                >
                  {id}
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

// ─── Recap Screen ─────────────────────────────────────────────────────────────

function PackSceneRecap({ definition, conceptResults, onFinish }) {
  const { t } = useLocalization();
  const seen = Object.keys(conceptResults).filter((id) => conceptResults[id]?.seen);
  const produced = Object.keys(conceptResults).filter((id) => conceptResults[id]?.produced);

  return (
    <div className="fixed inset-0 z-30 flex flex-col overflow-hidden bg-[#fbf4e4] text-[#173d2e]">
      <div className="mx-auto flex w-full max-w-[430px] flex-1 flex-col px-5 pb-[calc(var(--bottom-nav-safe-space)+1rem)] pt-10 md:max-w-[560px]">
        <div className="text-center">
          <div className="mb-2 text-5xl" aria-hidden="true">✦</div>
          <h1
            className="text-2xl font-bold text-[#183d2e]"
            style={{ fontFamily: '"Baloo 2", system-ui, sans-serif' }}
          >
            {t('packScene.recap.title', 'Scene complete!')}
          </h1>
          <p className="mt-1 text-sm font-medium text-[#4e665b]">{definition.title}</p>
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
                    {id}
                  </span>
                ))}
              </div>
            </div>
          )}

          {produced.length > 0 && (
            <div className="rounded-[1.5rem] border border-[#d8cdb7] bg-[#fff9ea]/90 p-4 shadow-sm">
              <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#2a6a44]">
                {t('packScene.recap.youUsed', 'You used')}
              </div>
              <div className="flex flex-wrap gap-2">
                {produced.map((id) => (
                  <span key={id} className="rounded-full border border-[#c77912]/30 bg-[#fff0d8] px-3 py-1 text-sm font-semibold text-[#6d4213]">
                    {id}
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

// ─── Scene Screen ─────────────────────────────────────────────────────────────

function PackSceneScreen({
  resolvedMoments,
  momentIndex,
  interactionIndex,
  onInteractionResult,
  onExit,
  definition,
  totalInteractions,
  completedInteractions,
}) {
  const { t } = useLocalization();
  const currentMoment = resolvedMoments[momentIndex];
  const currentInteraction = currentMoment?.interactions[interactionIndex];

  const progress = totalInteractions > 0 ? (completedInteractions / totalInteractions) * 100 : 0;

  return (
    <div className="fixed inset-0 z-30 flex flex-col overflow-hidden bg-[#fbf4e4] text-[#173d2e]">
      {/* Progress bar */}
      <div
        className="h-1 w-full shrink-0 bg-[#e8dfc8]"
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full bg-[#2f6b4c] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Header */}
      <header className="flex shrink-0 items-center justify-between px-5 py-3">
        <button
          type="button"
          onClick={onExit}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/78 text-[#315846] shadow-sm transition hover:bg-white"
          aria-label={t('packScene.scene.exit', 'Exit scene')}
        >
          <span className="material-symbols-outlined text-xl" aria-hidden="true">close</span>
        </button>
        <div className="text-center">
          <div
            className="text-sm font-bold text-[#183d2e]"
            style={{ fontFamily: '"Baloo 2", system-ui, sans-serif' }}
          >
            {definition.title}
          </div>
          {definition.goal && (
            <div className="text-[11px] font-medium text-[#4e665b]">{definition.goal}</div>
          )}
        </div>
        <div className="w-9" aria-hidden="true" />
      </header>

      {/* Current moment bubble */}
      <div className="shrink-0 px-5 py-3">
        {currentMoment && (
          <DialogueBubble
            moment={currentMoment}
            line={currentMoment.line}
            isActive
          />
        )}
      </div>

      {/* Divider */}
      <div className="shrink-0 border-t border-[#d8cdb7]" />

      {/* Task area */}
      <div className="flex-1 overflow-y-auto px-5 py-4 pb-[calc(var(--bottom-nav-safe-space)+1rem)]">
        {currentInteraction && (
          <>
            {currentInteraction.prompt && (
              <p className="mb-4 text-center text-sm font-bold text-[#4e665b]">
                {currentInteraction.prompt}
              </p>
            )}

            {currentInteraction.type === 'spotPackWords' && (
              <SpotPackWords
                key={`${currentMoment.id}-spot-${interactionIndex}`}
                beat={currentInteraction}
                line={currentMoment.line}
                onResult={onInteractionResult}
              />
            )}
            {currentInteraction.type === 'meaningChoice' && (
              <MeaningChoiceInteraction
                key={`${currentMoment.id}-meaning-${interactionIndex}`}
                interaction={currentInteraction}
                line={currentMoment.line}
                onResult={onInteractionResult}
              />
            )}
            {currentInteraction.type === 'buildLine' && (
              <BuildLineInteraction
                key={`${currentMoment.id}-build-${interactionIndex}`}
                interaction={currentInteraction}
                line={currentMoment.line}
                onResult={onInteractionResult}
              />
            )}
            {currentInteraction.type === 'chooseReply' && (
              <ChooseReplyInteraction
                key={`${currentMoment.id}-reply-${interactionIndex}`}
                interaction={currentInteraction}
                line={currentMoment.line}
                onResult={onInteractionResult}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Session Orchestrator ─────────────────────────────────────────────────────

export default function PackSceneSession({ packId, practiceLanguageId, onExit }) {
  const [phase, setPhase] = useState('brief'); // 'brief' | 'scene' | 'recap'
  const [momentIndex, setMomentIndex] = useState(0);
  const [interactionIndex, setInteractionIndex] = useState(0);
  const [completedMomentIds, setCompletedMomentIds] = useState([]);
  const conceptResultsRef = useRef({});

  const packScene = useMemo(
    () => getPackSceneForPack(packId, practiceLanguageId),
    [packId, practiceLanguageId],
  );

  const totalInteractions = useMemo(() => {
    if (!packScene) return 0;
    return packScene.resolvedMoments.reduce((sum, m) => sum + m.interactions.length, 0);
  }, [packScene]);

  const completedInteractions = useMemo(() => {
    if (!packScene) return 0;
    let count = 0;
    packScene.resolvedMoments.forEach((m, mIdx) => {
      if (completedMomentIds.includes(m.id)) {
        count += m.interactions.length;
      } else if (mIdx === momentIndex) {
        count += interactionIndex;
      }
    });
    return count;
  }, [packScene, completedMomentIds, momentIndex, interactionIndex]);

  const handleInteractionResult = useCallback((result) => {
    const cr = conceptResultsRef.current;
    if (result.seenConceptIds) result.seenConceptIds.forEach((id) => { cr[id] = { ...cr[id], seen: true }; });
    if (result.understoodConceptIds) result.understoodConceptIds.forEach((id) => { cr[id] = { ...cr[id], understood: true }; });
    if (result.producedConceptIds) result.producedConceptIds.forEach((id) => { cr[id] = { ...cr[id], produced: true }; });

    if (!packScene) return;
    const { resolvedMoments } = packScene;
    const currentMoment = resolvedMoments[momentIndex];
    if (!currentMoment) return;

    // meaningChoice and buildLine need a brief pause so the result state is visible
    const resultType = result.type || result.actionType;
    const delay = (resultType === 'meaningChoice' || resultType === 'buildLine') ? 900 : 0;

    setTimeout(() => {
      const nextInteractionIdx = interactionIndex + 1;

      if (nextInteractionIdx < currentMoment.interactions.length) {
        setInteractionIndex(nextInteractionIdx);
        return;
      }

      // Moment complete — advance
      const updatedCompleted = [...completedMomentIds, currentMoment.id];
      setCompletedMomentIds(updatedCompleted);

      const nextMomentIdx = momentIndex + 1;
      if (nextMomentIdx >= resolvedMoments.length) {
        markPackSceneComplete(packId, {
          sceneId: packScene.definition.id,
          conceptResults: { ...cr },
        });
        setPhase('recap');
      } else {
        setMomentIndex(nextMomentIdx);
        setInteractionIndex(0);
      }
    }, delay);
  }, [packScene, momentIndex, interactionIndex, completedMomentIds, packId]);

  if (!packScene) {
    return (
      <div className="fixed inset-0 z-30 flex items-center justify-center bg-[#fbf4e4] px-5 text-center">
        <div>
          <p className="text-lg font-bold text-[#183d2e]">No scene available for this pack yet.</p>
          <button type="button" onClick={onExit} className="mt-4 text-sm font-bold text-[#2f6b4c] underline">
            Go back
          </button>
        </div>
      </div>
    );
  }

  const { definition, resolvedMoments } = packScene;

  if (phase === 'brief') {
    return <PackSceneBrief definition={definition} onStart={() => setPhase('scene')} onExit={onExit} />;
  }

  if (phase === 'recap') {
    return <PackSceneRecap definition={definition} conceptResults={conceptResultsRef.current} onFinish={onExit} />;
  }

  return (
    <PackSceneScreen
      resolvedMoments={resolvedMoments}
      momentIndex={momentIndex}
      interactionIndex={interactionIndex}
      onInteractionResult={handleInteractionResult}
      onExit={onExit}
      definition={definition}
      totalInteractions={totalInteractions}
      completedInteractions={completedInteractions}
    />
  );
}
