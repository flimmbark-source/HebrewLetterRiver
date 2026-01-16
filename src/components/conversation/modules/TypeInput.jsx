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
  const [displayMode, setDisplayMode] = useState('english'); // Controls what's shown in "You want to say"
  const [showPopup, setShowPopup] = useState(false);
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

  const togglePopup = useCallback(() => {
    setShowPopup(prev => !prev);
  }, []);

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

      {/* Context - show based on display mode */}
      <div className="relative p-6 bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-xl border border-blue-700/50">
        <div className="text-sm font-medium text-slate-400 mb-2 text-center">
          {t('conversation.modules.typeInput.contextLabel', 'You want to say:')}
        </div>
        <div
          className="text-2xl font-semibold text-slate-100 text-center cursor-pointer hover:text-blue-300 transition-colors"
          dir={displayMode === 'hebrew' ? 'rtl' : 'ltr'}
          onClick={togglePopup}
        >
          {displayMode === 'english' ? line.en : line.he}
        </div>

        {/* Popup with Hebrew, transliteration, and meaning */}
        {showPopup && (
          <div className="absolute top-full left-0 right-0 mt-2 z-50">
            <div className="bg-slate-800 border-2 border-blue-500 rounded-lg shadow-2xl p-4">
              <button
                onClick={togglePopup}
                className="absolute top-2 right-2 text-slate-400 hover:text-slate-200 text-xl leading-none"
              >
                ×
              </button>

              <div className="flex flex-col gap-3">
                {/* Hebrew */}
                <div className="text-center border-b border-slate-700 pb-3">
                  <div className="text-xs text-slate-400 mb-1">Hebrew</div>
                  <div className="text-xl font-semibold text-slate-100" dir="rtl">
                    {line.he}
                  </div>
                </div>

                {/* Transliteration */}
                <div className="text-center border-b border-slate-700 pb-3">
                  <div className="text-xs text-slate-400 mb-1">Transliteration</div>
                  <div className="text-lg text-blue-300 italic">
                    {line.tl}
                  </div>
                </div>

                {/* English meaning */}
                <div className="text-center">
                  <div className="text-xs text-slate-400 mb-1">Meaning</div>
                  <div className="text-base text-slate-200">
                    {line.en}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

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

      {/* Display mode toggle (if auto mode) */}
      {mode === 'auto' && (
        <div className="flex justify-center">
          <button
            onClick={toggleDisplayMode}
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
            {displayMode === 'english'
              ? t('conversation.modules.typeInput.switchToHebrew', 'Show Hebrew')
              : t('conversation.modules.typeInput.switchToEnglish', 'Show English')
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
    </div>
  );
}
