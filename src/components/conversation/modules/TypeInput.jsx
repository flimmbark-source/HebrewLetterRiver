import { useState, useCallback, useRef, useEffect } from 'react';
import SpeakButton from '../../SpeakButton.jsx';
import { useLocalization } from '../../../context/LocalizationContext.jsx';
import { evaluateWithVariants } from '../../../lib/translationEvaluator.ts';

/**
 * TypeInput Module
 *
 * Ask the learner to type either the Hebrew script or transliteration.
 * Validates against acceptable variants.
 */
export default function TypeInput({ line, onResult, mode = 'auto' }) {
  const { t } = useLocalization();
  const [userInput, setUserInput] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [inputMode, setInputMode] = useState(mode === 'auto' ? 'transliteration' : mode);
  const [displayMode, setDisplayMode] = useState('hebrew'); // Controls what's shown in "You want to say"
  const inputRef = useRef(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleInputChange = useCallback((e) => {
    if (isSubmitted) return;
    setUserInput(e.target.value);
  }, [isSubmitted]);

  const handleSubmit = useCallback(() => {
    if (!userInput.trim() || isSubmitted) return;

    // Determine which variants to check against based on input mode
    let acceptableAnswers = [];

    if (inputMode === 'hebrew') {
      // Check against Hebrew variants
      acceptableAnswers = line.acceptableVariants?.hebrew || [line.he];
    } else if (inputMode === 'transliteration') {
      // Check against transliteration variants
      acceptableAnswers = line.acceptableVariants?.transliteration || [line.tl];
    }

    // Evaluate the input
    const result = evaluateWithVariants(acceptableAnswers, userInput);

    if (!result) {
      // Fallback: incorrect
      setEvaluation({
        status: 'incorrect',
        contentScore: 0,
        blendedScore: 0
      });
      setIsSubmitted(true);

      // Emit result immediately - feedback will be shown in banner
      onResult({
        userResponse: userInput,
        isCorrect: false,
        resultType: 'incorrect',
        suggestedAnswer: inputMode === 'hebrew' ? line.he : line.tl
      });
      return;
    }

    setEvaluation(result);
    setIsSubmitted(true);

    // Emit result immediately - feedback will be shown in banner
    onResult({
      userResponse: userInput,
      isCorrect: result.status === 'correct',
      resultType: result.status,
      suggestedAnswer: result.status === 'correct' ? undefined : (inputMode === 'hebrew' ? line.he : line.tl),
      score: result.blendedScore
    });
  }, [userInput, isSubmitted, inputMode, line, onResult]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  const toggleDisplayMode = useCallback(() => {
    if (isSubmitted) return;
    setDisplayMode(prev => prev === 'english' ? 'hebrew' : 'english');
  }, [isSubmitted]);

  const getInputPlaceholder = useCallback(() => {
    if (inputMode === 'hebrew') {
      return t('conversation.modules.typeInput.placeholderHebrew', 'Type in Hebrew...');
    }
    return t('conversation.modules.typeInput.placeholderTranslit', 'Type the transliteration...');
  }, [inputMode, t]);

  return (
    <div className="flex flex-col gap-3 md:gap-4 max-w-2xl mx-auto">
      {/* Instructions */}
      <div className="text-center">
        <h3 className="text-base sm:text-lg md:text-lg font-semibold text-slate-200 mb-1">
          {t('conversation.modules.typeInput.instruction', 'Type the answer')}
        </h3>
        <p className="text-sm text-slate-400">
          {inputMode === 'hebrew'
            ? t('conversation.modules.typeInput.hintHebrew', 'Type the Hebrew phrase')
            : t('conversation.modules.typeInput.hintTranslit', 'Type the transliteration (pronunciation)')
          }
        </p>
      </div>

      {/* Context - show text */}
      <div className="relative p-3 sm:p-4 md:p-4 bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-xl border border-blue-700/50">
        <div className="text-sm font-medium text-slate-400 mb-2 text-center">
          {t('conversation.modules.typeInput.contextLabel', 'You want to say:')}
        </div>

        {/* Display text */}
        <div
          className="text-center text-2xl font-semibold text-slate-100 leading-relaxed"
          dir={displayMode === 'hebrew' ? 'rtl' : 'ltr'}
        >
          {displayMode === 'english' ? line.en : line.he}
        </div>

        {/* Audio hint */}
        <div className="flex justify-center mt-4">
          <SpeakButton
            nativeText={line.he}
            nativeLocale="he-IL"
            transliteration={line.tl}
            variant="iconWithLabel"
            className="!text-sm"
          />
        </div>
      </div>

      {/* Input field */}
      <div className="relative">
        <textarea
          ref={inputRef}
          value={userInput}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder={getInputPlaceholder()}
          disabled={isSubmitted}
          dir={inputMode === 'hebrew' ? 'rtl' : 'ltr'}
          rows={3}
          className={`
            w-full px-4 py-3 rounded-lg
            text-lg font-medium
            bg-slate-800 border-2
            text-slate-100 placeholder-slate-500
            focus:outline-none focus:ring-2
            transition-all duration-200
            resize-none
            ${isSubmitted
              ? evaluation?.status === 'correct'
                ? 'border-emerald-500 ring-emerald-500/50 bg-emerald-500/10'
                : evaluation?.status === 'partial'
                ? 'border-amber-500 ring-amber-500/50 bg-amber-500/10'
                : 'border-red-500 ring-red-500/50 bg-red-500/10'
              : 'border-slate-600 focus:border-blue-500 focus:ring-blue-500/50 hover:border-slate-500'
            }
            ${isSubmitted ? 'cursor-not-allowed' : ''}
          `}
        />

        {/* Character count / status indicator */}
        <div className="absolute bottom-2 right-2 text-xs text-slate-500">
          {isSubmitted && evaluation && (
            <span className={`
              font-semibold px-2 py-1 rounded
              ${evaluation.status === 'correct'
                ? 'text-emerald-300 bg-emerald-500/20'
                : evaluation.status === 'partial'
                ? 'text-amber-300 bg-amber-500/20'
                : 'text-red-300 bg-red-500/20'
              }
            `}>
              {Math.round(evaluation.blendedScore * 100)}%
            </span>
          )}
        </div>
      </div>

      {/* Show correct answer with character diff highlighting */}
      {isSubmitted && evaluation && evaluation.status !== 'correct' && evaluation.charDiff && (
        <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
          <div className="text-xs text-slate-400 mb-2 text-center">
            Correct answer:
          </div>
          <div
            className="text-lg font-medium text-center leading-relaxed"
            dir={inputMode === 'hebrew' ? 'rtl' : 'ltr'}
          >
            {evaluation.charDiff.map((diff, index) => (
              <span
                key={index}
                className={
                  diff.type === 'match'
                    ? 'text-slate-200'
                    : 'text-red-400 font-bold'
                }
              >
                {diff.char}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Button row: Display mode toggle and Submit */}
      {!isSubmitted && (
        <div className="flex justify-center gap-3">
          {/* Display mode toggle (if auto mode) */}
          {mode === 'auto' && (
            <button
              onClick={toggleDisplayMode}
              className="px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all duration-200 bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-slate-500"
            >
              {displayMode === 'english'
                ? t('conversation.modules.typeInput.switchToHebrew', 'Show Hebrew')
                : t('conversation.modules.typeInput.switchToEnglish', 'Show English')
              }
            </button>
          )}

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={!userInput.trim()}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium
              transition-all duration-200
              ${userInput.trim()
                ? 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed opacity-50'
              }
            `}
          >
            {t('conversation.modules.submit', 'Submit')}
          </button>
        </div>
      )}
    </div>
  );
}
