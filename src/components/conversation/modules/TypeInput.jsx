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

      setTimeout(() => {
        onResult({
          userResponse: userInput,
          isCorrect: false,
          resultType: 'incorrect',
          suggestedAnswer: inputMode === 'hebrew' ? line.he : line.tl
        });
      }, 1200);
      return;
    }

    setEvaluation(result);
    setIsSubmitted(true);

    // Emit result after showing feedback
    setTimeout(() => {
      onResult({
        userResponse: userInput,
        isCorrect: result.status === 'correct',
        resultType: result.status,
        suggestedAnswer: result.status === 'correct' ? undefined : (inputMode === 'hebrew' ? line.he : line.tl),
        score: result.blendedScore
      });
    }, 1200);
  }, [userInput, isSubmitted, inputMode, line, onResult]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  const toggleInputMode = useCallback(() => {
    if (isSubmitted) return;
    setInputMode(prev => prev === 'hebrew' ? 'transliteration' : 'hebrew');
    setUserInput('');
    inputRef.current?.focus();
  }, [isSubmitted]);

  const getInputPlaceholder = useCallback(() => {
    if (inputMode === 'hebrew') {
      return t('conversation.modules.typeInput.placeholderHebrew', 'Type in Hebrew...');
    }
    return t('conversation.modules.typeInput.placeholderTranslit', 'Type the transliteration...');
  }, [inputMode, t]);

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      {/* Instructions */}
      <div className="text-center">
        <h3 className="text-xl font-semibold text-slate-200 mb-2">
          {t('conversation.modules.typeInput.instruction', 'Type the answer')}
        </h3>
        <p className="text-slate-400">
          {inputMode === 'hebrew'
            ? t('conversation.modules.typeInput.hintHebrew', 'Type the Hebrew phrase')
            : t('conversation.modules.typeInput.hintTranslit', 'Type the transliteration (pronunciation)')
          }
        </p>
      </div>

      {/* Context - show English meaning */}
      <div className="p-6 bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-xl border border-blue-700/50">
        <div className="text-sm font-medium text-slate-400 mb-2 text-center">
          {t('conversation.modules.typeInput.contextLabel', 'You want to say:')}
        </div>
        <div className="text-2xl font-semibold text-slate-100 text-center">
          {line.en}
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

      {/* Input mode toggle (if auto mode) */}
      {mode === 'auto' && (
        <div className="flex justify-center">
          <button
            onClick={toggleInputMode}
            disabled={isSubmitted}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium
              border-2 transition-all duration-200
              ${isSubmitted
                ? 'bg-slate-700 border-slate-600 text-slate-500 cursor-not-allowed'
                : 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-slate-500'
              }
            `}
          >
            {inputMode === 'hebrew'
              ? t('conversation.modules.typeInput.switchToTranslit', 'Switch to transliteration')
              : t('conversation.modules.typeInput.switchToHebrew', 'Switch to Hebrew')
            }
          </button>
        </div>
      )}

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

      {/* Submit button */}
      {!isSubmitted && (
        <button
          onClick={handleSubmit}
          disabled={!userInput.trim()}
          className={`
            py-3 px-6 rounded-lg font-semibold text-lg
            transition-all duration-200
            ${userInput.trim()
              ? 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer hover:scale-105 active:scale-95'
              : 'bg-slate-700 text-slate-500 cursor-not-allowed opacity-50'
            }
          `}
        >
          {t('conversation.modules.submit', 'Submit')}
        </button>
      )}

      {/* Feedback */}
      {isSubmitted && evaluation && (
        <div className="flex flex-col gap-3">
          {/* Status message */}
          <div className={`
            p-4 rounded-lg text-center font-medium
            ${evaluation.status === 'correct'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
              : evaluation.status === 'partial'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
              : 'bg-red-500/20 text-red-300 border border-red-500/50'
            }
          `}>
            {evaluation.status === 'correct' ? (
              <div>
                <div className="text-2xl mb-1">✅</div>
                <div>{t('conversation.modules.correct', 'Correct!')}</div>
              </div>
            ) : evaluation.status === 'partial' ? (
              <div>
                <div className="text-2xl mb-1">⚠️</div>
                <div>{t('conversation.modules.partial', 'Close! Check the correct answer below.')}</div>
              </div>
            ) : (
              <div>
                <div className="text-2xl mb-1">❌</div>
                <div>{t('conversation.modules.incorrect', 'Not quite. Here\'s the correct answer:')}</div>
              </div>
            )}
          </div>

          {/* Show correct answer if not perfect */}
          {evaluation.status !== 'correct' && (
            <div className="p-5 bg-slate-800/50 rounded-lg border border-slate-700">
              <div className="text-sm font-medium text-slate-400 mb-3 text-center">
                {t('conversation.modules.typeInput.correctAnswer', 'Correct answer:')}
              </div>

              <div className="flex flex-col gap-3">
                {/* Hebrew */}
                <div className="text-center">
                  <div className="text-xs text-slate-500 mb-1">
                    {t('conversation.modules.typeInput.hebrew', 'Hebrew')}
                  </div>
                  <div className="text-2xl font-semibold text-slate-100" dir="rtl">
                    {line.he}
                  </div>
                </div>

                {/* Transliteration */}
                <div className="text-center">
                  <div className="text-xs text-slate-500 mb-1">
                    {t('conversation.modules.typeInput.transliteration', 'Transliteration')}
                  </div>
                  <div className="text-lg text-blue-300 italic">
                    {line.tl}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hint for new users */}
      {!isSubmitted && !userInput && (
        <div className="text-center text-sm text-slate-500 italic">
          {t('conversation.modules.typeInput.hint', 'Tip: Listen to the audio for pronunciation help')}
        </div>
      )}
    </div>
  );
}
