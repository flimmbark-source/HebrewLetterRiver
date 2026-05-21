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
import Icon from '../Icon.jsx';
import { useConversationIntro } from '../../hooks/useConversationIntro.js';
import riverBackground from '../../assets/Reading/River-Background.png';

function getWordSupportRows(words, langName, t) {
  return words.map((word, index) => {
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

    return {
      id: `${hebrewText || 'word'}-${index}`,
      label: langName,
      hebrewText,
      transliteration,
      meaningText
    };
  });
}

/**
 * ConversationBeatScreen
 *
 * Displays a single beat (line + module) with:
 * - Route-themed header and progress
 * - Existing module panel
 * - Travel Notes support drawer
 * - Feedback and next-step banners
 */
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
  const { languageId } = useLanguage();
  const langName = getLanguageName(languageId);
  const [showTravelNotes, setShowTravelNotes] = useState(false);
  const [travelNotesTab, setTravelNotesTab] = useState('words');
  const [showNextBanner, setShowNextBanner] = useState(false);
  const [showFeedbackBanner, setShowFeedbackBanner] = useState(false);
  const [pendingResult, setPendingResult] = useState(null);
  const mainContentRef = useRef(null);

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
    setShowTravelNotes(false);
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

  const openTravelNotes = useCallback((tab = 'words') => {
    setTravelNotesTab(tab);
    setShowTravelNotes(true);
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
  const words = currentLine?.sentenceData?.words || [];
  const wordRows = getWordSupportRows(words, langName, t);

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
              <Icon name="arrow_back" className="text-xl" aria-hidden="true" />
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

            <button
              type="button"
              onClick={() => openTravelNotes('words')}
              className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm font-bold shadow-sm transition ${
                showTravelNotes
                  ? 'border-[#2f6b4c] bg-[#e4f0df] text-[#214d39]'
                  : 'border-[#d8cdb7] bg-white/80 text-[#315846] hover:bg-white'
              }`}
              aria-expanded={showTravelNotes}
              aria-label={t('conversation.beat.travelNotes', 'Travel Notes')}
            >
              <Icon name="menu_book" className="text-lg" aria-hidden="true" />
            </button>
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

      <div ref={mainContentRef} className="relative z-10 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[768px] px-4 py-4 pb-28">
          <section className="rounded-[1.75rem] border border-[#d8cdb7] bg-[#fffaf0]/92 p-3 shadow-lg sm:p-4">
            {renderModule()}
          </section>

          <button
            type="button"
            onClick={() => openTravelNotes(attemptHistory.length > 0 ? 'journey' : 'words')}
            className="mt-4 flex w-full items-center justify-between rounded-[1.5rem] border border-[#d8cdb7] bg-[#fff8e8]/88 px-4 py-3 text-left shadow-sm transition hover:bg-white"
          >
            <span>
              <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-[#2f6b4c]">
                {t('conversation.beat.travelNotes', 'Travel Notes')}
              </span>
              <span className="mt-0.5 block text-sm font-semibold text-[#4e665b]">
                {attemptHistory.length > 0
                  ? t('conversation.beat.travelNotesHintWithHistory', 'Words, pronunciation, and previous lines are available here.')
                  : t('conversation.beat.travelNotesHint', 'Words and pronunciation are available here if you need support.')}
              </span>
            </span>
            <Icon name="expand_less" className="text-[#315846]" aria-hidden="true" />
          </button>
        </div>
      </div>

      {showTravelNotes && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#173d2e]/20 px-3" onClick={() => setShowTravelNotes(false)}>
          <section
            className="w-full max-w-[768px] rounded-t-[2rem] border border-[#d8cdb7] bg-[#fff8e8] p-4 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-[#d8cdb7]" aria-hidden="true" />
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#2f6b4c]">
                  {t('conversation.beat.travelNotes', 'Travel Notes')}
                </p>
                <h3 className="text-xl font-bold text-[#183d2e]" style={{ fontFamily: '"Baloo 2", system-ui, sans-serif' }}>
                  {t('conversation.beat.travelNotesTitle', 'Support for this stop')}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTravelNotes(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-xl leading-none text-[#315846] shadow-sm hover:bg-[#f8ead2]"
                aria-label={t('common.close', 'Close')}
              >
                ×
              </button>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-2 rounded-2xl bg-[#efe3c8] p-1">
              <button
                type="button"
                onClick={() => setTravelNotesTab('words')}
                className={`rounded-xl px-3 py-2 text-sm font-bold transition ${travelNotesTab === 'words' ? 'bg-[#fffaf0] text-[#183d2e] shadow-sm' : 'text-[#4e665b]'}`}
              >
                {t('conversation.beat.notesWords', 'Words')}
              </button>
              <button
                type="button"
                onClick={() => setTravelNotesTab('journey')}
                className={`rounded-xl px-3 py-2 text-sm font-bold transition ${travelNotesTab === 'journey' ? 'bg-[#fffaf0] text-[#183d2e] shadow-sm' : 'text-[#4e665b]'}`}
              >
                {t('conversation.beat.notesJourney', 'Previous Lines')}
              </button>
            </div>

            <div className="max-h-[52dvh] overflow-y-auto pr-1">
              {travelNotesTab === 'words' ? (
                <div className="flex flex-col gap-3">
                  {wordRows.length === 0 ? (
                    <div className="rounded-2xl border border-[#d8cdb7] bg-white/70 p-4 text-center text-sm font-semibold text-[#4e665b]">
                      {t('conversation.beat.noWordNotes', 'No word notes are available for this line yet.')}
                    </div>
                  ) : (
                    wordRows.map((row) => (
                      <div key={row.id} className="rounded-2xl border border-[#d8cdb7] bg-white/70 p-3">
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div>
                            <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#6c7469]">{row.label}</div>
                            <div className="text-base font-bold text-[#183d2e]" dir="rtl">
                              {row.hebrewText}
                            </div>
                          </div>
                          <div>
                            <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#6c7469]">Pronunciation</div>
                            <div className="text-sm italic text-[#2f6b4c]">
                              {row.transliteration}
                            </div>
                          </div>
                          <div>
                            <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#6c7469]">Meaning</div>
                            <div className={`text-sm ${row.meaningText === '—' ? 'italic text-[#8d8b79]' : 'text-[#183d2e]'}`}>
                              {row.meaningText}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {attemptHistory.length === 0 ? (
                    <div className="rounded-2xl border border-[#d8cdb7] bg-white/70 p-4 text-center text-sm font-semibold text-[#4e665b]">
                      {t('conversation.beat.noPreviousLines', 'Previous lines will appear here as you move down the route.')}
                    </div>
                  ) : (
                    attemptHistory.map((attempt, idx) => {
                      const attemptLine = scenario.lines.find(l => l.id === attempt.beat.lineId);
                      if (!attemptLine) return null;

                      return (
                        <div
                          key={`${attempt.beat.lineId}-${idx}`}
                          className="flex flex-col gap-1.5 rounded-2xl border border-[#d8cdb7]/80 bg-white/70 p-3"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#6c7469]">
                              {t('conversation.beat.previousLineNumber', 'Line {{number}}', { number: idx + 1 })}
                            </span>
                            {attempt.isCorrect ? (
                              <span className="text-xs font-bold text-[#2f6b4c]">✓ {t('conversation.beat.correct', 'Correct!')}</span>
                            ) : (
                              <span className="text-xs font-bold text-[#a06413]">~ {attempt.resultType}</span>
                            )}
                          </div>
                          <div className="text-base font-bold text-[#183d2e]" dir="rtl">
                            {attemptLine.he}
                          </div>
                          <div className="text-sm text-[#4e665b]">
                            {attemptLine.en}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </section>
        </div>
      )}

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
            <Icon name="east" className="text-xl" aria-hidden="true" />
          </button>
        </div>
      </div>

      {sentenceIntro.showPopup && (
        <SentenceIntroPopup {...sentenceIntro.popupProps} />
      )}
    </div>
  );
}
