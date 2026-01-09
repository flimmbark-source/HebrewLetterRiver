import { useState, useEffect, useRef, useCallback, Fragment } from 'react';
import { useLocalization } from '../context/LocalizationContext';
import { useLanguage } from '../context/LanguageContext';
import { getReadingTextById } from '../data/readingTexts/index.js';
import { getTextDirection, getFontClass, normalizeForLanguage } from '../lib/readingUtils';
import { gradeWithGhostSequence, calculateWordBoxWidth } from '../lib/readingGrader';
import { TRANSLATION_KEY_MAP, getLocalizedTitle, getLocalizedSubtitle, getLanguageCode, getLocaleForTts } from '../lib/languageUtils';
import { saveReadingResults } from '../lib/readingResultsStorage';
import SpeakButton from './SpeakButton';
import ttsService from '../lib/ttsService';
import { deriveLayoutFromTransliteration } from '../lib/vowelLayoutDerivation.js';
import { VowelLayoutIcon } from './reading/VowelLayoutIcon.jsx';
import VowelLayoutTeachingModal from './reading/VowelLayoutTeachingModal.jsx';
import VowelLayoutSystemModal from './reading/VowelLayoutSystemModal.jsx';
import { isLayoutLearned, hasShownSystemIntro, setShownSystemIntro } from '../lib/vowelLayoutProgress.js';
import WordHelperModal from './WordHelperModal.jsx';

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
 * - mode: 'word' (default) for word-by-word practice, 'sentence' for sentence viewing
 */
