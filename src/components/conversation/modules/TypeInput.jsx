import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import SpeakButton from '../../SpeakButton.jsx';
import { useLocalization } from '../../../context/LocalizationContext.jsx';
import { evaluateWithVariants } from '../../../lib/translationEvaluator.ts';
import { findDictionaryEntryForWord } from '../../../lib/sentenceDictionaryLookup.ts';
import { sentenceTransliterationLookup } from '../../../data/conversation/scenarioFactory.ts';

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
  const [clickedWordIndex, setClickedWordIndex] = useState(null); // Track which word was clicked
  const [showDictionary, setShowDictionary] = useState(false);
  const inputRef = useRef(null);
  const wordPopupRef = useRef(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Click outside to close word popup
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wordPopupRef.current && !wordPopupRef.current.contains(event.target)) {
        setClickedWordIndex(null);
      }
    };

    if (clickedWordIndex !== null) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [clickedWordIndex]);

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

  const handleWordClick = useCallback((index) => {
    setClickedWordIndex(prevIndex => prevIndex === index ? null : index);
  }, []);

  const closeWordPopup = useCallback(() => {
    setClickedWordIndex(null);
  }, []);

  const toggleDictionary = useCallback(() => {
    setShowDictionary(prev => !prev);
  }, []);

  const getInputPlaceholder = useCallback(() => {
    if (inputMode === 'hebrew') {
      return t('conversation.modules.typeInput.placeholderHebrew', 'Type in Hebrew...');
    }
    return t('conversation.modules.typeInput.placeholderTranslit', 'Type the transliteration...');
  }, [inputMode, t]);

  const hebrewSegments = useMemo(() => {
    const sentenceText = line.sentenceData.hebrew;
    const words = line.sentenceData.words;
    const segments = [];
    let cursor = 0;

    words.forEach((word, index) => {
      const start = Number.isFinite(word.start) ? word.start : sentenceText.indexOf(word.hebrew, cursor);
      const end = Number.isFinite(word.end) ? word.end : start + word.hebrew.length - 1;

      if (start > cursor) {
        segments.push({
          type: 'punct',
          text: sentenceText.slice(cursor, start),
          key: `punct-${index}-${cursor}`
        });
      }

      segments.push({
        type: 'word',
        text: sentenceText.slice(start, end + 1),
        wordIndex: index,
        key: `word-${index}`
      });

      cursor = end + 1;
    });

    if (cursor < sentenceText.length) {
      segments.push({
        type: 'punct',
        text: sentenceText.slice(cursor),
        key: `punct-tail-${cursor}`
      });
    }

    return segments;
  }, [line.sentenceData.hebrew, line.sentenceData.words]);

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

      {/* Top bar with dictionary button */}
      <div className="relative flex justify-end gap-2">
        <button
          onClick={toggleDictionary}
          className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors text-xl"
          title={t('conversation.modules.dictionary', 'Dictionary')}
        >
          📖
        </button>

        {/* Dictionary popup */}
        {showDictionary && (
          <div className="absolute top-full right-0 mt-2 z-50 w-full sm:w-96">
            <div className="bg-slate-800 border-2 border-blue-500 rounded-lg shadow-2xl p-4 max-h-96 overflow-y-auto">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold text-slate-200">
                  {t('conversation.modules.dictionaryTitle', 'Word Dictionary')}
                </h4>
                <button
                  onClick={toggleDictionary}
                  className="text-slate-400 hover:text-slate-200 text-xl leading-none"
                >
                  ×
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {line.sentenceData.words.map((word, index) => {
                  const wordId = word.wordId;

                  if (!wordId) {
                    // Fallback if no wordId
                    return (
                      <div key={index} className="p-3 bg-slate-700/50 rounded-lg">
                        <div className="text-base font-semibold text-slate-100 text-center" dir="rtl">
                          {word.hebrew}
                        </div>
                        <div className="text-xs text-slate-400 text-center mt-1">
                          {t('conversation.modules.typeInput.noWordData', 'Word details not available')}
                        </div>
                      </div>
                    );
                  }

                  const entry = findDictionaryEntryForWord(wordId, 'hebrew', 'en', t);

                  if (!entry) {
                    // Fallback if word not found in dictionary - show transliteration from lookup table
                    const transliteration = sentenceTransliterationLookup[word.hebrew];
                    return (
                      <div key={index} className="p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                        <div className="grid grid-cols-3 gap-2 text-center">
                          {/* Hebrew */}
                          <div>
                            <div className="text-xs text-slate-400 mb-1">Hebrew</div>
                            <div className="text-base font-semibold text-slate-100" dir="rtl">
                              {word.hebrew}
                            </div>
                          </div>

                          {/* Transliteration */}
                          <div>
                            <div className="text-xs text-slate-400 mb-1">Pronunciation</div>
                            <div className="text-sm text-blue-300 italic">
                              {transliteration || '—'}
                            </div>
                          </div>

                          {/* Meaning placeholder */}
                          <div>
                            <div className="text-xs text-slate-400 mb-1">Meaning</div>
                            <div className="text-sm text-slate-500 italic">
                              —
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={index} className="p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                      <div className="grid grid-cols-3 gap-2 text-center">
                        {/* Hebrew */}
                        <div>
                          <div className="text-xs text-slate-400 mb-1">Hebrew</div>
                          <div className="text-base font-semibold text-slate-100" dir="rtl">
                            {entry.practiceWord}
                          </div>
                        </div>

                        {/* Transliteration */}
                        <div>
                          <div className="text-xs text-slate-400 mb-1">Pronunciation</div>
                          <div className="text-sm text-blue-300 italic">
                            {entry.canonical}
                          </div>
                        </div>

                        {/* English meaning */}
                        <div>
                          <div className="text-xs text-slate-400 mb-1">Meaning</div>
                          <div className="text-sm text-slate-200">
                            {entry.meaning}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Context - show individual clickable words */}
      <div className="relative p-6 bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-xl border border-blue-700/50">
        <div className="text-sm font-medium text-slate-400 mb-2 text-center">
          {t('conversation.modules.typeInput.contextLabel', 'You want to say:')}
        </div>

        {/* Display words individually */}
        <div
          className="text-center text-2xl font-semibold text-slate-100 leading-relaxed"
          dir={displayMode === 'hebrew' ? 'rtl' : 'ltr'}
        >
          {displayMode === 'english' ? (
            // Show English words
            line.en.split(' ').map((word, index) => (
              <span key={index}>
                <span
                  className="cursor-pointer hover:text-blue-300 transition-colors px-0.5 py-0.5 rounded hover:bg-blue-900/30 inline-block"
                  onClick={() => handleWordClick(index)}
                >
                  {word}
                </span>
                {index < line.en.split(' ').length - 1 && ' '}
              </span>
            ))
          ) : (
            // Show Hebrew with punctuation
            hebrewSegments.map((segment) => (
              segment.type === 'word' ? (
                <span
                  key={segment.key}
                  className="cursor-pointer hover:text-blue-300 transition-colors px-0.5 py-0.5 rounded hover:bg-blue-900/30 inline-block"
                  onClick={() => handleWordClick(segment.wordIndex)}
                >
                  {segment.text}
                </span>
              ) : (
                <span key={segment.key}>{segment.text}</span>
              )
            ))
          )}
        </div>

        {/* Word popup - shows details for clicked word */}
        {clickedWordIndex !== null && line.sentenceData.words[clickedWordIndex] && (
          <div ref={wordPopupRef} className="absolute top-full left-0 right-0 mt-2 z-50">
            <div className="bg-slate-800 border-2 border-blue-500 rounded-lg shadow-2xl p-4">
              <button
                onClick={closeWordPopup}
                className="absolute top-2 right-2 text-slate-400 hover:text-slate-200 text-xl leading-none"
              >
                ×
              </button>

              {(() => {
                const word = line.sentenceData.words[clickedWordIndex];
                const wordId = word.wordId;

                if (!wordId) {
                  // Fallback if no wordId
                  return (
                    <div className="text-center">
                      <div className="text-xl font-semibold text-slate-100" dir="rtl">
                        {word.hebrew}
                      </div>
                      <div className="text-sm text-slate-400 mt-2">
                        {t('conversation.modules.typeInput.noWordData', 'Word details not available')}
                      </div>
                    </div>
                  );
                }

                const entry = findDictionaryEntryForWord(wordId, 'hebrew', 'en', t);

                if (!entry) {
                  // Fallback if word not found in dictionary - show transliteration from lookup table
                  const transliteration = sentenceTransliterationLookup[word.hebrew];
                  return (
                    <div className="flex flex-col gap-3">
                      {/* Hebrew */}
                      <div className="text-center border-b border-slate-700 pb-3">
                        <div className="text-xs text-slate-400 mb-1">Hebrew</div>
                        <div className="text-xl font-semibold text-slate-100" dir="rtl">
                          {word.hebrew}
                        </div>
                      </div>

                      {/* Transliteration */}
                      <div className="text-center border-b border-slate-700 pb-3">
                        <div className="text-xs text-slate-400 mb-1">Transliteration</div>
                        <div className="text-lg text-blue-300 italic">
                          {transliteration || '—'}
                        </div>
                      </div>

                      {/* English meaning placeholder */}
                      <div className="text-center">
                        <div className="text-xs text-slate-400 mb-1">Meaning</div>
                        <div className="text-base text-slate-500 italic">
                          —
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="flex flex-col gap-3">
                    {/* Hebrew */}
                    <div className="text-center border-b border-slate-700 pb-3">
                      <div className="text-xs text-slate-400 mb-1">Hebrew</div>
                      <div className="text-xl font-semibold text-slate-100" dir="rtl">
                        {entry.practiceWord}
                      </div>
                    </div>

                    {/* Transliteration */}
                    <div className="text-center border-b border-slate-700 pb-3">
                      <div className="text-xs text-slate-400 mb-1">Transliteration</div>
                      <div className="text-lg text-blue-300 italic">
                        {entry.canonical}
                      </div>
                    </div>

                    {/* English meaning */}
                    <div className="text-center">
                      <div className="text-xs text-slate-400 mb-1">Meaning</div>
                      <div className="text-base text-slate-200">
                        {entry.meaning}
                      </div>
                    </div>
                  </div>
                );
              })()}
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
