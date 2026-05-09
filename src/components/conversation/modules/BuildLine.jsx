import { useCallback, useMemo, useState } from 'react';
import SpeakButton from '../../SpeakButton.jsx';
import { useLocalization } from '../../../context/LocalizationContext.jsx';

function getLineTokens(line) {
  const wordTokens = line?.sentenceData?.words
    ?.map((word) => word.surface || word.hebrew || word.text)
    .filter(Boolean);

  if (wordTokens?.length) {
    return wordTokens;
  }

  return (line?.he || '')
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

function shuffleTokens(tokens) {
  return tokens
    .map((token, index) => ({ token, originalIndex: index, sortKey: Math.random() }))
    .sort((a, b) => a.sortKey - b.sortKey)
    .map(({ token, originalIndex }) => ({ token, originalIndex, id: `${originalIndex}-${token}` }));
}

function normalizeBuiltLine(tokens) {
  return tokens.join(' ').replace(/\s+/g, ' ').trim();
}

/**
 * BuildLine Module
 *
 * The learner reconstructs the target sentence by tapping known word chips
 * into the correct order. This gives mobile-friendly production practice
 * without requiring keyboard input.
 */
export default function BuildLine({ line, onResult }) {
  const { t } = useLocalization();
  const correctTokens = useMemo(() => getLineTokens(line), [line]);
  const shuffledTokens = useMemo(() => shuffleTokens(correctTokens), [correctTokens]);
  const [availableTokens, setAvailableTokens] = useState(shuffledTokens);
  const [selectedTokens, setSelectedTokens] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const correctLine = normalizeBuiltLine(correctTokens);
  const builtLine = normalizeBuiltLine(selectedTokens.map((item) => item.token));
  const isComplete = selectedTokens.length === correctTokens.length;

  const handlePickToken = useCallback((item) => {
    if (isSubmitted) return;
    setSelectedTokens((prev) => [...prev, item]);
    setAvailableTokens((prev) => prev.filter((tokenItem) => tokenItem.id !== item.id));
  }, [isSubmitted]);

  const handleRemoveToken = useCallback((item) => {
    if (isSubmitted) return;
    setSelectedTokens((prev) => prev.filter((tokenItem) => tokenItem.id !== item.id));
    setAvailableTokens((prev) => [...prev, item].sort((a, b) => a.originalIndex - b.originalIndex));
  }, [isSubmitted]);

  const handleReset = useCallback(() => {
    if (isSubmitted) return;
    setSelectedTokens([]);
    setAvailableTokens(shuffledTokens);
  }, [isSubmitted, shuffledTokens]);

  const handleSubmit = useCallback(() => {
    if (!isComplete || isSubmitted) return;

    const isCorrect = builtLine === correctLine;
    setIsSubmitted(true);

    onResult({
      userResponse: builtLine,
      isCorrect,
      resultType: isCorrect ? 'correct' : 'incorrect',
      suggestedAnswer: isCorrect ? undefined : correctLine
    });
  }, [builtLine, correctLine, isComplete, isSubmitted, onResult]);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div className="text-center">
        <h3 className="text-lg font-bold text-[#183d2e]" style={{ fontFamily: '"Baloo 2", system-ui, sans-serif' }}>
          {t('conversation.modules.buildLine.instruction', 'Build the line')}
        </h3>
        <p className="mt-1 text-sm font-medium text-[#4e665b]">
          {t('conversation.modules.buildLine.hint', 'Tap the word chips in the right order.')}
        </p>
      </div>

      <div className="rounded-[1.5rem] border border-[#d8cdb7] bg-[#fff8e8]/90 p-4 text-center shadow-sm">
        <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#2f6b4c]">
          {t('conversation.modules.buildLine.targetLabel', 'Build this meaning')}
        </div>
        <div className="text-lg font-bold text-[#183d2e]">
          {line.en}
        </div>
        <div className="mt-3 flex justify-center">
          <SpeakButton
            nativeText={line.he}
            nativeLocale="he-IL"
            transliteration={line.tl}
            variant="iconWithLabel"
            className="!text-sm"
          />
        </div>
      </div>

      <div className={`min-h-[4.75rem] rounded-[1.5rem] border-2 border-dashed p-3 transition ${
        isSubmitted
          ? builtLine === correctLine
            ? 'border-[#2f6b4c] bg-[#e4f0df]'
            : 'border-[#c77912] bg-[#fff0d8]'
          : 'border-[#d8cdb7] bg-white/60'
      }`}>
        <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#6c7469]">
          {t('conversation.modules.buildLine.answerLabel', 'Your line')}
        </div>
        <div className="flex min-h-[2.25rem] flex-row-reverse flex-wrap items-center justify-center gap-2" dir="rtl">
          {selectedTokens.length === 0 ? (
            <span className="text-sm font-semibold text-[#8a8678]">
              {t('conversation.modules.buildLine.emptyAnswer', 'Tap chips below to build the sentence')}
            </span>
          ) : (
            selectedTokens.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleRemoveToken(item)}
                disabled={isSubmitted}
                className="rounded-2xl border border-[#2f6b4c]/35 bg-[#f6fff2] px-3 py-2 text-lg font-bold text-[#183d2e] shadow-sm transition active:scale-[0.98] disabled:cursor-default"
              >
                {item.token}
              </button>
            ))
          )}
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-[#d8cdb7] bg-white/70 p-3 shadow-sm">
        <div className="mb-2 text-center text-[10px] font-bold uppercase tracking-[0.16em] text-[#6c7469]">
          {t('conversation.modules.buildLine.wordBankLabel', 'Word bank')}
        </div>
        <div className="flex flex-row-reverse flex-wrap justify-center gap-2" dir="rtl">
          {availableTokens.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handlePickToken(item)}
              disabled={isSubmitted}
              className="rounded-2xl border border-[#d8cdb7] bg-[#fff8e8] px-3 py-2 text-lg font-bold text-[#183d2e] shadow-sm transition hover:-translate-y-0.5 hover:bg-white active:scale-[0.98] disabled:cursor-default disabled:opacity-60"
            >
              {item.token}
            </button>
          ))}
        </div>
      </div>

      {!isSubmitted && (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleReset}
            disabled={selectedTokens.length === 0}
            className="flex-1 rounded-2xl border border-[#d8cdb7] bg-white/75 px-4 py-3 text-base font-bold text-[#4e665b] shadow-sm transition hover:bg-white active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {t('conversation.modules.buildLine.reset', 'Reset')}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isComplete}
            className={`flex-1 rounded-2xl px-4 py-3 text-base font-bold shadow-md transition active:scale-[0.99] ${
              isComplete
                ? 'bg-[#2f6b4c] text-white hover:brightness-105'
                : 'cursor-not-allowed bg-[#d8cdb7] text-[#8a8678] opacity-70'
            }`}
          >
            {t('conversation.modules.buildLine.check', 'Check')}
          </button>
        </div>
      )}
    </div>
  );
}
