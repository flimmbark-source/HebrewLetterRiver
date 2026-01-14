import { useState, useCallback } from 'react';
import SpeakButton from '../../SpeakButton.jsx';
import { useLocalization } from '../../../context/LocalizationContext.jsx';

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

  const handleToggleTarget = useCallback(() => {
    setShowTarget(prev => !prev);
  }, []);

  const handleComplete = useCallback((success) => {
    if (isCompleted) return;
    setIsCompleted(true);

    // Emit result after a short delay
    setTimeout(() => {
      onResult({
        userResponse: success ? line.he : 'skipped',
        isCorrect: success,
        resultType: success ? 'correct' : 'partial',
        suggestedAnswer: success ? undefined : line.he
      });
    }, 800);
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
