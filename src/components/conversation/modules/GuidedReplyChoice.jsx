import { useState, useEffect, useCallback } from 'react';
import SpeakButton from '../../SpeakButton.jsx';
import { useLocalization } from '../../../context/LocalizationContext.jsx';

export default function GuidedReplyChoice({ line, distractorLines = [], onResult }) {
  const { t } = useLocalization();
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showTransliterations, setShowTransliterations] = useState(false);
  const [choices, setChoices] = useState([]);

  useEffect(() => {
    const correctAnswer = line.he;

    const distractors = distractorLines
      .filter(dl => dl.he !== correctAnswer)
      .slice(0, 3)
      .map(dl => ({ he: dl.he, tl: dl.tl }));

    while (distractors.length < 3) {
      distractors.push({
        he: `[נסיון ${distractors.length + 1}]`,
        tl: `[nisayon ${distractors.length + 1}]`
      });
    }

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
      w-full rounded-2xl border px-3 py-3 text-left font-semibold
      transition-all duration-200 active:scale-[0.99]
    `;

    if (!isSubmitted) {
      if (selectedChoice?.id === choice.id) {
        return `${baseStyles} border-[#2f6b4c] bg-[#e4f0df] text-[#183d2e] ring-2 ring-[#2f6b4c]/15 shadow-md`;
      }
      return `${baseStyles} border-[#d8cdb7] bg-white/72 text-[#253d35] shadow-sm hover:-translate-y-0.5 hover:bg-white hover:shadow-md`;
    }

    if (choice.he === line.he) {
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
          {t('conversation.modules.chooseReply.instruction', 'Choose the Reply')}
        </h3>
        <p className="mt-1 text-sm font-medium text-[#4e665b]">
          {t('conversation.modules.chooseReply.hint', 'Pick the line that fits this moment.')}
        </p>
      </div>

      <div className="rounded-[1.5rem] border border-[#d8cdb7] bg-[#fff8e8]/90 p-4 text-center shadow-sm">
        <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#2f6b4c]">
          {t('conversation.modules.chooseReply.contextLabel', 'How would you respond?')}
        </div>
        <div className="text-lg font-bold text-[#183d2e]">
          {line.en}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {choices.map((choice) => {
          const isSelected = selectedChoice?.id === choice.id;
          const isCorrectChoice = isSubmitted && choice.he === line.he;
          const isIncorrectSelected = isSubmitted && isSelected && choice.he !== line.he;

          return (
            <button
              key={choice.id}
              onClick={() => handleChoiceClick(choice)}
              className={getChoiceStyles(choice)}
              disabled={isSubmitted}
            >
              <div className="flex items-start gap-3">
                <span className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
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

                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="text-lg font-bold text-[#183d2e]" dir="rtl">
                    {choice.he}
                  </div>

                  {choice.tl && showTransliterations && (
                    <div className="text-sm italic text-[#2f6b4c]">
                      {choice.tl}
                    </div>
                  )}
                </div>

                <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                  <SpeakButton
                    nativeText={choice.he}
                    nativeLocale="he-IL"
                    transliteration={choice.tl}
                    variant="icon"
                    className="!min-h-[36px] !min-w-[36px] !p-2"
                  />
                </div>

                {isCorrectChoice && (
                  <span className="shrink-0 text-xl text-[#2f6b4c]" aria-hidden="true">✓</span>
                )}
                {isIncorrectSelected && (
                  <span className="shrink-0 text-xl text-[#c77912]" aria-hidden="true">×</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-center pt-1">
        <button
          type="button"
          onClick={() => setShowTransliterations((prev) => !prev)}
          className="rounded-full border border-[#d8cdb7] bg-white/72 px-4 py-2 text-sm font-bold text-[#315846] shadow-sm transition hover:bg-white"
        >
          {showTransliterations
            ? t('conversation.modules.chooseReply.hideTransliterations', 'Hide pronunciation')
            : t('conversation.modules.chooseReply.showTransliterations', 'Show pronunciation')}
        </button>
      </div>
    </div>
  );
}
