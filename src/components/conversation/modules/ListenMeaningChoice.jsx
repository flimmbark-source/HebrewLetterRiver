import { useState, useEffect, useCallback } from 'react';
import SpeakButton from '../../SpeakButton.jsx';
import { useLocalization } from '../../../context/LocalizationContext.jsx';

/**
 * ListenMeaningChoice Module
 *
 * Play Hebrew audio and show multiple-choice English meanings.
 * The learner picks the correct English translation.
 */
export default function ListenMeaningChoice({ line, distractorLines = [], onResult }) {
  const { t } = useLocalization();
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [choices, setChoices] = useState([]);

  // Generate multiple choice options
  useEffect(() => {
    const correctAnswer = line.en;

    // Get distractor answers from other lines
    const distractors = distractorLines
      .filter(dl => dl.en !== correctAnswer)
      .slice(0, 3)
      .map(dl => dl.en);

    // If we don't have enough distractors, use placeholder
    while (distractors.length < 3) {
      distractors.push(`[Placeholder ${distractors.length + 1}]`);
    }

    // Shuffle choices
    const allChoices = [correctAnswer, ...distractors]
      .map(choice => ({ text: choice, id: Math.random() }))
      .sort(() => Math.random() - 0.5);

    setChoices(allChoices);
  }, [line, distractorLines]);

  const handleChoiceClick = useCallback((choice) => {
    if (isSubmitted) return;

    // If clicking the already selected choice, submit it
    if (selectedChoice?.id === choice.id) {
      const isCorrect = choice.text === line.en;
      setIsSubmitted(true);

      // Emit result immediately - feedback will be shown in top banner
      onResult({
        userResponse: choice.text,
        isCorrect,
        resultType: isCorrect ? 'correct' : 'incorrect',
        suggestedAnswer: isCorrect ? undefined : line.en
      });
    } else {
      // Otherwise, just select it
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
    if (choice.text === line.en) {
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
          {t('conversation.modules.listenMeaningChoice.instruction', 'Listen and pick the meaning')}
        </h3>
        <p className="text-slate-400">
          {t('conversation.modules.listenMeaningChoice.hint', 'Play the audio and choose the correct English translation')}
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
          {t('conversation.modules.listenMeaningChoice.playHint', 'Click to hear the Hebrew phrase')}
        </div>
      </div>

      {/* Multiple choice options */}
      <div className="flex flex-col gap-3">
        {choices.map((choice) => (
          <button
            key={choice.id}
            onClick={() => handleChoiceClick(choice)}
            className={getChoiceStyles(choice)}
            disabled={isSubmitted}
          >
            <div className="flex items-center gap-3">
              {/* Radio/Play indicator */}
              <div className={`
                w-8 h-8 rounded-full border-2 flex-shrink-0
                flex items-center justify-center transition-all
                ${selectedChoice?.id === choice.id && !isSubmitted
                  ? 'border-blue-500 bg-blue-500 hover:bg-blue-400 cursor-pointer'
                  : !isSubmitted
                  ? 'border-slate-500 bg-transparent'
                  : ''
                }
                ${isSubmitted && choice.text === line.en ? 'border-emerald-500 bg-emerald-500' : ''}
              `}>
                {/* Show play triangle when selected but not submitted */}
                {selectedChoice?.id === choice.id && !isSubmitted && (
                  <svg className="w-4 h-4 ml-0.5" viewBox="0 0 24 24" fill="white">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                )}
                {/* Show dot when not selected */}
                {selectedChoice?.id !== choice.id && !isSubmitted && (
                  <div className="w-0 h-0" />
                )}
                {/* Show checkmark when submitted and correct */}
                {isSubmitted && choice.text === line.en && (
                  <div className="w-2 h-2 bg-white rounded-full" />
                )}
              </div>

              {/* Choice text */}
              <span className="text-lg">{choice.text}</span>

              {/* Feedback icons */}
              {isSubmitted && choice.text === line.en && (
                <span className="ml-auto text-2xl">✅</span>
              )}
              {isSubmitted && selectedChoice?.id === choice.id && choice.text !== line.en && (
                <span className="ml-auto text-2xl">❌</span>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Instruction hint */}
      {!isSubmitted && selectedChoice && (
        <div className="text-center text-sm text-slate-400">
          {t('conversation.modules.listenMeaningChoice.submitHint', 'Click the play button to submit your answer')}
        </div>
      )}
    </div>
  );
}
