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
    setSelectedChoice(choice);
  }, [isSubmitted]);

  const handleSubmit = useCallback(() => {
    if (!selectedChoice || isSubmitted) return;

    const isCorrect = selectedChoice.he === line.he;
    setIsSubmitted(true);

    // Emit result after a short delay to show feedback
    setTimeout(() => {
      onResult({
        userResponse: selectedChoice.he,
        isCorrect,
        resultType: isCorrect ? 'correct' : 'incorrect',
        suggestedAnswer: isCorrect ? undefined : line.he
      });
    }, 1000);
  }, [selectedChoice, isSubmitted, line, onResult]);

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
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      {/* Instructions */}
      <div className="text-center">
        <h3 className="text-xl font-semibold text-slate-200 mb-2">
          {t('conversation.modules.guidedReplyChoice.instruction', 'Choose the Hebrew phrase')}
        </h3>
        <p className="text-slate-400">
          {t('conversation.modules.guidedReplyChoice.hint', 'Pick the correct Hebrew response')}
        </p>
      </div>

      {/* Context - show English meaning */}
      <div className="p-6 bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-xl border border-blue-700/50">
        <div className="text-sm font-medium text-slate-400 mb-2 text-center">
          {t('conversation.modules.guidedReplyChoice.contextLabel', 'You want to say:')}
        </div>
        <div className="text-2xl font-semibold text-slate-100 text-center">
          {line.en}
        </div>
      </div>

      {/* Multiple choice options (Hebrew) */}
      <div className="flex flex-col gap-3">
        {choices.map((choice) => (
          <div
            key={choice.id}
            onClick={() => handleChoiceClick(choice)}
            className={getChoiceStyles(choice)}
            role="button"
            tabIndex={isSubmitted ? -1 : 0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleChoiceClick(choice);
              }
            }}
          >
            <div className="flex items-start gap-3">
              {/* Radio indicator */}
              <div className={`
                w-6 h-6 rounded-full border-2 flex-shrink-0 mt-1
                flex items-center justify-center transition-all
                ${selectedChoice?.id === choice.id
                  ? 'border-blue-500 bg-blue-500'
                  : 'border-slate-500 bg-transparent'
                }
                ${isSubmitted && choice.he === line.he ? 'border-emerald-500 bg-emerald-500' : ''}
              `}>
                {(selectedChoice?.id === choice.id || (isSubmitted && choice.he === line.he)) && (
                  <div className="w-2 h-2 bg-white rounded-full" />
                )}
              </div>

              {/* Choice content */}
              <div className="flex-1 flex flex-col gap-2">
                {/* Hebrew text */}
                <div className="text-xl font-semibold" dir="rtl">
                  {choice.he}
                </div>

                {/* Transliteration hint */}
                {choice.tl && (
                  <div className="text-sm text-slate-400 italic">
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
                  className="!p-2 !min-w-[36px] !min-h-[36px]"
                />
              </div>

              {/* Feedback icons */}
              {isSubmitted && choice.he === line.he && (
                <span className="text-2xl flex-shrink-0">✅</span>
              )}
              {isSubmitted && selectedChoice?.id === choice.id && choice.he !== line.he && (
                <span className="text-2xl flex-shrink-0">❌</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Submit button */}
      {!isSubmitted && (
        <button
          onClick={handleSubmit}
          disabled={!selectedChoice}
          className={`
            py-3 px-6 rounded-lg font-semibold text-lg
            transition-all duration-200
            ${selectedChoice
              ? 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer hover:scale-105 active:scale-95'
              : 'bg-slate-700 text-slate-500 cursor-not-allowed opacity-50'
            }
          `}
        >
          {t('conversation.modules.submit', 'Submit')}
        </button>
      )}

      {/* Feedback message */}
      {isSubmitted && (
        <div className={`
          p-4 rounded-lg text-center font-medium
          ${selectedChoice.he === line.he
            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
            : 'bg-red-500/20 text-red-300 border border-red-500/50'
          }
        `}>
          {selectedChoice.he === line.he
            ? t('conversation.modules.correct', 'Correct!')
            : (
              <div className="flex flex-col gap-2">
                <div>{t('conversation.modules.incorrect', 'Not quite.')}</div>
                <div className="text-lg" dir="rtl">{line.he}</div>
                <div className="text-sm opacity-75">{line.tl}</div>
              </div>
            )
          }
        </div>
      )}
    </div>
  );
}
