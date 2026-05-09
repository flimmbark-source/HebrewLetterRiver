// PackScene MVP: food_01 Hebrew only. Do not expand scope until the first slice is
// routed, playable, saved, and visible in Vocab Journey.

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
import riverBackground from '../../assets/Reading/River-Background.png';

// ─── Beat: Meaning Choice ────────────────────────────────────────────────────
// Wraps ListenMeaningChoice with beat-defined options rather than corpus distractors.

function PackMeaningChoice({ beat, line, onResult }) {
  const convLine = packSceneLineToConversationLine(line, beat.lineId);

  // ListenMeaningChoice pulls distractors from distractorLines[].en.
  // We supply the incorrect beat options as minimal line objects.
  const distractorLines = beat.options
    .filter((o) => !o.isCorrect)
    .map((o) => ({ en: o.text, he: '', tl: '' }));

  return (
    <ListenMeaningChoice
      line={convLine}
      distractorLines={distractorLines}
      onResult={(res) =>
        onResult({
          actionType: 'meaningChoice',
          isCorrect: res.isCorrect,
          understoodConceptIds: res.isCorrect ? (beat.targetConceptIds || []) : [],
        })
      }
    />
  );
}

// ─── Beat: Build Line ────────────────────────────────────────────────────────

function PackBuildLine({ beat, line, onResult }) {
  const convLine = packSceneLineToConversationLine(line, beat.lineId);

  return (
    <BuildLine
      line={convLine}
      onResult={(res) =>
        onResult({
          actionType: 'buildLine',
          isCorrect: res.isCorrect,
          producedConceptIds: res.isCorrect ? (beat.targetConceptIds || []) : [],
        })
      }
    />
  );
}

// ─── Beat: Choose Reply ──────────────────────────────────────────────────────
// Simple Pack Scene-specific implementation: English options, Hebrew reveal on correct.

