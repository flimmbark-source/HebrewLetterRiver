import { useState, useEffect, useRef, useCallback, Fragment } from 'react';
import { useLocalization } from '../context/LocalizationContext';
import { useLanguage } from '../context/LanguageContext';
import { getReadingTextById } from '../data/readingTexts';
import { getTextDirection, getFontClass, normalizeForLanguage } from '../lib/readingUtils';
import { gradeWithGhostSequence, calculateWordBoxWidth } from '../lib/readingGrader';
import { TRANSLATION_KEY_MAP, getLocalizedTitle, getLocalizedSubtitle } from '../lib/languageUtils';

const WORD_BOX_PADDING_CH = 0.35;
const WORD_GAP_CH = 3.25;
const WORD_GAP_WITH_PADDING_CH = WORD_GAP_CH + WORD_BOX_PADDING_CH * 2;
const MAX_WORD_BOX_CH = 18;

/**
 * ReadingArea Component
 *
 * Displays a reading comprehension exercise where users translate words
 * from their practice language to their app language by typing.
 *
 * Props:
 * - textId: ID of the reading text to display
 * - onBack: Callback when user exits reading area
 */
export default function ReadingArea({ textId, onBack }) {
  const { t } = useLocalization();
  const { languageId: practiceLanguageId, appLanguageId } = useLanguage();

  // Load reading text
  const readingText = getReadingTextById(textId);

  // State
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );
  const [wordIndex, setWordIndex] = useState(0);
  const [typedWord, setTypedWord] = useState('');
  const [committedWords, setCommittedWords] = useState([]);
  const [streak, setStreak] = useState(0);
  const [isGrading, setIsGrading] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  // Refs for track centering
  const practiceTrackRef = useRef(null);
  const practiceViewportRef = useRef(null);
  const typedTrackRef = useRef(null);
  const typedViewportRef = useRef(null);
  const ghostTrackRef = useRef(null);
  const inputRef = useRef(null);

  // Get practice and app language directions
  const practiceDirection = getTextDirection(practiceLanguageId);
  const appDirection = getTextDirection(appLanguageId);

  // Get font classes
  const practiceFontClass = getFontClass(practiceLanguageId);
  const appFontClass = getFontClass(appLanguageId);

  // Track viewport width to clamp container sizing on very small screens
  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Filter out punctuation for word navigation
  const words = readingText?.tokens?.filter(t => t.type === 'word') || [];
  const currentWord = words[wordIndex];

  // Get translation for current word
  const getTranslation = useCallback(() => {
    if (!readingText || !currentWord) return null;

    const translationsForAppLanguage = readingText.translations?.[appLanguageId];
    const translationsForLocale = readingText.translations?.[TRANSLATION_KEY_MAP[appLanguageId]];
    const translations = translationsForAppLanguage || translationsForLocale;

    if (!translations) return null;
    return translations[currentWord.id];
  }, [readingText, currentWord, appLanguageId]);

  // Center practice track on current word
  const centerPracticeTrack = useCallback((instant = false) => {
    if (!practiceTrackRef.current || !practiceViewportRef.current) return;

    const track = practiceTrackRef.current;
    const viewport = practiceViewportRef.current;

    // Find the active word element
    const activeWord = track.querySelector('[data-active="true"]');
    if (!activeWord) return;

    if (instant) {
      track.style.transition = 'none';
    }

    const viewportRect = viewport.getBoundingClientRect();
    const wordRect = activeWord.getBoundingClientRect();

    const viewportCenter = viewportRect.left + viewportRect.width / 2;
    const wordCenter = wordRect.left + wordRect.width / 2;
    const delta = wordCenter - viewportCenter;

    // Get current transform
    const transform = window.getComputedStyle(track).transform;
    const currentX = transform !== 'none'
      ? new DOMMatrixReadOnly(transform).m41
      : 0;

    const nextX = currentX - delta;
    track.style.transform = `translateX(${nextX}px)`;

    if (instant) {
      requestAnimationFrame(() => {
        track.style.transition = 'transform 260ms ease';
      });
    }
  }, []);

  // Center output track on active typing slot
  const centerOutputTrack = useCallback((instant = false) => {
    if (!typedTrackRef.current || !typedViewportRef.current) return;

    const track = typedTrackRef.current;
    const ghostTrack = ghostTrackRef.current;
    const viewport = typedViewportRef.current;

    // Find the active word box
    const activeBox = track.querySelector('[data-active="true"]');
    if (!activeBox) return;

    if (instant) {
      track.style.transition = 'none';
      if (ghostTrack) ghostTrack.style.transition = 'none';
    }

    const viewportRect = viewport.getBoundingClientRect();
    const boxRect = activeBox.getBoundingClientRect();

    const viewportCenter = viewportRect.left + viewportRect.width / 2;
    const boxCenter = boxRect.left + boxRect.width / 2;
    const delta = boxCenter - viewportCenter;

    // Get current transform
    const transform = window.getComputedStyle(track).transform;
    const currentX = transform !== 'none'
      ? new DOMMatrixReadOnly(transform).m41
      : 0;

    const nextX = currentX - delta;
    track.style.transform = `translateX(${nextX}px)`;
    if (ghostTrack) {
      ghostTrack.style.transform = `translateX(${nextX}px)`;
    }

    if (instant) {
      requestAnimationFrame(() => {
        track.style.transition = 'transform 260ms ease';
        if (ghostTrack) ghostTrack.style.transition = 'transform 260ms ease';
      });
    }
  }, []);

  // Initialize centering
  useEffect(() => {
    // Initial centering should be instant
    requestAnimationFrame(() => {
      centerPracticeTrack(true);
      centerOutputTrack(true);
    });
  }, [centerPracticeTrack, centerOutputTrack]);

  // Re-center when word index changes
  useEffect(() => {
    centerPracticeTrack(false);
  }, [wordIndex, centerPracticeTrack]);

  // Re-center output when typing
  useEffect(() => {
    centerOutputTrack(false);
  }, [typedWord, committedWords, centerOutputTrack]);

  // Focus input on mount and when grading ends
  useEffect(() => {
    if (!isGrading && inputRef.current) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isGrading]);

  // Grade and commit the current word (defined first so other callbacks can reference it)
  const gradeAndCommit = useCallback(() => {
    console.log('[DEBUG] gradeAndCommit called, isGrading:', isGrading, 'currentWord:', currentWord);
    if (isGrading || !currentWord) return;

    const translation = getTranslation();
    const typedNormalized = normalizeForLanguage(typedWord, appLanguageId);
    console.log('[DEBUG] translation:', translation);
    if (!typedNormalized) return;

    console.log('[DEBUG] Starting grading...');
    setIsGrading(true);

    const wordDef = translation || (currentWord
      ? { canonical: currentWord.text, variants: [currentWord.text] }
      : { canonical: '', variants: [] });

    const result = gradeWithGhostSequence(
      typedWord,
      wordDef,
      practiceLanguageId,
      appLanguageId
    );

    // Update streak
    if (result.isCorrect) {
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }

    // Commit to history
    const wordBoxWidth = Math.min(
      calculateWordBoxWidth(
        result.typedChars.length,
        result.ghostSequence.length
      ),
      MAX_WORD_BOX_CH
    );

    setCommittedWords(prev => [...prev, {
      typed: result.typedChars,
      ghost: result.ghostSequence,
      width: wordBoxWidth,
      isCorrect: result.isCorrect
    }]);

    // Clear typed word
    setTypedWord('');

    // Advance to next word immediately (before ghost animation)
    const nextIndex = wordIndex + 1;
    if (nextIndex >= words.length) {
      // Loop back to start
      setWordIndex(0);
      setStreak(0);
      // Add extra spacing to indicate loop
      setCommittedWords(prev => [...prev, { type: 'gap', width: 6 }]);
    } else {
      setWordIndex(nextIndex);
    }

    // Animate ghost letters
    const revealDuration = Math.max(result.ghostSequence.length, result.typedChars.length) * 75 + 120;
    setTimeout(() => {
      setIsGrading(false);
    }, revealDuration);

  }, [isGrading, currentWord, typedWord, wordIndex, words.length, getTranslation, practiceLanguageId, appLanguageId]);

  // Handle input change (for mobile typing)
  const handleInputChange = useCallback((e) => {
    if (isGrading) return;
    setTypedWord(e.target.value);
  }, [isGrading]);

  const focusInput = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Shared keyboard handler for both focused input and document listener (desktop)
  const processKeyDown = useCallback((e) => {
    if (isGrading) return;

    const key = e.key;

    // Backspace - delete last character
    if (key === 'Backspace') {
      e.preventDefault();
      setTypedWord(prev => prev.slice(0, -1));
      return;
    }

    // Space - commit word
    const isSpace = key === ' ' || key === 'Space' || key === 'Spacebar' || e.code === 'Space';
    if (isSpace) {
      e.preventDefault();
      const normalized = normalizeForLanguage(typedWord, appLanguageId);
      if (!normalized) return;
      gradeAndCommit();
      return;
    }

    // Enter - also commit word
    if (key === 'Enter') {
      e.preventDefault();
      const normalized = normalizeForLanguage(typedWord, appLanguageId);
      if (!normalized) return;
      gradeAndCommit();
      return;
    }

    // Regular character input
    if (key.length === 1) {
      e.preventDefault();
      setTypedWord(prev => prev + key);
    }
  }, [isGrading, typedWord, appLanguageId, gradeAndCommit]);

  // Handle keyboard input (for desktop)
  const handleKeyDown = useCallback((e) => {
    processKeyDown(e);
  }, [processKeyDown]);

  // Handle submit button click (mobile/desktop shared)
  const handleSubmit = useCallback(() => {
    const normalized = normalizeForLanguage(typedWord, appLanguageId);
    if (!normalized || isGrading) return;
    gradeAndCommit();
  }, [typedWord, appLanguageId, isGrading, gradeAndCommit]);

  // Global keydown handler (mirrors the prototype: always listen, refocus hidden input, never gated by mobile detection)
  useEffect(() => {
    const handleDocumentKeydown = (e) => {
      // Let Tab work normally
      if (e.key === 'Tab') return;

      // Escape to go back
      if (e.key === 'Escape') {
        onBack?.();
        return;
      }

      // Keep hidden input focused so IME / keyboard routing stays consistent
      if (inputRef.current && document.activeElement !== inputRef.current) {
        inputRef.current.focus();
        processKeyDown(e);
        return;
      }
    };

    // Capture phase so space is handled before other listeners can stop it
    document.addEventListener('keydown', handleDocumentKeydown, true);
    return () => document.removeEventListener('keydown', handleDocumentKeydown, true);
  }, [onBack, processKeyDown]);

  if (!readingText) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 text-slate-200">
        <p>{t('reading.textNotFound')}</p>
        <button
          onClick={onBack}
          className="mt-4 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 hover:bg-slate-700"
        >
          {t('reading.back')}
        </button>
      </div>
    );
  }

  const title = getLocalizedTitle(readingText, appLanguageId);
  const subtitle = getLocalizedSubtitle(readingText, appLanguageId);

  const activeChars = normalizeForLanguage(typedWord, appLanguageId).split('');
  const activeWordWidth = Math.min(Math.max(activeChars.length + 1, 2), MAX_WORD_BOX_CH);
  const containerMaxWidth = Math.max(Math.min(viewportWidth - 24, 1280), 320);
  const responsiveContainerStyle = { maxWidth: `${containerMaxWidth}px` };

    return (
      <div
        className="mx-auto w-full min-w-0 space-y-4 overflow-x-hidden px-3 sm:space-y-5 sm:px-4"
        style={responsiveContainerStyle}
      >
      {/* Header */}
        <section className="w-full max-w-full overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 p-3 text-slate-200 shadow-lg shadow-slate-950/40 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white sm:text-2xl">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-400 sm:text-base">{subtitle}</p>
          </div>
          <div className="flex flex-wrap gap-2 sm:flex-nowrap">
            <button
              onClick={onBack}
              className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium hover:bg-slate-700"
            >
              {t('reading.back')}
            </button>
            <button
              onClick={() => setShowAnswer(!showAnswer)}
              className="rounded-lg border border-slate-700 bg-transparent px-4 py-2 text-sm font-medium hover:bg-slate-800"
            >
              {showAnswer ? t('reading.hideAnswer') : t('reading.showAnswer')}
            </button>
          </div>
        </div>
      </section>

        {/* Reading Area */}
          <section
            className="relative w-full max-w-full min-w-0 overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 p-3 text-slate-200 shadow-lg shadow-slate-950/40 sm:p-6"
            onClick={focusInput}
          >
        {/* HUD */}
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm">
            <span className="text-slate-400">{t('reading.streak')}</span>
            <strong className="text-emerald-400">{streak}</strong>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/50 px-4 py-2 text-sm">
            <span className={`${appFontClass} text-base font-medium text-white`}>
              {getTranslation()?.canonical || '—'}
            </span>
          </div>
          <div className="rounded-full border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-slate-400">
            Press Enter
          </div>
        </div>

        {/* Practice Track */}
            <div className="mb-3 w-full max-w-full overflow-hidden rounded-2xl border border-slate-700 bg-gradient-to-b from-slate-800/90 to-slate-900/90 shadow-lg">
            <div
              ref={practiceViewportRef}
              className="relative flex w-full min-w-0 items-center overflow-hidden px-2 py-3 sm:px-4 sm:py-6"
              style={{ minHeight: '72px' }}
            >
              <div
                ref={practiceTrackRef}
                className="inline-flex items-center gap-4 sm:gap-6 transition-transform duration-[260ms] ease-out"
                style={{ willChange: 'transform' }}
                dir={practiceDirection}
              >
              {readingText.tokens.map((token, idx) => {
                if (token.type === 'punct') {
                  return (
                      <span
                        key={`punct-${idx}`}
                        className="text-3xl opacity-40 sm:text-4xl"
                        style={{ letterSpacing: '0.4px' }}
                      >
                        {token.text}
                      </span>
                  );
                }

                const wordIdx = words.findIndex(w => w.id === token.id);
                const isActive = wordIdx === wordIndex;

                return (
                  <span
                    key={token.id || idx}
                    className={`${practiceFontClass} text-3xl leading-tight transition-opacity sm:text-4xl ${
                      isActive ? 'opacity-100' : 'opacity-50'
                    }`}
                    style={{ letterSpacing: '0.4px', transform: 'translateY(1px)' }}
                    data-active={isActive}
                  >
                    {token.text}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Output Track */}
          <div className="w-full max-w-full min-w-0 overflow-hidden rounded-2xl border border-slate-700 bg-gradient-to-b from-slate-900/95 to-slate-950/95 shadow-lg">
          <div className="p-3 sm:p-4">
            <div
              ref={typedViewportRef}
              className="w-full min-w-0 overflow-hidden"
            >
              {/* Typed Row */}
              <div className="flex min-w-0 items-end whitespace-nowrap" dir={appDirection}>
                <div
                  ref={typedTrackRef}
                  className="inline-flex items-end transition-transform duration-[260ms] ease-out"
                  style={{ willChange: 'transform' }}
                >
                  {committedWords.map((word, idx) => (
                    <Fragment key={`typed-frag-${idx}`}>
                      {word.type === 'gap' ? (
                        <span
                          className="inline-block"
                          style={{ width: `${word.width}ch` }}
                        >
                          {' '}
                        </span>
                      ) : (
                        <WordBox
                          chars={word.typed}
                          width={word.width}
                          fontClass={appFontClass}
                        />
                      )}
                      {idx < committedWords.length - 1 && <WordGap />}
                    </Fragment>
                  ))}
                  {committedWords.length > 0 && <WordGap width={WORD_GAP_WITH_PADDING_CH} />}
                  {/* Active typing box */}
                  <ActiveWordBox
                    chars={activeChars}
                    fontClass={appFontClass}
                    showCaret={!isGrading}
                    width={activeWordWidth}
                  />
                </div>
              </div>

              {/* Ghost Row */}
              <div className="mt-1 flex items-end whitespace-nowrap" dir={appDirection}>
                <div
                  ref={ghostTrackRef}
                  className="inline-flex items-end transition-transform duration-[260ms] ease-out"
                  style={{ willChange: 'transform' }}
                >
                  {committedWords.map((word, idx) => (
                    <Fragment key={`ghost-frag-${idx}`}>
                      {word.type === 'gap' ? (
                        <span
                          className="inline-block"
                          style={{ width: `${word.width}ch` }}
                        >
                          {' '}
                        </span>
                      ) : (
                        <GhostWordBox
                          ghost={word.ghost}
                          width={word.width}
                          fontClass={appFontClass}
                          delay={idx === committedWords.length - 1 ? 0 : -1}
                        />
                      )}
                      {idx < committedWords.length - 1 && <WordGap />}
                    </Fragment>
                  ))}
                  {committedWords.length > 0 && <WordGap width={WORD_GAP_WITH_PADDING_CH} />}
                  {/* Active ghost box (empty) */}
                  <div
                    className="box-border inline-block align-bottom"
                    style={{ width: `${activeWordWidth}ch`, maxWidth: `${MAX_WORD_BOX_CH}ch`, paddingInline: 0 }}
                    data-active="true"
                  >
                    <span className="inline-block min-w-[1ch] text-center font-mono text-2xl leading-none">
                      {' '}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Invisible but focusable input for all viewports */}
        <input
          ref={inputRef}
          type="text"
          value={typedWord}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={isGrading}
          placeholder={t('reading.typeHere')}
          className={`${appFontClass} pointer-events-none absolute inset-x-3 bottom-3 h-10 w-[calc(100%-24px)] rounded opacity-0`}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck="false"
          inputMode="latin-prose"
          aria-label={t('reading.typeHere')}
          style={{ transform: 'translateZ(0)' }}
        />

        {/* Answer Display */}
        {showAnswer && (
          <div className="mt-3 text-sm text-slate-400">
            {t('reading.answer')}:{' '}
            <span className="rounded bg-slate-800 px-2 py-1 font-mono text-slate-300">
              {getTranslation()?.canonical || '—'}
            </span>
            {getTranslation()?.variants && getTranslation().variants.length > 1 && (
              <span className="ml-2">
                ({t('reading.accepted')}: {getTranslation().variants.join(', ')})
              </span>
            )}
          </div>
        )}
        </section>
      </div>
    );
  }

// Word box for committed typed words
function WordBox({ chars, width, fontClass }) {
  return (
    <span
      className="box-border inline-block align-bottom"
      style={{ width: `${width}ch`, maxWidth: `${MAX_WORD_BOX_CH}ch`, paddingInline: `${WORD_BOX_PADDING_CH}ch` }}
    >
      <span className="inline-flex">
        {chars.map((char, i) => (
          <span
            key={i}
            className={`${fontClass} inline-block min-w-[1ch] text-center font-mono text-2xl leading-none text-white`}
          >
            {char}
          </span>
        ))}
      </span>
    </span>
  );
}

// Active word box with caret
function ActiveWordBox({ chars, fontClass, showCaret, width }) {
  const resolvedWidth = width ?? Math.max(chars.length + 1, 2);

  return (
    <span
      className="box-border inline-block align-bottom drop-shadow-lg"
      style={{ width: `${resolvedWidth}ch`, maxWidth: `${MAX_WORD_BOX_CH}ch`, paddingInline: `${WORD_BOX_PADDING_CH}ch` }}
      data-active="true"
    >
      <span className="inline-flex">
        {chars.map((char, i) => (
          <span
            key={i}
            className={`${fontClass} inline-block min-w-[1ch] text-center font-mono text-2xl leading-none text-white`}
          >
            {char}
          </span>
        ))}
        {showCaret && (
          <span className="inline-block min-w-[1ch] animate-pulse text-center font-mono text-2xl leading-none text-orange-400">
            |
          </span>
        )}
      </span>
    </span>
  );
}

// Ghost word box with color-coded feedback
function GhostWordBox({ ghost, width, fontClass, delay }) {
  return (
    <span
      className="box-border inline-block align-bottom"
      style={{ width: `${width}ch`, maxWidth: `${MAX_WORD_BOX_CH}ch`, paddingInline: `${WORD_BOX_PADDING_CH}ch` }}
    >
      <span className="inline-flex">
        {ghost.map((g, i) => (
          <GhostChar
            key={i}
            char={g.char}
            cls={g.cls}
            fontClass={fontClass}
            delay={delay >= 0 ? delay + i * 75 : -1}
          />
        ))}
      </span>
    </span>
  );
}

// Individual ghost character with animation
function GhostChar({ char, cls, fontClass, delay }) {
  const [visible, setVisible] = useState(delay < 0);

  useEffect(() => {
    if (delay >= 0) {
      const timer = setTimeout(() => setVisible(true), delay);
      return () => clearTimeout(timer);
    }
  }, [delay]);

  const colorClass = {
    ok: 'text-emerald-400',
    bad: 'text-rose-400',
    miss: 'text-slate-500',
    extra: 'text-yellow-400'
  }[cls] || 'text-slate-500';

  return (
    <span
      className={`${fontClass} inline-block min-w-[1ch] text-center font-mono text-2xl leading-none transition-all ${colorClass} ${
        visible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
      }`}
      style={{ transitionDuration: '160ms' }}
    >
      {visible ? char : ' '}
    </span>
  );
}

// Gap between words
function WordGap({ width = WORD_GAP_CH }) {
  return (
    <span className="inline-block" style={{ width: `${width}ch` }}>
      {' '}
    </span>
  );
}
