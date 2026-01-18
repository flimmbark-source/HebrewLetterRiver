import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useLocalization } from '../../context/LocalizationContext.jsx';
import ListenMeaningChoice from './modules/ListenMeaningChoice.jsx';
import ShadowRepeat from './modules/ShadowRepeat.jsx';
import GuidedReplyChoice from './modules/GuidedReplyChoice.jsx';
import TypeInput from './modules/TypeInput.jsx';
import { findDictionaryEntryForWord } from '../../lib/sentenceDictionaryLookup.ts';
import { sentenceTransliterationLookup, sentenceMeaningsLookup } from '../../data/conversation/scenarioFactory.ts';

/**
 * ConversationBeatScreen
 *
 * Displays a single beat (line + module) with:
 * - Context bar showing scenario and progress
 * - Transcript area showing previous beats
 * - Module panel for current beat
 * - Feedback panel
 * - "Save phrase" button
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
  const [showTranscript, setShowTranscript] = useState(false);
  const [showDictionary, setShowDictionary] = useState(false);
  const [showNextBanner, setShowNextBanner] = useState(false);
  const [showFeedbackBanner, setShowFeedbackBanner] = useState(false);
  const [pendingResult, setPendingResult] = useState(null);
  const mainContentRef = useRef(null);
  const dictionaryPopupRef = useRef(null);

  // Hide main app navigation bar while in conversation practice
  useEffect(() => {
    document.body.classList.add('in-conversation-practice');
    return () => {
      document.body.classList.remove('in-conversation-practice');
    };
  }, []);

  // Scroll to top when beat changes
  useEffect(() => {
    // Use requestAnimationFrame to ensure DOM has updated
    requestAnimationFrame(() => {
      if (mainContentRef.current) {
        mainContentRef.current.scrollTo({ top: 0, behavior: 'auto' });
      }
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    });
  }, [beatIndex]);

  // Click outside to close dictionary popup
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

  // Find the line for this beat
  const currentLine = useMemo(() => {
    return scenario.lines.find(l => l.id === beat.lineId);
  }, [scenario.lines, beat.lineId]);

  // Get distractor lines for choice modules
  const distractorLines = useMemo(() => {
    return scenario.lines.filter(l => l.id !== beat.lineId);
  }, [scenario.lines, beat.lineId]);

  const handleModuleResult = useCallback((result) => {
    // Store the result and show both banners at the same time
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

  // Render the appropriate module
  const renderModule = useCallback(() => {
    if (!currentLine) {
      return (
        <div className="text-center text-slate-400 py-12">
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
          <div className="text-center text-slate-400 py-12">
            {t('conversation.beat.errorUnknownModule', 'Unknown module type')}
          </div>
        );
    }
  }, [currentLine, beat.moduleId, distractorLines, handleModuleResult, t]);

  // Calculate progress percentage
  const progressPercent = totalBeats > 0 ? ((beatIndex + 1) / totalBeats) * 100 : 0;

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-slate-100">
      {/* Top bar */}
      <div className="bg-slate-800/80 border-b border-slate-700 backdrop-blur-sm sticky top-0 z-10">
        <div className="w-full max-w-full md:max-w-[768px] mx-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between">
            {/* Left: Scenario info */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <button
                onClick={onExit}
                className="p-1.5 sm:p-2 hover:bg-slate-700 rounded-lg transition-colors flex-shrink-0"
                aria-label={t('conversation.beat.exit', 'Exit')}
              >
                <span className="text-lg sm:text-xl">←</span>
              </button>
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-medium text-slate-400 truncate">
                  {t(scenario.metadata.titleKey, scenario.metadata.theme)}
                </div>
                <div className="text-[10px] sm:text-xs text-slate-500">
                  {t('conversation.beat.progress', 'Beat {{current}} of {{total}}', {
                    current: beatIndex + 1,
                    total: totalBeats
                  })}
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              {/* Transcript toggle */}
              <button
                onClick={toggleTranscript}
                className={`
                  px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm font-medium
                  transition-all duration-200
                  ${showTranscript
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }
                `}
              >
                <span className="hidden sm:inline">📜 {t('conversation.beat.transcript', 'Transcript')}</span>
                <span className="sm:hidden">📜</span>
              </button>

              {/* Dictionary toggle */}
              <button
                onClick={toggleDictionary}
                className={`
                  px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm font-medium
                  transition-all duration-200
                  ${showDictionary
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }
                `}
                title={t('conversation.modules.dictionary', 'Dictionary')}
              >
                📖
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-2 sm:mt-3 h-1 sm:h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Dictionary popup */}
      {showDictionary && currentLine && (
        <div ref={dictionaryPopupRef} className="fixed top-14 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] sm:w-full max-w-md px-4 sm:px-0">
          <div className="bg-slate-800 border-2 border-blue-500 rounded-lg shadow-2xl p-4 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-semibold text-slate-200">
                {t('conversation.modules.dictionaryTitle', 'Word Dictionary')}
              </h4>
              <button
                onClick={toggleDictionary}
                className="text-slate-400 hover:text-slate-200 text-xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {currentLine.sentenceData.words.map((word, index) => {
                const wordId = word.wordId;

                if (!wordId) {
                  // Fallback if no wordId - but try to show transliteration and meaning
                  const transliteration = sentenceTransliterationLookup[word.hebrew];
                  const meaningText = sentenceMeaningsLookup[word.hebrew] || '—';

                  return (
                    <div key={index} className="p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                      <div className="grid grid-cols-3 gap-2 text-center">
                        {/* Hebrew */}
                        <div>
                          <div className="text-xs text-slate-400 mb-1">Hebrew</div>
                          <div className="text-base font-semibold text-slate-100" dir="rtl">
                            {word.hebrew}
                          </div>
                        </div>

                        {/* Transliteration */}
                        <div>
                          <div className="text-xs text-slate-400 mb-1">Pronunciation</div>
                          <div className="text-sm text-blue-300 italic">
                            {transliteration || '—'}
                          </div>
                        </div>

                        {/* Meaning */}
                        <div>
                          <div className="text-xs text-slate-400 mb-1">Meaning</div>
                          <div className={`text-sm ${meaningText === '—' ? 'text-slate-500 italic' : 'text-slate-200'}`}>
                            {meaningText}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                const entry = findDictionaryEntryForWord(wordId, 'hebrew', 'en', t);

                if (!entry) {
                  // Fallback if word not found in dictionary - show transliteration and meaning from lookup tables
                  const transliteration = sentenceTransliterationLookup[word.hebrew];
                  const meaningText = sentenceMeaningsLookup[word.hebrew] || '—';

                  return (
                    <div key={index} className="p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                      <div className="grid grid-cols-3 gap-2 text-center">
                        {/* Hebrew */}
                        <div>
                          <div className="text-xs text-slate-400 mb-1">Hebrew</div>
                          <div className="text-base font-semibold text-slate-100" dir="rtl">
                            {word.hebrew}
                          </div>
                        </div>

                        {/* Transliteration */}
                        <div>
                          <div className="text-xs text-slate-400 mb-1">Pronunciation</div>
                          <div className="text-sm text-blue-300 italic">
                            {transliteration || '—'}
                          </div>
                        </div>

                        {/* Meaning */}
                        <div>
                          <div className="text-xs text-slate-400 mb-1">Meaning</div>
                          <div className={`text-sm ${meaningText === '—' ? 'text-slate-500 italic' : 'text-slate-200'}`}>
                            {meaningText}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={index} className="p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      {/* Hebrew */}
                      <div>
                        <div className="text-xs text-slate-400 mb-1">Hebrew</div>
                        <div className="text-base font-semibold text-slate-100" dir="rtl">
                          {entry.practiceWord}
                        </div>
                      </div>

                      {/* Transliteration */}
                      <div>
                        <div className="text-xs text-slate-400 mb-1">Pronunciation</div>
                        <div className="text-sm text-blue-300 italic">
                          {entry.canonical}
                        </div>
                      </div>

                      {/* English meaning */}
                      <div>
                        <div className="text-xs text-slate-400 mb-1">Meaning</div>
                        <div className="text-sm text-slate-200">
                          {entry.meaning}
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

      {/* Main content */}
      <div ref={mainContentRef} className="flex-1 overflow-y-auto">
        <div className="w-full max-w-full md:max-w-[768px] mx-auto px-3 sm:px-4 py-3 sm:py-4 md:py-4">
          {/* Transcript panel (collapsible) */}
          {showTranscript && attemptHistory.length > 0 && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-slate-800/50 rounded-xl border border-slate-700">
              <h3 className="text-base sm:text-lg font-semibold mb-3 text-slate-300">
                {t('conversation.beat.transcriptTitle', 'Previous beats')}
              </h3>
              <div className="flex flex-col gap-2 sm:gap-3 max-h-60 overflow-y-auto">
                {attemptHistory.map((attempt, idx) => {
                  const attemptLine = scenario.lines.find(l => l.id === attempt.beat.lineId);
                  if (!attemptLine) return null;

                  return (
                    <div
                      key={idx}
                      className="flex flex-col gap-1.5 p-3 bg-slate-800 rounded-lg border border-slate-700/50"
                    >
                      {/* Hebrew */}
                      <div className="text-sm sm:text-base font-semibold text-slate-200" dir="rtl">
                        {attemptLine.he}
                      </div>
                      {/* English */}
                      <div className="text-xs sm:text-sm text-slate-400">
                        {attemptLine.en}
                      </div>
                      {/* Result indicator */}
                      <div className="text-xs">
                        {attempt.isCorrect ? (
                          <span className="text-emerald-400">✓ Correct</span>
                        ) : (
                          <span className="text-amber-400">~ {attempt.resultType}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Module panel */}
          <div>
            {renderModule()}
          </div>
        </div>
      </div>

      {/* Feedback banner - slides down from top */}
      <div
        className={`fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-full md:max-w-[768px] bg-gradient-to-b from-slate-800 via-slate-800 to-slate-800/95 border-b border-slate-700 shadow-2xl z-30 transition-all duration-300 ease-out ${
          showFeedbackBanner ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="px-2 sm:px-3 py-1.5 sm:py-2">
          <div className="flex items-center justify-center gap-1.5 sm:gap-2">
            {pendingResult?.isCorrect ? (
              <>
                <span className="text-2xl sm:text-3xl">✅</span>
                <div className="text-center">
                  <div className="text-lg sm:text-xl font-bold text-emerald-400">
                    {t('conversation.beat.correct', 'Correct!')}
                  </div>
                  {pendingResult?.userResponse && (
                    <div className="text-xs sm:text-sm text-slate-300">
                      {pendingResult.userResponse}
                    </div>
                  )}
                </div>
                <span className="text-2xl sm:text-3xl">✅</span>
              </>
            ) : (
              <>
                <span className="text-2xl sm:text-3xl">💪</span>
                <div className="text-center">
                  <div className="text-lg sm:text-xl font-bold text-amber-400">
                    {pendingResult?.resultType === 'partial'
                      ? t('conversation.beat.almostThere', 'Almost there!')
                      : t('conversation.beat.keepGoing', 'Keep practicing!')
                    }
                  </div>
                  <div className="text-xs sm:text-sm text-slate-300 space-y-0.5">
                    {pendingResult?.userResponse && (
                      <div>
                        <span className="text-red-300">{t('conversation.beat.yourAnswer', 'You')}: </span>
                        {pendingResult.userResponse}
                      </div>
                    )}
                    {pendingResult?.suggestedAnswer && (
                      <div>
                        <span className="text-emerald-300">{t('conversation.beat.correctAnswer', 'Correct')}: </span>
                        {pendingResult.suggestedAnswer}
                      </div>
                    )}
                  </div>
                </div>
                <span className="text-2xl sm:text-3xl">💪</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Next button banner - slides up from bottom */}
      <div
        className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-full md:max-w-[768px] bg-gradient-to-t from-slate-800 via-slate-800 to-slate-800/95 border-t border-slate-700 shadow-2xl z-20 transition-all duration-300 ease-out ${
          showNextBanner ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="px-2 sm:px-3 py-1.5 sm:py-2">
          <div className="flex items-center justify-center">
            <button
              onClick={handleNext}
              className="px-6 sm:px-8 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-lg sm:text-xl rounded-lg transition-all duration-200 active:scale-95 shadow-lg flex items-center gap-1.5 sm:gap-2"
            >
              {t('conversation.beat.next', 'Next')}
              <span className="text-xl sm:text-2xl">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
