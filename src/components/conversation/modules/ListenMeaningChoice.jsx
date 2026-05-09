import { useState, useEffect, useCallback } from 'react';
import SpeakButton from '../../SpeakButton.jsx';
import { useLocalization } from '../../../context/LocalizationContext.jsx';

export default function ListenMeaningChoice({ line, distractorLines = [], onResult }) {
  const { t } = useLocalization();
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [choices, setChoices] = useState([]);

  useEffect(() => {
    const correctAnswer = line.en;

    const distractors = distractorLines
      .filter(dl => dl.en !== correctAnswer)
      .slice(0, 3)
      .map(dl => dl.en);

    while (distractors.length < 3) {
      distractors.push(`[Placeholder ${distractors.length + 1}]`);
    }

    const allChoices = [correctAnswer, ...distractors]
      .map(choice => ({ text: choice, id: Math.random() }))
      .sort(() => Math.random() - 0.5);

    setChoices(allChoices);
  }, [line, distractorLines]);

  const handleChoiceClick = useCallback((choice) => {
    if (isSubmitted) return;

    if (selectedChoice?.id === choice.id) {
      const isCorrect = choice.text === line.en;
      setIsSubmitted(true);

      onResult({
        userResponse: choice.text,
        isCorrect,
        resultType: isCorrect ? 'correct' : 'incorrect',
        suggestedAnswer: isCorrect ? undefined : line.en
      });
    } else {
      setSelectedChoice(choice);
    }
  }, [isSubmitted, selectedChoice, line, onResult]);

  const getChoiceStyles = useCallback((choice) => {
    const baseStyles = `
      w-full rounded-2xl border px-3 py-3 text-left font-semibold
      transition-all duration-200 active:scale-[0.99]
    `;

    if (!isSubmitted) {
      if (selectedChoice?.id === choice.id) {
        return `${baseStyles} border-[#2f6b4c] bg-[#e4f0df] text-[#183d2e] ring-2 ring-[#2f6b4c]/15 shadow-md`;
      }
      return `${baseStyles} border-[#d8cdb7] bg-white/72 text-[#253d35] shadow-sm hover:-translate-y-0.5 hover:bg-white hover:shadow-md`;
    }

    if (choice.text === line.en) {
      return `${baseStyles} border-[#2f6b4c] bg-[#e4f0df] text-[#183d2e] ring-2 ring-[#2f6b4c]/15 shadow-md`;
    }
    if (selectedChoice?.id === choice.id) {
      return `${baseStyles} border-[#c77912] bg-[#fff0d8] text-[#6d4213] ring-2 ring-[#c77912]/15 shadow-md`;
    }
    return `${baseStyles} border-[#d8cdb7]/70 bg-white/45 text-[#7b8077] opacity-65`;
  }, [selectedChoice, isSubmitted, line]);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-3">
      <div className="text-center">
        <h3 className="text-xl font-bold text-[#183d2e]" style={{ fontFamily: '"Baloo 2", system-ui, sans-serif' }}>
          {t('conversation.modules.readAndMatch.instruction', 'Read and Match')}
        </h3>
        <p className="mt-1 text-sm font-medium text-[#4e665b]">
          {t('conversation.modules.readAndMatch.hint', 'Read the full line, then choose the match.')}
        </p>
      </div>

      <div className="rounded-[1.35rem] border border-[#d8cdb7] bg-[#fff8e8]/90 p-4 text-center shadow-sm">
        <div className="text-3xl font-bold tracking-wide text-[#183d2e] sm:text-4xl" dir="rtl">
          {line.he}
        </div>
        <div className="mt-3 flex justify-center">
          <SpeakButton
            nativeText={line.he}
            nativeLocale="he-IL"
            transliteration={line.tl}
            variant="iconWithLabel"
            className="!px-3 !py-2 !text-sm"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {choices.map((choice) => {
          const isSelected = selectedChoice?.id === choice.id;
          const isCorrectChoice = isSubmitted && choice.text === line.en;
          const isIncorrectSelected = isSubmitted && isSelected && choice.text !== line.en;

          return (
            <button
              key={choice.id}
              onClick={() => handleChoiceClick(choice)}
              className={getChoiceStyles(choice)}
              disabled={isSubmitted}
            >
              <div className="flex items-center gap-3">
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                  isCorrectChoice
                    ? 'border-[#2f6b4c] bg-[#2f6b4c] text-white'
                    : isIncorrectSelected
                      ? 'border-[#c77912] bg-[#c77912] text-white'
                      : isSelected
                        ? 'border-[#2f6b4c] bg-[#2f6b4c] text-white'
                        : 'border-[#b8ad97] bg-[#fffaf0] text-transparent'
                }`} aria-hidden="true">
                  {isCorrectChoice ? '✓' : isIncorrectSelected ? '×' : isSelected ? '●' : '•'}
                </span>

                <span className="text-base sm:text-lg">{choice.text}</span>

                {isCorrectChoice && (
                  <span className="ml-auto text-xl text-[#2f6b4c]" aria-hidden="true">✓</span>
                )}
                {isIncorrectSelected && (
                  <span className="ml-auto text-xl text-[#c77912]" aria-hidden="true">×</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {!isSubmitted && selectedChoice && (
        <div className="rounded-2xl border border-[#d8cdb7] bg-[#fff8e8]/70 px-3 py-2 text-center text-xs font-semibold text-[#4e665b]">
          {t('conversation.modules.readAndMatch.submitHint', 'Tap the selected answer again to submit')}
        </div>
      )}
    </div>
  );
}