function PackChooseReply({ beat, line, onResult }) {
  const { t } = useLocalization();
  const [selectedId, setSelectedId] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const options = beat.options || [];

  const handleClick = (opt) => {
    if (submitted) return;
    if (selectedId === opt.id) {
      setSubmitted(true);
      onResult({
        actionType: 'chooseReply',
        selectedOptionId: opt.id,
        isCorrect: opt.isCorrect,
        producedConceptIds: opt.isCorrect ? (beat.targetConceptIds || []) : [],
      });
    } else {
      setSelectedId(opt.id);
    }
  };

  const correctOpt = options.find((o) => o.isCorrect);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-3">
      <div className="text-center">
        <h3
          className="text-xl font-bold text-[#183d2e]"
          style={{ fontFamily: '"Baloo 2", system-ui, sans-serif' }}
        >
          {t('packScene.chooseReply.instruction', 'Choose the Reply')}
        </h3>
      </div>

      <div className="rounded-[1.5rem] border border-[#d8cdb7] bg-[#fff8e8]/90 p-4 text-center shadow-sm">
        <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#2f6b4c]">
          {t('packScene.chooseReply.prompt', beat.prompt || 'What should you say next?')}
        </div>
        <div className="text-lg font-bold text-[#183d2e]">
          {line.supportText}
        </div>
      </div>

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
          <div className="mt-1 text-sm italic text-[#2f6b4c]">{line.transliteration}</div>
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

// ─── Brief Screen ────────────────────────────────────────────────────────────

function PackSceneBrief({ definition, onStart, onExit }) {
  const { t } = useLocalization();

  return (
    <div className="fixed inset-0 z-30 overflow-hidden bg-[#fbf4e4] text-[#173d2e]">
      <div className="relative mx-auto flex h-[100dvh] w-full max-w-[430px] flex-col overflow-hidden px-5 pb-[calc(var(--bottom-nav-safe-space)+8px)] pt-10 md:max-w-[680px] md:px-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-36 overflow-hidden" aria-hidden="true">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-80"
            style={{ backgroundImage: `url(${riverBackground})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#fbf4e4]/0 via-[#fbf4e4]/50 to-[#fbf4e4]" />
        </div>

        <header className="relative z-10 flex items-center justify-between">
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

        <main className="relative z-10 mt-8 flex flex-1 flex-col gap-5">
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
            <p className="mt-2 text-sm font-medium text-[#4e665b]">
              {t('packScene.brief.description', 'You are ordering something small at a café. Spot the pack words, understand the exchange, and practice your reply.')}
            </p>
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

// ─── Beat Screen ─────────────────────────────────────────────────────────────

function PackSceneBeatScreen({ beat, line, onResult, onExit, beatIndex, totalBeats }) {
  const { t } = useLocalization();
  const [resultReceived, setResultReceived] = useState(false);

  const handleResult = useCallback((res) => {
    if (resultReceived) return;
    setResultReceived(true);
    // For beats that already show a final state (spotPackWords has its own Continue button),
    // advance immediately. For other beats, pause briefly so the user sees the result.
    const delay = beat.actionType === 'spotPackWords' ? 0 : 900;
    setTimeout(() => onResult(res), delay);
  }, [resultReceived, onResult, beat.actionType]);

  const progress = ((beatIndex + 1) / totalBeats) * 100;

  return (
    <div className="fixed inset-0 z-30 flex flex-col overflow-hidden bg-[#fbf4e4] text-[#173d2e]">
      {/* Progress bar */}
      <div className="h-1 w-full bg-[#e8dfc8]" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
        <div
          className="h-full bg-[#2f6b4c] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <header className="flex items-center justify-between px-5 py-3">
        <button
          type="button"
          onClick={onExit}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/78 text-[#315846] shadow-sm transition hover:bg-white"
          aria-label={t('packScene.beat.exit', 'Exit scene')}
        >
          <span className="material-symbols-outlined text-xl" aria-hidden="true">close</span>
        </button>
        <span className="text-xs font-bold text-[#4e665b]">
          {beatIndex + 1} / {totalBeats}
        </span>
        <div className="w-9" aria-hidden="true" />
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-3 pb-[calc(var(--bottom-nav-safe-space)+1rem)]">
        {beat.actionType === 'spotPackWords' && (
          <SpotPackWords beat={beat} line={line} onResult={handleResult} />
        )}
        {beat.actionType === 'meaningChoice' && (
          <PackMeaningChoice beat={beat} line={line} onResult={handleResult} />
        )}
        {beat.actionType === 'buildLine' && (
          <PackBuildLine beat={beat} line={line} onResult={handleResult} />
        )}
        {beat.actionType === 'chooseReply' && (
          <PackChooseReply beat={beat} line={line} onResult={handleResult} />
        )}
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
          <p className="mt-1 text-sm font-medium text-[#4e665b]">
            {definition.title}
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          {seen.length > 0 && (
            <div className="rounded-[1.5rem] border border-[#d8cdb7] bg-[#fff9ea]/90 p-4 shadow-sm">
              <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#2a6a44]">
                {t('packScene.recap.youRecognised', 'You recognised')}
              </div>
              <div className="flex flex-wrap gap-2">
                {seen.map((id) => (
                  <span
                    key={id}
                    className="rounded-full border border-[#2f6b4c]/30 bg-[#e4f0df] px-3 py-1 text-sm font-semibold text-[#183d2e]"
                  >
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
                  <span
                    key={id}
                    className="rounded-full border border-[#c77912]/30 bg-[#fff0d8] px-3 py-1 text-sm font-semibold text-[#6d4213]"
                  >
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

// ─── Session Orchestrator ────────────────────────────────────────────────────

export default function PackSceneSession({ packId, practiceLanguageId, onExit }) {
  const [phase, setPhase] = useState('brief'); // 'brief' | 'beat' | 'recap'
  const [beatIndex, setBeatIndex] = useState(0);
  const conceptResultsRef = useRef({});
  const [, forceUpdate] = useState(0);

  const packScene = useMemo(
    () => getPackSceneForPack(packId, practiceLanguageId),
    [packId, practiceLanguageId],
  );

  const handleBeatResult = useCallback((result) => {
    const cr = conceptResultsRef.current;

    if (result.seenConceptIds) {
      result.seenConceptIds.forEach((id) => {
        cr[id] = { ...cr[id], seen: true };
      });
    }
    if (result.understoodConceptIds) {
      result.understoodConceptIds.forEach((id) => {
        cr[id] = { ...cr[id], understood: true };
      });
    }
    if (result.producedConceptIds) {
      result.producedConceptIds.forEach((id) => {
        cr[id] = { ...cr[id], produced: true };
      });
    }

    forceUpdate((n) => n + 1);

    setBeatIndex((prev) => {
      const next = prev + 1;
      if (!packScene || next >= packScene.resolvedBeats.length) {
        markPackSceneComplete(packId, {
          sceneId: packScene?.definition.id,
          conceptResults: { ...cr },
        });
        setPhase('recap');
        return prev;
      }
      return next;
    });
  }, [packId, packScene]);

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

  const { definition, resolvedBeats } = packScene;
  const currentBeat = resolvedBeats[beatIndex];

  if (phase === 'brief') {
    return (
      <PackSceneBrief
        definition={definition}
        onStart={() => setPhase('beat')}
        onExit={onExit}
      />
    );
  }

  if (phase === 'recap') {
    return (
      <PackSceneRecap
        definition={definition}
        conceptResults={conceptResultsRef.current}
        onFinish={onExit}
      />
    );
  }

  if (!currentBeat) return null;

  return (
    <PackSceneBeatScreen
      key={currentBeat.id}
      beat={currentBeat}
      line={currentBeat.line}
      beatIndex={beatIndex}
      totalBeats={resolvedBeats.length}
      onResult={handleBeatResult}
      onExit={onExit}
    />
  );
}
