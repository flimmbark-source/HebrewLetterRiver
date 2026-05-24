import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocalization } from '../../context/LocalizationContext.jsx';
import ListenMeaningChoice from './modules/ListenMeaningChoice.jsx';
import ShadowRepeat from './modules/ShadowRepeat.jsx';
import SpeechLineRecognition from './modules/SpeechLineRecognition.jsx';
import GuidedReplyChoice from './modules/GuidedReplyChoice.jsx';
import TypeInput from './modules/TypeInput.jsx';
import BuildLine from './modules/BuildLine.jsx';
import SentenceIntroPopup from '../SentenceIntroPopup.jsx';
import Icon from '../Icon.jsx';
import { useConversationIntro } from '../../hooks/useConversationIntro.js';
import riverBackground from '../../assets/Reading/River-Background.png';

export default function ConversationBeatScreen({
  scenario,
  beat,
  beatIndex,
  totalBeats,
  attemptHistory,
  onBeatComplete,
  onExit
}) {
  const { t } = useLocalization();
  const [showNextBanner, setShowNextBanner] = useState(false);
  const [showFeedbackBanner, setShowFeedbackBanner] = useState(false);
  const [pendingResult, setPendingResult] = useState(null);
  const mainContentRef = useRef(null);

  useEffect(() => {
    document.body.classList.add('in-conversation-practice');
    return () => document.body.classList.remove('in-conversation-practice');
  }, []);

  useEffect(() => {
    requestAnimationFrame(() => {
      mainContentRef.current?.scrollTo({ top: 0, behavior: 'auto' });
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    });
  }, [beatIndex]);

  const currentLine = useMemo(() => {
    return scenario.lines.find((line) => line.id === beat.lineId);
  }, [scenario.lines, beat.lineId]);

  const distractorLines = useMemo(() => {
    return scenario.lines.filter((line) => line.id !== beat.lineId);
  }, [scenario.lines, beat.lineId]);

  const sentenceIntro = useConversationIntro({
    line: currentLine,
    enabled: true
  });

  const handleModuleResult = useCallback((result) => {
    setPendingResult({
      beat,
      ...result,
      timestamp: new Date().toISOString()
    });
    setShowFeedbackBanner(true);
    setShowNextBanner(true);
  }, [beat]);

  const handleNext = useCallback(() => {
    if (!pendingResult) return;
    onBeatComplete(pendingResult);
    setShowNextBanner(false);
    setShowFeedbackBanner(false);
    setPendingResult(null);
  }, [pendingResult, onBeatComplete]);

  const renderModule = useCallback(() => {
    if (!currentLine) {
      return <div className="py-12 text-center text-[#5f6f66]">{t('conversation.beat.errorNoLine', 'Line not found')}</div>;
    }

    if (beat.moduleId === 'listenMeaningChoice') {
      return <ListenMeaningChoice line={currentLine} distractorLines={distractorLines} onResult={handleModuleResult} />;
    }
    if (beat.moduleId === 'buildLine') {
      return <BuildLine line={currentLine} onResult={handleModuleResult} />;
    }
    if (beat.moduleId === 'shadowRepeat') {
      return <ShadowRepeat line={currentLine} onResult={handleModuleResult} />;
    }
    if (beat.moduleId === 'speechLineRecognition') {
      return <SpeechLineRecognition line={currentLine} onResult={handleModuleResult} />;
    }
    if (beat.moduleId === 'guidedReplyChoice') {
      return <GuidedReplyChoice line={currentLine} distractorLines={distractorLines} onResult={handleModuleResult} />;
    }
    if (beat.moduleId === 'typeInput') {
      return <TypeInput line={currentLine} onResult={handleModuleResult} />;
    }

    return <div className="py-12 text-center text-[#5f6f66]">{t('conversation.beat.errorUnknownModule', 'Unknown module type')}</div>;
  }, [currentLine, beat.moduleId, distractorLines, handleModuleResult, t]);

  const progressPercent = totalBeats > 0 ? ((beatIndex + 1) / totalBeats) * 100 : 0;
  const routeTitle = t(scenario.metadata.titleKey, scenario.metadata.theme);

  return (
    <div className="relative flex h-[100dvh] flex-col overflow-hidden bg-[#fbf4e4] text-[#173d2e]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-36 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 bg-cover bg-center opacity-55" style={{ backgroundImage: `url(${riverBackground})` }} />
        <div className="absolute inset-0 bg-gradient-to-b from-[#fbf4e4]/5 via-[#fbf4e4]/74 to-[#fbf4e4]" />
      </div>

      <header className="relative z-10 border-b border-[#d8cdb7]/70 bg-[#fff8e8]/80 backdrop-blur-sm">
        <div className="mx-auto w-full max-w-[768px] px-4 py-3">
          <div className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-3">
            <button
              onClick={onExit}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-[#315846] shadow-sm transition hover:bg-white"
              aria-label={t('conversation.beat.exit', 'Exit')}
            >
              <Icon name="arrow_back" className="text-xl" aria-hidden="true" />
            </button>

            <div className="min-w-0 text-center">
              <div className="truncate text-base font-bold text-[#183d2e] sm:text-lg" style={{ fontFamily: '"Baloo 2", system-ui, sans-serif' }}>
                {routeTitle}
              </div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5f715f]">
                {t('conversation.beat.progress', 'Beat {{current}} of {{total}}', {
                  current: beatIndex + 1,
                  total: totalBeats
                })}
              </div>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d8cdb7] bg-white/80 text-[#315846] shadow-sm">
              <Icon name={beat.moduleId === 'speechLineRecognition' ? 'mic' : 'menu_book'} className="text-lg" aria-hidden="true" />
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#2f6b4c]" aria-hidden="true" />
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#d8cdb7]/80">
              <div className="h-full rounded-full bg-gradient-to-r from-[#2f6b4c] to-[#9ab36a] transition-all duration-500 ease-out" style={{ width: `${progressPercent}%` }} />
            </div>
            <span className="h-2 w-2 rounded-full bg-[#a6a06f]" aria-hidden="true" />
          </div>
        </div>
      </header>

      <main ref={mainContentRef} className="relative z-10 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[768px] px-4 py-4 pb-28">
          <section className="rounded-[1.75rem] border border-[#d8cdb7] bg-[#fffaf0]/92 p-3 shadow-lg sm:p-4">
            {renderModule()}
          </section>
        </div>
      </main>

      <div
        className={`fixed left-1/2 top-3 z-40 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-[1.35rem] border bg-[#fff8e8] shadow-2xl transition-all duration-300 ease-out ${
          showFeedbackBanner ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-8 opacity-0'
        } ${pendingResult?.isCorrect ? 'border-[#2f6b4c]/35' : 'border-[#c77912]/45'}`}
      >
        <div className="px-4 py-3">
          <div className="flex items-center justify-center gap-3">
            <span className="text-2xl" aria-hidden="true">{pendingResult?.isCorrect ? '✓' : '↻'}</span>
            <div className="text-center">
              <div className={`text-lg font-bold ${pendingResult?.isCorrect ? 'text-[#2f6b4c]' : 'text-[#a06413]'}`}>
                {pendingResult?.isCorrect
                  ? t('conversation.beat.correct', 'Correct!')
                  : pendingResult?.resultType === 'partial'
                    ? t('conversation.beat.almostThere', 'Almost there!')
                    : t('conversation.beat.keepGoing', 'Keep practicing!')}
              </div>
              {pendingResult?.userResponse && (
                <div className="text-xs font-semibold text-[#4e665b]">{pendingResult.userResponse}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div
        className={`fixed bottom-0 left-1/2 z-30 w-full max-w-[768px] -translate-x-1/2 border-t border-[#d8cdb7] bg-[#fff8e8]/96 shadow-2xl backdrop-blur-sm transition-all duration-300 ease-out ${
          showNextBanner ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-full opacity-0'
        }`}
      >
        <div className="px-4 py-3 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)]">
          <button
            onClick={handleNext}
            className="flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-3 text-lg font-bold text-white shadow-lg transition hover:brightness-105 active:scale-[0.99]"
            style={{ background: 'linear-gradient(180deg, #d98818, #b96a10)', boxShadow: '0 12px 28px rgba(175, 101, 14, 0.28)' }}
          >
            {t('conversation.beat.next', 'Continue')}
            <Icon name="east" className="text-xl" aria-hidden="true" />
          </button>
        </div>
      </div>

      {sentenceIntro.showPopup && <SentenceIntroPopup {...sentenceIntro.popupProps} />}
    </div>
  );
}
