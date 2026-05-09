import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useLocalization } from '../../context/LocalizationContext.jsx';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { getLanguageName } from '../../lib/vocabLanguageAdapter.js';
import ListenMeaningChoice from './modules/ListenMeaningChoice.jsx';
import ShadowRepeat from './modules/ShadowRepeat.jsx';
import GuidedReplyChoice from './modules/GuidedReplyChoice.jsx';
import TypeInput from './modules/TypeInput.jsx';
import BuildLine from './modules/BuildLine.jsx';
import { findDictionaryEntryForWord } from '../../lib/sentenceDictionaryLookup.ts';
import { sentenceTransliterationLookup, sentenceMeaningsLookup } from '../../data/conversation/scenarioFactory.ts';
import SentenceIntroPopup from '../SentenceIntroPopup.jsx';
import { useConversationIntro } from '../../hooks/useConversationIntro.js';
import riverBackground from '../../assets/Reading/River-Background.png';

function getBeatTaskLabel(moduleId, t) {
  switch (moduleId) {
    case 'listenMeaningChoice':
      return t('conversation.beat.task.readAndMatch', 'Read and Match');
    case 'buildLine':
      return t('conversation.beat.task.buildLine', 'Build the Line');
    case 'shadowRepeat':
      return t('conversation.beat.task.listenRepeat', 'Listen and Repeat');
    case 'guidedReplyChoice':
      return t('conversation.beat.task.chooseReply', 'Choose the Reply');
    case 'typeInput':
      return t('conversation.beat.task.typeLine', 'Type the Line');
    default:
      return t('conversation.beat.task.practiceLine', 'Practice the Line');
  }
}

function getBeatTaskHint(moduleId, t) {
  switch (moduleId) {
    case 'listenMeaningChoice':
      return t('conversation.beat.hint.readAndMatch', 'Read the full line, then choose what it means.');
    case 'buildLine':
      return t('conversation.beat.hint.buildLine', 'Tap the word chips in the right order.');
    case 'shadowRepeat':
      return t('conversation.beat.hint.listenRepeat', 'Listen closely, then read the line aloud.');
    case 'guidedReplyChoice':
      return t('conversation.beat.hint.chooseReply', 'Use the conversation context to pick your response.');
    case 'typeInput':
      return t('conversation.beat.hint.typeLine', 'Produce the line from memory as best you can.');
    default:
      return t('conversation.beat.hint.practiceLine', 'Use what you know to complete this step.');
  }
}

/**
 * ConversationBeatScreen
 *
 * Displays a single beat (line + module) with:
 * - Route-themed header and progress
 * - Existing module panel
 * - Optional transcript and dictionary support
 * - Feedback and next-step banners
 */
