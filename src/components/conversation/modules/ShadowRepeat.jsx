import { useState, useCallback } from 'react';
import SpeakButton from '../../SpeakButton.jsx';
import { useLocalization } from '../../../context/LocalizationContext.jsx';
import { findDictionaryEntryForWord } from '../../../lib/sentenceDictionaryLookup.ts';
import { sentenceTransliterationLookup } from '../../../data/conversation/scenarioFactory.ts';

/**
 * ShadowRepeat Module
 *
 * Record the learner repeating the Hebrew phrase.
 * Shows the target text and transliteration.
 * Uses completion-based pass (user self-reports success).
 */
export default function ShadowRepeat({ line, onResult }) {
  const { t } = useLocalization();
  const [showTarget, setShowTarget] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showDictionary, setShowDictionary] = useState(false);

  const handleToggleTarget = useCallback(() => {
    setShowTarget(prev => !prev);
  }, []);

  const toggleDictionary = useCallback(() => {
    setShowDictionary(prev => !prev);
  }, []);

  const handleComplete = useCallback((success) => {
    if (isCompleted) return;
    setIsCompleted(true);

    // Emit result immediately - feedback will be shown in banner
    onResult({
      userResponse: success ? line.he : 'skipped',
      isCorrect: success,
      resultType: success ? 'correct' : 'partial',
      suggestedAnswer: success ? undefined : line.he
    });
  }, [isCompleted, line, onResult]);

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      {/* Instructions */}
      <div className="text-center">
        <h3 className="text-xl font-semibold text-slate-200 mb-2">
          {t('conversation.modules.shadowRepeat.instruction', 'Shadow and repeat')}
        </h3>
        <p className="text-slate-400">
          {t('conversation.modules.shadowRepeat.hint', 'Listen to the phrase and repeat it out loud')}
        </p>
      </div>

      {/* Top bar with dictionary button */}
      <div className="relative flex justify-end gap-2">
        <button
          onClick={toggleDictionary}
          className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors text-xl"
          title={t('conversation.modules.dictionary', 'Dictionary')}
        >
          📖
        </button>

        {/* Dictionary popup */}
        {showDictionary && (
          <div className="absolute top-full right-0 mt-2 z-50 w-full sm:w-96">
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
                {line.sentenceData.words.map((word, index) => {
                  const wordId = word.wordId;

                  if (!wordId) {
                    // Fallback if no wordId
                    return (
                      <div key={index} className="p-3 bg-slate-700/50 rounded-lg">
                        <div className="text-base font-semibold text-slate-100 text-center" dir="rtl">
                          {word.hebrew}
                        </div>
                        <div className="text-xs text-slate-400 text-center mt-1">
                          {t('conversation.modules.typeInput.noWordData', 'Word details not available')}
                        </div>
                      </div>
                    );
                  }

                  const entry = findDictionaryEntryForWord(wordId, 'hebrew', 'en', t);

                  if (!entry) {
                    // Fallback if word not found in dictionary - show transliteration from lookup table
                    const transliteration = sentenceTransliterationLookup[word.hebrew];
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

                          {/* Meaning placeholder */}
                          <div>
                            <div className="text-xs text-slate-400 mb-1">Meaning</div>
                            <div className="text-sm text-slate-500 italic">
                              —
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
      </div>

      {/* Audio player */}
      <div className="flex justify-center items-center gap-4 p-6 bg-slate-800/50 rounded-xl border border-slate-700">
        <SpeakButton
          nativeText={line.he}
          nativeLocale="he-IL"
          transliteration={line.tl}
          variant="iconWithLabel"
          className="!py-3 !px-5 !text-base"
        />
        <div className="text-slate-400 text-sm">
          {t('conversation.modules.shadowRepeat.playHint', 'Listen as many times as needed')}
        </div>
      </div>

      {/* Target text toggle */}
      <div className="flex flex-col gap-3">
        <button
          onClick={handleToggleTarget}
          className={`
            py-3 px-5 rounded-lg font-medium transition-all duration-200
            ${showTarget
              ? 'bg-slate-700 border-slate-600'
              : 'bg-blue-600 hover:bg-blue-500'
            }
            border-2 text-white hover:scale-102 active:scale-98
          `}
        >
          {showTarget
            ? t('conversation.modules.shadowRepeat.hideText', 'Hide text')
            : t('conversation.modules.shadowRepeat.showText', 'Show text to help')
          }
        </button>

        {/* Target Hebrew text and transliteration */}
        {showTarget && (
          <div className="p-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 shadow-lg">
            <div className="flex flex-col gap-4">
              {/* Hebrew text */}
              <div className="text-center">
                <div className="text-sm font-medium text-slate-400 mb-2">
                  {t('conversation.modules.shadowRepeat.hebrewLabel', 'Hebrew')}
                </div>
                <div className="text-3xl font-semibold text-slate-100 tracking-wide" dir="rtl">
                  {line.he}
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-slate-700" />

              {/* Transliteration */}
              <div className="text-center">
                <div className="text-sm font-medium text-slate-400 mb-2">
                  {t('conversation.modules.shadowRepeat.pronunciationLabel', 'Pronunciation')}
                </div>
                <div className="text-xl text-blue-300 italic">
                  {line.tl}
                </div>
              </div>

              {/* English translation (optional hint) */}
              <div className="text-center pt-2 border-t border-slate-700/50">
                <div className="text-sm text-slate-500">
                  {line.en}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Completion buttons */}
      <div className="flex gap-3 mt-4">
        <button
          onClick={() => handleComplete(true)}
          disabled={isCompleted}
          className={`
            flex-1 py-4 px-6 rounded-lg font-semibold text-lg
            bg-emerald-600 hover:bg-emerald-500 text-white
            transition-all duration-200 hover:scale-105 active:scale-95
            border-2 border-emerald-500
            disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100
          `}
        >
          ✅ {t('conversation.modules.shadowRepeat.success', "I said it!")}
        </button>

        <button
          onClick={() => handleComplete(false)}
          disabled={isCompleted}
          className={`
            flex-1 py-4 px-6 rounded-lg font-semibold text-lg
            bg-slate-700 hover:bg-slate-600 text-slate-300
            transition-all duration-200 hover:scale-105 active:scale-95
            border-2 border-slate-600
            disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100
          `}
        >
          ⏭️ {t('conversation.modules.shadowRepeat.skip', "Skip for now")}
        </button>
      </div>

      {/* Encouragement for users */}
      <div className="text-center text-sm text-slate-500 italic">
        {t('conversation.modules.shadowRepeat.encouragement', 'Shadowing helps build muscle memory for pronunciation')}
      </div>
    </div>
  );
}