export default function ReadingArea({ textId, onBack, mode = 'word' }) {
  const { t } = useLocalization();
  const { languageId: practiceLanguageId, appLanguageId } = useLanguage();

  // Load reading text
  const readingText = getReadingTextById(textId, practiceLanguageId);

  // Check if we're in sentence mode
  const isSentenceMode = mode === 'sentence';

  // State
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );
  const [wordIndex, setWordIndex] = useState(0);
  const [viewingWordIndex, setViewingWordIndex] = useState(isSentenceMode ? 0 : null); // In sentence mode, start with first word selected
  const [typedWord, setTypedWord] = useState('');
  const [committedWords, setCommittedWords] = useState([]);
  const [streak, setStreak] = useState(0);
  const [isGrading, setIsGrading] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [completedResults, setCompletedResults] = useState([]);
  const [gameFont, setGameFont] = useState('default');
  const [teachingTransliteration, setTeachingTransliteration] = useState(null);
  const [showSystemModal, setShowSystemModal] = useState(false);
  const [helperWord, setHelperWord] = useState(null);
  const [helperHint, setHelperHint] = useState('');
  const [showMeaning, setShowMeaning] = useState(!isSentenceMode); // Hide meaning initially in sentence mode

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
  const appFontClass = getFontClass(appLanguageId);

  // Compute game font class - apply to all languages
  const gameFontClass = gameFont !== 'default' ? `game-font-${gameFont}` : '';

  // Only use language-specific font if no game font is selected
  // This prevents CSS conflicts between the two font classes
  const practiceFontClass = gameFontClass ? '' : getFontClass(practiceLanguageId);

  // Debug: log when font changes
  useEffect(() => {
    console.log('[ReadingArea] gameFont state:', gameFont);
    console.log('[ReadingArea] computed gameFontClass:', gameFontClass);
    console.log('[ReadingArea] practiceFontClass:', practiceFontClass);
  }, [gameFont, gameFontClass, practiceFontClass]);

  // Load game font from settings
  useEffect(() => {
    const loadGameFont = () => {
      try {
        const saved = localStorage.getItem('gameSettings');
        console.log('[ReadingArea] Raw localStorage value:', saved);
        if (saved) {
          const settings = JSON.parse(saved);
          console.log('[ReadingArea] Parsed settings:', settings);
          const fontValue = settings.gameFont ?? 'default';
          console.log('[ReadingArea] Setting game font to:', fontValue);
          setGameFont(fontValue);
        } else {
          console.log('[ReadingArea] No gameSettings in localStorage');
        }
      } catch (e) {
        console.error('Failed to load game font setting', e);
      }
    };

    loadGameFont();

    // Listen for settings changes
    window.addEventListener('gameSettingsChanged', loadGameFont);
    return () => window.removeEventListener('gameSettingsChanged', loadGameFont);
  }, []);

  // Show vowel layout system modal on first entry (Hebrew only, global)
  useEffect(() => {
    if (practiceLanguageId === 'hebrew' && !hasShownSystemIntro()) {
      setShowSystemModal(true);
      setShownSystemIntro();
    }
  }, [practiceLanguageId]);

  // Track viewport width to clamp container sizing on very small screens
  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Resume TTS engine when page becomes visible (Issue #7)
  // Mobile browsers suspend audio contexts when page is backgrounded
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('[ReadingArea] Page visible, ensuring TTS is ready');
        // Resume the speech engine in case it was suspended
        ttsService.resume();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Cleanup TTS on unmount or when leaving reading area
  useEffect(() => {
    return () => {
      ttsService.stop();
    };
  }, []);

  // Clear helper hint and reset viewing mode when moving to a different word
  useEffect(() => {
    setHelperHint('');
    setViewingWordIndex(null);
  }, [wordIndex]);

  // Filter out punctuation for word navigation
  const words = readingText?.tokens?.filter(t => t.type === 'word') || [];
  const currentWord = words[wordIndex];
  // Viewing word is the word being displayed (for swipe navigation)
  const effectiveViewingIndex = viewingWordIndex !== null ? viewingWordIndex : wordIndex;
  const viewingWord = words[effectiveViewingIndex];
  const isReviewMode = viewingWordIndex !== null && viewingWordIndex !== wordIndex;

  // Get translation for current word
  const getTranslation = useCallback(() => {
    if (!readingText || !currentWord) return null;

    const translationsForAppLanguage = readingText.translations?.[appLanguageId];
    const translationsForLocale = readingText.translations?.[TRANSLATION_KEY_MAP[appLanguageId]];
    const translations = translationsForAppLanguage || translationsForLocale;

    // In word practice mode: grade against transliteration (pronunciation)
    // In sentence mode: grade against translation (meaning)
    const transliterationEntry = readingText.translations?.en?.[currentWord.id];

    // DEBUG: Log translation lookup for first word
    if (currentWord.id === 'so' || currentWord.id === 'but' || currentWord.id === 'I') {
      console.log(`[ReadingArea DEBUG] Getting translation for "${currentWord.id}":`, {
        appLanguageId,
        locale: TRANSLATION_KEY_MAP[appLanguageId],
        hasTranslationsForAppLanguage: !!translationsForAppLanguage,
        hasTranslationsForLocale: !!translationsForLocale,
        translations: translations?.[currentWord.id],
        transliterationEntry,
        fallback: !translations ? currentWord.text : null
      });
    }

    if (!translations && !transliterationEntry) {
      console.warn(`[ReadingArea] No translations found for appLanguageId=${appLanguageId}, falling back to practice word text`);
      return null;
    }

    const baseTranslation = translations?.[currentWord.id];

    // In sentence mode, use glosses (meanings) instead of translations (transliterations)
    if (isSentenceMode) {
      // Get gloss from glosses object
      const langCode = getLanguageCode(appLanguageId);
      const gloss = readingText.glosses?.[langCode]?.[currentWord.id]
                 ?? readingText.glosses?.en?.[currentWord.id];

      if (gloss) {
        // Parse gloss to get variants (glosses can be like "hello, peace" or just "I")
        const glossVariants = gloss.split(',').map(v => v.trim());
        return {
          canonical: glossVariants[0],
          variants: glossVariants
        };
      }

      // Fallback to base translation if no gloss available
      return baseTranslation;
    }

    // In word practice mode, prefer transliteration canonical/variants when available,
    // but keep all other variants (including meaning translations) so they remain accepted.
    if (transliterationEntry) {
      const translitVariants = transliterationEntry.variants || [transliterationEntry.canonical];
      const baseVariants = baseTranslation?.variants || (baseTranslation?.canonical ? [baseTranslation.canonical] : []);

      return {
        ...baseTranslation,
        canonical: transliterationEntry.canonical,
        variants: [...new Set([...translitVariants, ...baseVariants])]
      };
    }

    return baseTranslation;
  }, [readingText, currentWord, appLanguageId, isSentenceMode]);

  // Get transliteration for TTS (always use English transliteration for pronunciation)
  const getTransliteration = useCallback(() => {
    if (!readingText || !currentWord) return '';
    const transliterationEntry = readingText.translations?.en?.[currentWord.id];
    return transliterationEntry?.canonical || currentWord.text || '';
  }, [readingText, currentWord]);

  // Get translation for viewing word (used for display during swipe navigation)
  const getViewingTranslation = useCallback(() => {
    if (!readingText || !viewingWord) return null;

    const translationsForAppLanguage = readingText.translations?.[appLanguageId];
    const translationsForLocale = readingText.translations?.[TRANSLATION_KEY_MAP[appLanguageId]];
    const translations = translationsForAppLanguage || translationsForLocale;

    const transliterationEntry = readingText.translations?.en?.[viewingWord.id];

    if (!translations && !transliterationEntry) {
      return null;
    }

    const baseTranslation = translations?.[viewingWord.id];

    // In sentence mode, use glosses (meanings) instead of translations (transliterations)
    if (isSentenceMode) {
      // Get gloss from glosses object
      const langCode = getLanguageCode(appLanguageId);
      const gloss = readingText.glosses?.[langCode]?.[viewingWord.id]
                 ?? readingText.glosses?.en?.[viewingWord.id];

      if (gloss) {
        // Parse gloss to get variants (glosses can be like "hello, peace" or just "I")
        const glossVariants = gloss.split(',').map(v => v.trim());
        return {
          canonical: glossVariants[0],
          variants: glossVariants
        };
      }

      // Fallback to base translation if no gloss available
      return baseTranslation;
    }

    // In word practice mode, prefer transliteration canonical/variants when available
    if (transliterationEntry) {
      const translitVariants = transliterationEntry.variants || [transliterationEntry.canonical];
      const baseVariants = baseTranslation?.variants || (baseTranslation?.canonical ? [baseTranslation.canonical] : []);

      return {
        ...baseTranslation,
        canonical: transliterationEntry.canonical,
        variants: [...new Set([...translitVariants, ...baseVariants])]
      };
    }

    return baseTranslation;
  }, [readingText, viewingWord, appLanguageId, isSentenceMode]);

  // Get transliteration for viewing word (for TTS during swipe navigation)
  const getViewingTransliteration = useCallback(() => {
    if (!readingText || !viewingWord) return '';
    const transliterationEntry = readingText.translations?.en?.[viewingWord.id];
    return transliterationEntry?.canonical || viewingWord.text || '';
  }, [readingText, viewingWord]);

  // Center practice track on current word (or viewing word during swipe)
  const centerPracticeTrack = useCallback((instant = false, targetIndex = null) => {
    if (!practiceTrackRef.current || !practiceViewportRef.current) return;

    const track = practiceTrackRef.current;
    const viewport = practiceViewportRef.current;

    // If targetIndex is specified, find that word, otherwise find the active word
    let targetWord;
    if (targetIndex !== null) {
      targetWord = track.querySelector(`[data-word-index="${targetIndex}"]`);
    } else {
      targetWord = track.querySelector('[data-active="true"]');
    }

    if (!targetWord) return;

    if (instant) {
      track.style.transition = 'none';
    }

    const viewportRect = viewport.getBoundingClientRect();
    const wordRect = targetWord.getBoundingClientRect();

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
    // Initial centering should be instant (skip in sentence mode)
    if (!isSentenceMode) {
      requestAnimationFrame(() => {
        centerPracticeTrack(true);
        centerOutputTrack(true);
      });
    }
  }, [centerPracticeTrack, centerOutputTrack, isSentenceMode]);

  // Re-center when word index changes (skip in sentence mode)
  useEffect(() => {
    if (!isSentenceMode) {
      centerPracticeTrack(false);
    }
  }, [wordIndex, centerPracticeTrack, isSentenceMode]);

  // Re-center when viewing word index changes (swipe navigation) (skip in sentence mode)
  useEffect(() => {
    if (!isSentenceMode) {
      if (viewingWordIndex !== null) {
        centerPracticeTrack(false, viewingWordIndex);
      } else {
        // When exiting review mode (viewingWordIndex becomes null), recenter on current word
        centerPracticeTrack(false, wordIndex);
      }
    }
  }, [viewingWordIndex, wordIndex, centerPracticeTrack, isSentenceMode]);

  // Re-center output when typing
  useEffect(() => {
    centerOutputTrack(false);
  }, [typedWord, committedWords, centerOutputTrack]);

  // Focus helper for hidden input
  const focusHiddenInput = useCallback(() => {
    const el = inputRef.current;
    if (!el) return;

    // On mobile, we need to focus without preventScroll to trigger keyboard
    try {
      el.focus();
    } catch {}

    // Put caret at end (or select all if you prefer)
    const end = el.value?.length ?? 0;
    try {
      el.setSelectionRange(end, end);
    } catch {}
  }, []);

  // Swipe gesture detection for word navigation
  const swipeStartX = useRef(null);
  const swipeStartY = useRef(null);
  const isDragging = useRef(false);

  const handleSwipeStart = useCallback((e) => {
    const touch = e.touches?.[0] || e;
    swipeStartX.current = touch.clientX;
    swipeStartY.current = touch.clientY;
    isDragging.current = false;
  }, []);

  const handleSwipeMove = useCallback((e) => {
    if (swipeStartX.current === null) return;

    const touch = e.touches?.[0] || e;
    const deltaX = touch.clientX - swipeStartX.current;
    const deltaY = touch.clientY - swipeStartY.current;

    // Only trigger if horizontal swipe is more significant than vertical
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 20) {
      isDragging.current = true;
      e.preventDefault();
    }
  }, []);

  const handleSwipeEnd = useCallback((e) => {
    if (swipeStartX.current === null || !isDragging.current) {
      swipeStartX.current = null;
      swipeStartY.current = null;
      isDragging.current = false;
      return;
    }

    const touch = e.changedTouches?.[0] || e;
    const deltaX = touch.clientX - swipeStartX.current;
    const deltaY = touch.clientY - swipeStartY.current;

    // Check if horizontal swipe
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      const currentViewingIndex = viewingWordIndex !== null ? viewingWordIndex : wordIndex;

      if (deltaX > 0) {
        // Swipe right - go to previous word
        const newIndex = Math.max(0, currentViewingIndex - 1);
        if (newIndex <= wordIndex) {
          setViewingWordIndex(newIndex === wordIndex ? null : newIndex);
        }
      } else {
        // Swipe left - go to next word (but not beyond current word being answered)
        const newIndex = Math.min(wordIndex, currentViewingIndex + 1);
        setViewingWordIndex(newIndex === wordIndex ? null : newIndex);
      }
    }

    swipeStartX.current = null;
    swipeStartY.current = null;
    isDragging.current = false;
  }, [viewingWordIndex, wordIndex]);

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

    // Store result for results screen
    // Primary: Use meaningKeys with i18n translation for proper localization
    let gloss = '—';
    if (readingText.meaningKeys?.[currentWord.id]) {
      gloss = t(readingText.meaningKeys[currentWord.id]);
    } else {
      // Fallback: Use glosses for semantic meaning display
      const langCode = getLanguageCode(appLanguageId);
      gloss = readingText.glosses?.[langCode]?.[currentWord.id]
              ?? readingText.glosses?.en?.[currentWord.id]
              ?? '—';
    }

    setCompletedResults(prev => [...prev, {
      wordId: currentWord.id,
      practiceWord: currentWord.text,
      typedChars: result.typedChars,
      ghostSequence: result.ghostSequence,
      gloss: gloss,
      isCorrect: result.isCorrect
    }]);

    // Clear typed word
    setTypedWord('');

    // Animate ghost letters
    const revealDuration = Math.max(result.ghostSequence.length, result.typedChars.length) * 75 + 120;

    // Advance to next word immediately (before ghost animation)
    const nextIndex = wordIndex + 1;
    if (nextIndex >= words.length) {
      // Show results screen instead of looping
      setTimeout(() => {
        setShowResults(true);
      }, revealDuration + 200);
    } else {
      setWordIndex(nextIndex);
    }
    setTimeout(() => {
      setIsGrading(false);
      // Don't need to refocus - input should stay focused (just changes from readOnly to editable)
    }, revealDuration);

  }, [isGrading, currentWord, typedWord, wordIndex, words.length, getTranslation, practiceLanguageId, appLanguageId]);

  // Handle input change (for mobile typing)
  const handleInputChange = useCallback((e) => {
    if (isGrading) return;

    // If in review mode, navigate back to current word when typing starts
    if (isReviewMode) {
      setViewingWordIndex(null);
    }

    // Hide meaning in sentence mode when typing starts
    if (isSentenceMode) {
      setShowMeaning(false);
    }

    const v = e.target.value;
    setTypedWord(v);

    // Mobile keyboards can insert at caret; keep caret at end
    requestAnimationFrame(() => {
      const el = inputRef.current;
      if (!el) return;
      const len = el.value.length;
      try {
        el.setSelectionRange(len, len);
      } catch {}
    });
  }, [isGrading, isReviewMode, isSentenceMode]);

  // Focus input on mount and when grading ends
  useEffect(() => {
    if (!isGrading && inputRef.current) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        focusHiddenInput();
      }, 100);
    }
  }, [isGrading, focusHiddenInput]);

  // Re-apply scroll-preventing focus whenever the active word changes