export default function ConversationBeatScreen({
  scenario,
  beat,
  beatIndex,
  totalBeats,
  attemptHistory,
  onBeatComplete,
  onSavePhrase,
  onExit
}) {
  const { t } = useLocalization();
  const { languageId } = useLanguage();
  const langName = getLanguageName(languageId);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showDictionary, setShowDictionary] = useState(false);
  const [showNextBanner, setShowNextBanner] = useState(false);
  const [showFeedbackBanner, setShowFeedbackBanner] = useState(false);
  const [pendingResult, setPendingResult] = useState(null);
  const mainContentRef = useRef(null);
  const dictionaryPopupRef = useRef(null);

  useEffect(() => {
    document.body.classList.add('in-conversation-practice');
    return () => {
      document.body.classList.remove('in-conversation-practice');
    };
  }, []);

  useEffect(() => {
    requestAnimationFrame(() => {
      if (mainContentRef.current) {
        mainContentRef.current.scrollTo({ top: 0, behavior: 'auto' });
      }
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    });
  }, [beatIndex]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dictionaryPopupRef.current && !dictionaryPopupRef.current.contains(event.target)) {
        setShowDictionary(false);
      }
    };

    if (showDictionary) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showDictionary]);

  const currentLine = useMemo(() => {
    return scenario.lines.find(l => l.id === beat.lineId);
  }, [scenario.lines, beat.lineId]);

  const distractorLines = useMemo(() => {
    return scenario.lines.filter(l => l.id !== beat.lineId);
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
    if (pendingResult) {
      onBeatComplete(pendingResult);
      setShowNextBanner(false);
      setShowFeedbackBanner(false);
      setPendingResult(null);
    }
  }, [pendingResult, onBeatComplete]);

  const handleSavePhrase = useCallback(() => {
    if (currentLine) {
      onSavePhrase(currentLine.id);
    }
  }, [currentLine, onSavePhrase]);

  const toggleTranscript = useCallback(() => {
    setShowTranscript(prev => !prev);
  }, []);

  const toggleDictionary = useCallback(() => {
    setShowDictionary(prev => !prev);
  }, []);

  const renderModule = useCallback(() => {
    if (!currentLine) {
      return (
        <div className="py-12 text-center text-[#5f6f66]">
          {t('conversation.beat.errorNoLine', 'Line not found')}
        </div>
      );
    }

    switch (beat.moduleId) {
      case 'listenMeaningChoice':
        return (
          <ListenMeaningChoice
            line={currentLine}
            distractorLines={distractorLines}
            onResult={handleModuleResult}
          />
        );
      case 'buildLine':
        return (
          <BuildLine
            line={currentLine}
            onResult={handleModuleResult}
          />
        );
      case 'shadowRepeat':
        return (
          <ShadowRepeat
            line={currentLine}
            onResult={handleModuleResult}
          />
        );
      case 'guidedReplyChoice':
        return (
          <GuidedReplyChoice
            line={currentLine}
            distractorLines={distractorLines}
            onResult={handleModuleResult}
          />
        );
      case 'typeInput':
        return (
          <TypeInput
            line={currentLine}
            onResult={handleModuleResult}
          />
        );
      default:
        return (
          <div className="py-12 text-center text-[#5f6f66]">
            {t('conversation.beat.errorUnknownModule', 'Unknown module type')}
          </div>
        );
    }
  }, [currentLine, beat.moduleId, distractorLines, handleModuleResult, t]);

  const progressPercent = totalBeats > 0 ? ((beatIndex + 1) / totalBeats) * 100 : 0;
  const routeTitle = t(scenario.metadata.titleKey, scenario.metadata.theme);
  const taskLabel = getBeatTaskLabel(beat.moduleId, t);
  const taskHint = getBeatTaskHint(beat.moduleId, t);
  const words = currentLine?.sentenceData?.words || [];

  return (
    <div className="relative flex h-[100dvh] flex-col overflow-hidden bg-[#fbf4e4] text-[#173d2e]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-36 overflow-hidden" aria-hidden="true">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-55"
          style={{ backgroundImage: `url(${riverBackground})` }}
        />
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
              <span className="material-symbols-outlined text-xl" aria-hidden="true">arrow_back</span>
            </button>

            <div className="min-w-0 text-center">
              <div
                className="truncate text-base font-bold text-[#183d2e] sm:text-lg"
                style={{ fontFamily: '"Baloo 2", system-ui, sans-serif' }}
              >
                {routeTitle}
              </div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5f715f]">
                {t('conversation.beat.progress', 'Beat {{current}} of {{total}}', {
                  current: beatIndex + 1,
                  total: totalBeats
                })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={toggleTranscript}
                className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm font-bold shadow-sm transition ${
                  showTranscript
                    ? 'border-[#2f6b4c] bg-[#e4f0df] text-[#214d39]'
                    : 'border-[#d8cdb7] bg-white/80 text-[#315846] hover:bg-white'
                }`}
                aria-pressed={showTranscript}
                aria-label={t('conversation.beat.transcriptTitle', 'Previous beats')}
              >
                <span aria-hidden="true">☰</span>
              </button>
              <button
                type="button"
                onClick={toggleDictionary}
                className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm font-bold shadow-sm transition ${
                  showDictionary
                    ? 'border-[#2f6b4c] bg-[#e4f0df] text-[#214d39]'
                    : 'border-[#d8cdb7] bg-white/80 text-[#315846] hover:bg-white'
                }`}
                title={t('conversation.modules.dictionary', 'Dictionary')}
                aria-pressed={showDictionary}
              >
                <span className="material-symbols-outlined text-lg" aria-hidden="true">menu_book</span>
              </button>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#2f6b4c]" aria-hidden="true" />
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#d8cdb7]/80">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#2f6b4c] to-[#9ab36a] transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="h-2 w-2 rounded-full bg-[#a6a06f]" aria-hidden="true" />
          </div>
        </div>
      </header>

      {showDictionary && currentLine && (
        <div ref={dictionaryPopupRef} className="fixed left-1/2 top-[5.75rem] z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 px-0">
          <div className="max-h-[65dvh] overflow-y-auto rounded-[1.5rem] border-2 border-[#2f6b4c]/30 bg-[#fff8e8] p-4 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#2f6b4c]">
                  {t('conversation.beat.travelNotes', 'Travel Notes')}
                </p>
                <h4 className="text-lg font-bold text-[#183d2e]">
                  {t('conversation.modules.dictionaryTitle', 'Word Dictionary')}
                </h4>
              </div>
              <button
                onClick={toggleDictionary}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-xl leading-none text-[#315846] shadow-sm hover:bg-[#f8ead2]"
                aria-label={t('common.close', 'Close')}
              >
                ×
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {words.map((word, index) => {
                const wordId = word.wordId;
                const hebrewText = word.surface || word.hebrew;
                const entry = wordId ? findDictionaryEntryForWord(wordId, 'hebrew', 'en', t) : null;
                const transliteration = sentenceTransliterationLookup[hebrewText]
                  || sentenceTransliterationLookup[word.hebrew]
                  || entry?.canonical
                  || '—';
                const meaningText = entry?.meaning
                  || sentenceMeaningsLookup[hebrewText]
                  || sentenceMeaningsLookup[word.hebrew]
                  || '—';

                return (
                  <div key={`${hebrewText}-${index}`} className="rounded-2xl border border-[#d8cdb7] bg-white/70 p-3">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#6c7469]">{langName}</div>
                        <div className="text-base font-bold text-[#183d2e]" dir="rtl">
                          {hebrewText}
                        </div>
                      </div>
                      <div>
                        <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#6c7469]">Pronunciation</div>
                        <div className="text-sm italic text-[#2f6b4c]">
                          {transliteration}
                        </div>
                      </div>
                      <div>
                        <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#6c7469]">Meaning</div>
                        <div className={`text-sm ${meaningText === '—' ? 'italic text-[#8d8b79]' : 'text-[#183d2e]'}`}>
                          {meaningText}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div ref={mainContentRef} className="relative z-10 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[768px] px-4 py-4 pb-24">
          <section className="mb-4 rounded-[1.5rem] border border-[#d8cdb7] bg-[#fff8e8]/88 p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#2f6b4c]">
                  {taskLabel}
                </p>
                <p className="mt-1 text-sm font-semibold leading-snug text-[#4e665b]">
                  {taskHint}
                </p>
              </div>
              <button
                type="button"
                onClick={handleSavePhrase}
                className="shrink-0 rounded-full border border-[#d8cdb7] bg-white/80 px-3 py-2 text-xs font-bold text-[#315846] shadow-sm transition hover:bg-white"
              >
                {t('conversation.beat.savePhrase', 'Save')}
              </button>
            </div>
          </section>

          {showTranscript && attemptHistory.length > 0 && (
            <section className="mb-4 rounded-[1.5rem] border border-[#d8cdb7] bg-[#fff8e8]/88 p-4 shadow-sm">
              <h3 className="mb-3 text-base font-bold text-[#183d2e]">
                {t('conversation.beat.transcriptTitle', 'Previous beats')}
              </h3>
              <div className="flex max-h-60 flex-col gap-2 overflow-y-auto pr-1">
                {attemptHistory.map((attempt, idx) => {
                  const attemptLine = scenario.lines.find(l => l.id === attempt.beat.lineId);
                  if (!attemptLine) return null;

                  return (
                    <div
                      key={idx}
                      className="flex flex-col gap-1.5 rounded-2xl border border-[#d8cdb7]/80 bg-white/65 p-3"
                    >
                      <div className="text-sm font-bold text-[#183d2e] sm:text-base" dir="rtl">
                        {attemptLine.he}
                      </div>
                      <div className="text-xs text-[#4e665b] sm:text-sm">
                        {attemptLine.en}
                      </div>
                      <div className="text-xs font-semibold">
                        {attempt.isCorrect ? (
                          <span className="text-[#2f6b4c]">✓ {t('conversation.beat.correct', 'Correct!')}</span>
                        ) : (
                          <span className="text-[#a06413]">~ {attempt.resultType}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          <section className="rounded-[1.75rem] border border-[#d8cdb7] bg-[#fffaf0]/92 p-3 shadow-lg sm:p-4">
            {renderModule()}
          </section>
        </div>
      </div>

      <div
        className={`fixed left-1/2 top-3 z-40 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-[1.35rem] border bg-[#fff8e8] shadow-2xl transition-all duration-300 ease-out ${
          showFeedbackBanner ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0 pointer-events-none'
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
                    : t('conversation.beat.keepGoing', 'Keep practicing!')
                }
              </div>
              {pendingResult?.userResponse && (
                <div className="text-xs font-semibold text-[#4e665b]">
                  {pendingResult.userResponse}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div
        className={`fixed bottom-0 left-1/2 z-30 w-full max-w-[768px] -translate-x-1/2 border-t border-[#d8cdb7] bg-[#fff8e8]/96 shadow-2xl backdrop-blur-sm transition-all duration-300 ease-out ${
          showNextBanner ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="px-4 py-3 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)]">
          <button
            onClick={handleNext}
            className="flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-3 text-lg font-bold text-white shadow-lg transition hover:brightness-105 active:scale-[0.99]"
            style={{ background: 'linear-gradient(180deg, #d98818, #b96a10)', boxShadow: '0 12px 28px rgba(175, 101, 14, 0.28)' }}
          >
            {t('conversation.beat.next', 'Continue')}
            <span className="material-symbols-outlined text-xl" aria-hidden="true">east</span>
          </button>
        </div>
      </div>

      {sentenceIntro.showPopup && (
        <SentenceIntroPopup {...sentenceIntro.popupProps} />
      )}
    </div>
  );
}
