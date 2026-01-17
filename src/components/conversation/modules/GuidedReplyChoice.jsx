import { useState, useEffect, useCallback } from 'react';
import SpeakButton from '../../SpeakButton.jsx';
import { useLocalization } from '../../../context/LocalizationContext.jsx';

/**
 * GuidedReplyChoice Module
 *
 * Show a context (English meaning) and multiple Hebrew options.
 * The learner picks the correct Hebrew phrase.
 */
export default function GuidedReplyChoice({ line, distractorLines = [], onResult }) {
  const { t } = useLocalization();
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [choices, setChoices] = useState([]);

  // Generate multiple choice options
  useEffect(() => {
    const correctAnswer = line.he;

    // Get distractor answers from other lines (preferably different themes)
    const distractors = distractorLines
      .filter(dl => dl.he !== correctAnswer)
      .slice(0, 3)
      .map(dl => ({ he: dl.he, tl: dl.tl }));

    // If we don't have enough distractors, use placeholder
    while (distractors.length < 3) {
      distractors.push({
        he: `[נסיון ${distractors.length + 1}]`,
        tl: `[nisayon ${distractors.length + 1}]`
      });
    }

    // Shuffle choices
    const allChoices = [
      { he: correctAnswer, tl: line.tl },
      ...distractors
    ]
      .map(choice => ({ ...choice, id: Math.random() }))
      .sort(() => Math.random() - 0.5);

    setChoices(allChoices);
  }, [line, distractorLines]);

  const handleChoiceClick = useCallback((choice) => {
    if (isSubmitted) return;

    if (selectedChoice?.id === choice.id) {
      const isCorrect = choice.he === line.he;
      setIsSubmitted(true);

      // Emit result immediately - feedback will be shown in top banner
      onResult({
        userResponse: choice.he,
        isCorrect,
        resultType: isCorrect ? 'correct' : 'incorrect',
        suggestedAnswer: isCorrect ? undefined : line.he
      });
    } else {
      setSelectedChoice(choice);
    }
  }, [isSubmitted, selectedChoice, line, onResult]);

  const getChoiceStyles = useCallback((choice) => {
    const baseStyles = `
      w-full p-4 rounded-lg border-2
      text-left font-medium transition-all duration-200
      cursor-pointer hover:scale-102
    `;

    if (!isSubmitted) {
      if (selectedChoice?.id === choice.id) {
        return `${baseStyles} bg-blue-500/20 border-blue-500 ring-2 ring-blue-500/50`;
      }
      return `${baseStyles} bg-slate-800/50 border-slate-700 hover:bg-slate-700 hover:border-slate-600`;
    }

    // After submission, show correct/incorrect
    if (choice.he === line.he) {
      return `${baseStyles} bg-emerald-500/20 border-emerald-500 ring-2 ring-emerald-500/50`;
    }
    if (selectedChoice?.id === choice.id) {
      return `${baseStyles} bg-red-500/20 border-red-500 ring-2 ring-red-500/50`;
    }
    return `${baseStyles} bg-slate-800/30 border-slate-700/50 opacity-50`;
  }, [selectedChoice, isSubmitted, line]);

  return (
    <div className="flex flex-col gap-4 sm:gap-6 max-w-2xl mx-auto">
      {/* Instructions */}
      <div className="text-center">
        <h3 className="text-lg sm:text-xl font-semibold text-slate-200 mb-1 sm:mb-2">
          {t('conversation.modules.guidedReplyChoice.instruction', 'Choose the Hebrew phrase')}
        </h3>
        <p className="text-sm sm:text-base text-slate-400">
          {t('conversation.modules.guidedReplyChoice.hint', 'Pick the correct Hebrew response')}
        </p>
      </div>

      {/* Context - show English meaning */}
      <div className="p-4 sm:p-6 bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-xl border border-blue-700/50">
        <div className="text-xs sm:text-sm font-medium text-slate-400 mb-1 sm:mb-2 text-center">
          {t('conversation.modules.guidedReplyChoice.contextLabel', 'You want to say:')}
        </div>
        <div className="text-lg sm:text-2xl font-semibold text-slate-100 text-center">
          {line.en}
        </div>
      </div>

      {/* Multiple choice options (Hebrew) */}
      <div className="flex flex-col gap-2 sm:gap-3">
        {choices.map((choice) => (
          <button
            key={choice.id}
            onClick={() => handleChoiceClick(choice)}
            className={getChoiceStyles(choice)}
            disabled={isSubmitted}
          >
            <div className="flex items-start gap-2 sm:gap-3">
              {/* Radio/Play indicator */}
              <div className={`
                w-8 h-8 rounded-full border-2 flex-shrink-0 mt-0.5 sm:mt-1
                flex items-center justify-center transition-all
                ${selectedChoice?.id === choice.id && !isSubmitted
                  ? 'border-blue-500 bg-blue-500 hover:bg-blue-400 cursor-pointer'
                  : !isSubmitted
                  ? 'border-slate-500 bg-transparent'
                  : ''
                }
                ${isSubmitted && choice.he === line.he ? 'border-emerald-500 bg-emerald-500' : ''}
                ${isSubmitted && selectedChoice?.id === choice.id && choice.he !== line.he ? 'border-red-500 bg-red-500' : ''}
              `}>
                {selectedChoice?.id === choice.id && !isSubmitted && (
                  <svg className="w-4 h-4 ml-0.5" viewBox="0 0 24 24" fill="white">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                )}
                {selectedChoice?.id !== choice.id && !isSubmitted && (
                  <div className="w-0 h-0" />
                )}
                {isSubmitted && choice.he === line.he && (
                  <div className="w-2 h-2 bg-white rounded-full" />
                )}
              </div>

              {/* Choice content */}
              <div className="flex-1 flex flex-col gap-1 sm:gap-2 min-w-0">
                {/* Hebrew text */}
                <div className="text-base sm:text-xl font-semibold" dir="rtl">
                  {choice.he}
                </div>

                {/* Transliteration hint */}
                {choice.tl && (
                  <div className="text-xs sm:text-sm text-slate-400 italic">
                    {choice.tl}
                  </div>
                )}
              </div>

              {/* Audio button for each choice */}
              <div
                className="flex-shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <SpeakButton
                  nativeText={choice.he}
                  nativeLocale="he-IL"
                  transliteration={choice.tl}
                  variant="icon"
                  className="!p-1.5 sm:!p-2 !min-w-[32px] sm:!min-w-[36px] !min-h-[32px] sm:!min-h-[36px]"
                />
              </div>

              {/* Feedback icons */}
              {isSubmitted && choice.he === line.he && (
                <span className="text-xl sm:text-2xl flex-shrink-0">✅</span>
              )}
              {isSubmitted && selectedChoice?.id === choice.id && choice.he !== line.he && (
                <span className="text-xl sm:text-2xl flex-shrink-0">❌</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