useEffect(() => {
  if (showResults) return;
  if (!isGrading) requestAnimationFrame(focusHiddenInput);
}, [wordIndex, isGrading, showResults, focusHiddenInput]);

  // Shared keyboard handler for both focused input and document listener (desktop)
  const processKeyDown = useCallback((e) => {
    if (isGrading) return;

    const key = e.key;

    // Backspace - delete last character
    if (key === 'Backspace') {
      e.preventDefault();
      // If in review mode, navigate back to current word when typing starts
      if (isReviewMode) {
        setViewingWordIndex(null);
      }
      // Hide meaning in sentence mode when typing starts
      if (isSentenceMode) {
        setShowMeaning(false);
      }
      setTypedWord(prev => prev.slice(0, -1));
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

    // Regular character input - must handle here because document listener
    // calls this function and returns, preventing event from reaching input
    // Accept letters, numbers, spaces, apostrophes, hyphens, etc.
    const isPrintable = key.length === 1 || key === "'" || key === '-' || key === ' ';
    const isModified = e.ctrlKey || e.metaKey || e.altKey;

    if (isPrintable && !isModified) {
      e.preventDefault();
      // If in review mode, navigate back to current word when typing starts
      if (isReviewMode) {
        setViewingWordIndex(null);
      }
      // Hide meaning in sentence mode when typing starts
      if (isSentenceMode) {
        setShowMeaning(false);
      }
      console.log('[ReadingArea] Key pressed:', key, 'Length:', key.length, 'CharCode:', key.charCodeAt(0));
      setTypedWord(prev => prev + key);
    }
  }, [isGrading, isReviewMode, isSentenceMode, typedWord, appLanguageId, gradeAndCommit]);

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

  // Handle Try Again from results screen
  const handleTryAgain = useCallback(() => {
    setShowResults(false);
    setCompletedResults([]);
    setWordIndex(0);
    setViewingWordIndex(null);
    setTypedWord('');
    setCommittedWords([]);
    setStreak(0);
    setShowAnswer(false);
    // Re-center tracks after reset (skip in sentence mode)
    if (!isSentenceMode) {
      setTimeout(() => {
        centerPracticeTrack(true);
        centerOutputTrack(true);
      }, 50);
    }
  }, [centerPracticeTrack, centerOutputTrack, isSentenceMode]);

  // Handle Back from results screen
  const handleResultsBack = useCallback(() => {
    onBack?.();
  }, [onBack]);

  // Save results to localStorage when results screen is shown
  useEffect(() => {
    if (showResults && completedResults.length > 0 && readingText) {
      const sectionId = readingText.sectionId;
      const textId = readingText.id;

      if (sectionId && textId) {
        saveReadingResults(sectionId, textId, practiceLanguageId, completedResults);
      }
    }
  }, [showResults, completedResults, readingText, practiceLanguageId]);

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
        focusHiddenInput();
        processKeyDown(e);
        return;
      }
    };

    // Capture phase so space is handled before other listeners can stop it
    document.addEventListener('keydown', handleDocumentKeydown, true);
    return () => document.removeEventListener('keydown', handleDocumentKeydown, true);
  }, [onBack, processKeyDown, focusHiddenInput]);

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

  const title = isSentenceMode
    ? t('read.sentenceReadingTitle', 'Sentence Reading')
    : getLocalizedTitle(readingText, appLanguageId);
  const subtitle = isSentenceMode
    ? t('read.sentencesIntro')
    : getLocalizedSubtitle(readingText, appLanguageId);

  // Don't normalize display - show what user actually typed (including apostrophes)
  // Normalization only happens during grading, not display
  const activeChars = typedWord.split('');
  const activeWordWidth = Math.min(Math.max(activeChars.length + 1, 2), MAX_WORD_BOX_CH);
  const containerMaxWidth = Math.max(Math.min(viewportWidth - 24, 1280), 320);
  const responsiveContainerStyle = { maxWidth: `${containerMaxWidth}px` };

    return (
      <div
        className="mx-auto w-full min-w-0 space-y-4 overflow-x-hidden px-3 sm:space-y-5 sm:px-4"
        style={responsiveContainerStyle}
      >
        {/* Reading Area */}
          <section
            className="relative w-full max-w-full min-w-0 overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 p-3 text-slate-200 shadow-lg shadow-slate-950/40 sm:p-6"
            onClick={focusHiddenInput}
            onTouchStart={focusHiddenInput}
            dir={appDirection}
          >
        {/* Practice Track */}
            <div className="mb-3 w-full max-w-full overflow-hidden rounded-2xl border border-slate-700 bg-gradient-to-b from-slate-800/90 to-slate-900/90 shadow-lg">
            <div
              ref={practiceViewportRef}
              className={`relative flex flex-col w-full min-w-0 items-center ${isSentenceMode ? 'overflow-x-auto overflow-y-hidden' : 'overflow-hidden'} px-2 py-3 sm:px-4 sm:py-6 gap-2`}
              style={{ minHeight: '72px' }}
            >
              {/* Review mode indicator - only in word practice mode */}
              {!isSentenceMode && isReviewMode && (
                <div className="w-full flex items-center justify-center px-2">
                  <div className="inline-flex items-center gap-2 rounded-full bg-cyan-500/20 px-3 py-1 border border-cyan-400/30">
                    <svg className="w-4 h-4 text-cyan-300" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                    <span className="text-xs font-medium text-cyan-300">
                      Reviewing previous word
                    </span>
                    <svg className="w-4 h-4 text-cyan-300" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </div>
                </div>
              )}
              {/* Controls row - transparent, positioned above reading word */}
              <div className="w-full grid grid-cols-3 items-center gap-3 px-2">
                {/* Left: Vowel Layout Icon (Hebrew only) */}
                <div className="flex justify-start">
                  {practiceLanguageId === 'hebrew' && viewingWord && (() => {
                    // Derive layout from viewing word's transliteration
                    const transliteration = getViewingTransliteration();
                    const layoutInfo = deriveLayoutFromTransliteration(transliteration);

                    if (!layoutInfo) return null;

                    // Check if learned
                    const isLearned = isLayoutLearned('he', layoutInfo.id);

                    return (
                      <VowelLayoutIcon
                        transliteration={transliteration}
                        size={40}
                        showNewDot={!isLearned}
                        onClick={() => setTeachingTransliteration(transliteration)}
                        accessibilityLabel="Vowel layout hint"
                        className="cursor-pointer transition-all hover:scale-110 pointer-events-auto"
                      />
                    );
                  })()}
                </div>

                {/* Center: Meaning */}
                <div className="flex items-center justify-center pointer-events-none">
                  <span className={`${appFontClass} text-base font-medium ${isReviewMode ? 'text-cyan-300' : 'text-white/90'} whitespace-nowrap`}>
                    {(() => {
                      // In sentence mode, only show meaning if showMeaning is true
                      if (isSentenceMode && !showMeaning) return '—';

                      if (!readingText || !viewingWord) return '—';

                      // Primary: Use meaningKeys with i18n translation for proper localization
                      if (readingText.meaningKeys?.[viewingWord.id]) {
                        return t(readingText.meaningKeys[viewingWord.id]);
                      }

                      // Fallback: Use glosses for semantic meaning display
                      const langCode = getLanguageCode(appLanguageId);
                      const gloss = readingText.glosses?.[langCode]?.[viewingWord.id]
                                 ?? readingText.glosses?.en?.[viewingWord.id];

                      return gloss ?? '—';
                    })()}
                  </span>
                </div>

                {/* Right: TTS */}
                <div className="flex items-center justify-end pointer-events-auto">
                  <SpeakButton
                    nativeText={viewingWord?.text || ''}
                    nativeLocale={getLocaleForTts(practiceLanguageId)}
                    transliteration={getViewingTransliteration()}
                    variant="icon"
                    disabled={!viewingWord}
                  />
                </div>
              </div>
              {helperHint && (
                <div className="w-full px-2 text-left text-xs text-amber-200">{helperHint}</div>
              )}
              {/* Reading words track */}
              <div
                className={`relative flex w-full min-w-0 items-center overflow-hidden ${isSentenceMode ? 'justify-center' : ''}`}
                onTouchStart={!isSentenceMode ? handleSwipeStart : undefined}
                onTouchMove={!isSentenceMode ? handleSwipeMove : undefined}
                onTouchEnd={!isSentenceMode ? handleSwipeEnd : undefined}
                onMouseDown={!isSentenceMode ? handleSwipeStart : undefined}
                onMouseMove={!isSentenceMode ? handleSwipeMove : undefined}
                onMouseUp={!isSentenceMode ? handleSwipeEnd : undefined}
              >
              <div
                ref={practiceTrackRef}
                className={`inline-flex items-center ${isSentenceMode ? 'gap-0.5' : 'gap-4 sm:gap-6'} ${isSentenceMode ? '' : 'transition-transform duration-[260ms] ease-out'}`}
                style={isSentenceMode ? undefined : { willChange: 'transform' }}
                dir={practiceDirection}
              >
              {readingText.tokens.map((token, idx) => {
                if (token.type === 'punct') {
                  return (
                      <span
                        key={`punct-${idx}`}
                        className={`whitespace-nowrap opacity-40 ${isSentenceMode ? 'text-lg' : 'text-3xl sm:text-4xl'}`}
                        style={{ letterSpacing: '0.4px' }}
                      >
                        {token.text}
                      </span>
                  );
                }

                const wordIdx = words.findIndex(w => w.id === token.id);
                const isActive = wordIdx === wordIndex;
                const isViewing = wordIdx === effectiveViewingIndex;
                const isAvailableForSwipe = isSentenceMode ? true : wordIdx <= wordIndex;

                return (
                  <span
                    key={token.id || idx}
                    className={`${practiceFontClass} ${gameFontClass} whitespace-nowrap leading-tight transition-all ${
                      isSentenceMode ? 'text-lg' : 'text-3xl sm:text-4xl'
                    } ${
                      isSentenceMode
                        ? isViewing
                          ? 'opacity-100 cursor-pointer text-amber-400 font-bold scale-110'
                          : 'opacity-70 cursor-pointer hover:opacity-90 hover:scale-105'
                        : isViewing
                          ? 'opacity-100 cursor-pointer hover:scale-105'
                          : isAvailableForSwipe
                            ? 'opacity-50 cursor-pointer'
                            : 'opacity-30'
                    }`}
                    style={{
                      letterSpacing: '0.4px',
                      transform: 'translateY(1px)',
                      pointerEvents: isViewing || isAvailableForSwipe ? 'auto' : 'none'
                    }}
                    data-active={isActive}
                    data-word-index={wordIdx}
                    onClick={isAvailableForSwipe ? () => {
                      if (isSentenceMode) {
                        // In sentence mode: first click selects, second click opens modal
                        if (isViewing) {
                          // Already viewing this word, open helper modal
                          setHelperWord({
                            hebrew: token.text,
                            wordId: token.id,
                            surface: token.text
                          });
                        } else {
                          // Not viewing yet, select this word and show meaning
                          setViewingWordIndex(wordIdx);
                          setShowMeaning(true);
                        }
                      } else if (isActive && !isReviewMode) {
                        // Word practice mode: open helper modal when already viewing
                        setHelperWord({
                          hebrew: token.text,
                          wordId: token.id,
                          surface: token.text
                        });
                      } else {
                        // Word practice mode: navigate to this word (or back to current if in review mode)
                        setViewingWordIndex(wordIdx === wordIndex ? null : wordIdx);
                      }
                    } : undefined}
                  >
                    {token.text}
                  </span>
                );
              })}
            </div>
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
                          direction={appDirection}
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
                    direction={appDirection}
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
                          direction={appDirection}
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
  aria-label={t('reading.typeHere')}
  autoComplete="off"
  autoCapitalize="off"
  autoCorrect="off"
  spellCheck={false}
  inputMode="text"
  dir={appDirection}
  // Position off-screen but keep real size for mobile keyboard
  className={`${appFontClass} fixed`}
  style={{
    // Position way off screen but keep normal input size
    left: '-9999px',
    top: '0',
    width: '100px',
    height: '40px',
    opacity: 0,
    // Explicit direction for mobile browsers
    direction: appDirection,
    // Prevents "visual reversal" issues with bidirectional text
    unicodeBidi: 'plaintext',
  }}
/>

        {/* Answer Display */}
        {showAnswer && (
          <div className="mt-3 text-sm text-slate-400">
            {t('reading.answer')}:{' '}
            <span className="rounded bg-slate-800 px-2 py-1 font-mono text-slate-300">
              {(() => {
                const canonical = getTranslation()?.canonical;
                return canonical && canonical !== '—'
                  ? normalizeForLanguage(canonical, appLanguageId)
                  : canonical || '—';
              })()}
            </span>
            {getTranslation()?.variants && getTranslation().variants.length > 1 && (
              <span className="ml-2">
                ({t('reading.accepted')}: {getTranslation().variants.map(v => normalizeForLanguage(v, appLanguageId)).join(', ')})
              </span>
            )}
          </div>
        )}
        </section>

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

        {/* Results Modal */}
        {showResults && (
          <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 p-4 pt-15">
            <div className="w-full max-w-4xl rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
              {/* Title */}
              <h2 className="mb-6 text-center text-2xl font-bold text-white">
                {t('reading.results.title')}
              </h2>

              {/* Results Table */}
              <div className="mb-6 max-h-[60vh] overflow-y-auto rounded-2xl border border-slate-700 bg-slate-800/50">
                <table className="w-full">
                  <thead className="sticky top-0 bg-slate-800 text-sm">
                    <tr className="border-b border-slate-700">
                      <th className="p-3 text-left font-semibold text-slate-300">
                        {t('reading.results.practiceWord')}
                      </th>
                      <th className="p-3 text-left font-semibold text-slate-300">
                        {t('reading.results.yourAnswer')}
                      </th>
                      <th className="p-3 text-left font-semibold text-slate-300">
                        {t('reading.results.translation')}
                      </th>
                      <th className="p-3 text-left font-semibold text-slate-300">
                        {t('reading.results.meaning')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {completedResults.map((result, idx) => (
                      <tr key={idx} className="border-b border-slate-700/50 last:border-0">
                        {/* Practice Word */}
                        <td className="p-3">
                          <span className={`${practiceFontClass} ${gameFontClass} text-xl text-white`}>
                            {result.practiceWord}
                          </span>
                        </td>
                        {/* Your Answer (raw typed text) */}
                        <td className="p-3">
                          <span className={`${appFontClass} font-mono text-base text-white`}>
                            {result.typedChars.join('')}
                          </span>
                        </td>
                        {/* Translation (Ghost with colors) */}
                        <td className="p-3">
                          <div className="inline-flex gap-0.5">
                            {result.ghostSequence.map((g, i) => {
                              const colorClass = {
                                ok: 'text-emerald-400',
                                bad: 'text-rose-400',
                                miss: 'text-slate-500',
                                extra: 'text-yellow-400'
                              }[g.cls] || 'text-slate-500';
                              return (
                                <span key={i} className={`${appFontClass} font-mono text-lg ${colorClass}`}>
                                  {g.char}
                                </span>
                              );
                            })}
                          </div>
                        </td>
                        {/* Meaning */}
                        <td className="p-3">
                          <span className={`${appFontClass} text-base text-slate-300`}>
                            {result.gloss}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Buttons */}
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleTryAgain}
                  className="rounded-lg border border-orange-600 bg-orange-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-orange-600"
                >
                  {t('reading.results.tryAgain')}
                </button>
                <button
                  onClick={handleResultsBack}
                  className="rounded-lg border border-emerald-600 bg-emerald-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-emerald-600"
                >
                  {t('reading.results.back')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Vowel Layout System Modal (general explanation) */}
        <VowelLayoutSystemModal
          isVisible={showSystemModal}
          onClose={() => setShowSystemModal(false)}
          appFontClass={appFontClass}
        />

        <WordHelperModal
          word={helperWord}
          practiceLanguageId={practiceLanguageId}
          appLanguageId={appLanguageId}
          onUseHint={setHelperHint}
          onClose={() => setHelperWord(null)}
          t={t}
        />

        {/* Vowel Layout Teaching Modal */}
        {teachingTransliteration && (
          <VowelLayoutTeachingModal
            isVisible={true}
            onClose={() => setTeachingTransliteration(null)}
            transliteration={teachingTransliteration}
            languageCode="he"
            examples={(() => {
              // Generate examples from current pack for this layout
              if (!readingText?.tokens) return [];

              // Derive layout for the current teaching transliteration
              const currentLayout = deriveLayoutFromTransliteration(teachingTransliteration);
              if (!currentLayout) return [];

              // Find all words with matching layout
              return readingText.tokens
                .filter(token => {
                  if (token.type !== 'word') return false;
                  const tokenTranslit = readingText.translations?.en?.[token.id]?.canonical;
                  if (!tokenTranslit) return false;
                  const tokenLayout = deriveLayoutFromTransliteration(tokenTranslit);
                  return tokenLayout && tokenLayout.id === currentLayout.id;
                })
                .map(token => {
                  const transliterationEntry = readingText.translations?.en?.[token.id];
                  return {
                    hebrew: token.text,
                    transliteration: transliterationEntry?.canonical || token.id,
                    meaning: readingText.meaningKeys?.[token.id]
                      ? t(readingText.meaningKeys[token.id])
                      : (readingText.glosses?.[getLanguageCode(appLanguageId)]?.[token.id] ?? token.id)
                  };
                });
            })()}
            practiceFontClass={practiceFontClass}
            appFontClass={appFontClass}
          />
        )}
      </div>
    );
  }

// Word box for committed typed words
function WordBox({ chars, width, fontClass, direction }) {
  return (
    <span
      className="box-border inline-block align-bottom"
      style={{ width: `${width}ch`, maxWidth: `${MAX_WORD_BOX_CH}ch`, paddingInline: `${WORD_BOX_PADDING_CH}ch` }}
    >
      <span className="inline-flex" style={{ direction: direction || 'ltr' }}>
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
function ActiveWordBox({ chars, fontClass, showCaret, width, direction }) {
  const resolvedWidth = width ?? Math.max(chars.length + 1, 2);

  return (
    <span
      className="box-border inline-block align-bottom drop-shadow-lg"
      style={{ width: `${resolvedWidth}ch`, maxWidth: `${MAX_WORD_BOX_CH}ch`, paddingInline: `${WORD_BOX_PADDING_CH}ch` }}
      data-active="true"
    >
      <span className="inline-flex" style={{ direction: direction || 'ltr' }}>
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
function GhostWordBox({ ghost, width, fontClass, delay, direction }) {
  return (
    <span
      className="box-border inline-block align-bottom"
      style={{ width: `${width}ch`, maxWidth: `${MAX_WORD_BOX_CH}ch`, paddingInline: `${WORD_BOX_PADDING_CH}ch` }}
    >
      <span className="inline-flex" style={{ direction: direction || 'ltr' }}>
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
