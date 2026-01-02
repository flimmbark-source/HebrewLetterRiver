import { useState, useEffect, useCallback, useRef } from 'react';
import ttsService from '../lib/ttsService';

/**
 * SpeakButton Component
 *
 * A button that triggers text-to-speech for the current word or sentence.
 * Automatically handles voice selection and fallback to transliteration.
 *
 * Props:
 * @param {string} nativeText - Text in native script (e.g., "שלום")
 * @param {string} nativeLocale - BCP 47 locale (e.g., "he-IL", "es-ES")
 * @param {string} transliteration - Romanized text (e.g., "shalom")
 * @param {string} [variant] - "icon" | "iconWithLabel" (default: "icon")
 * @param {string} [sentenceNativeText] - Full sentence in native script (for long press)
 * @param {string} [sentenceTransliteration] - Full sentence transliteration (for long press)
 * @param {string} [className] - Additional CSS classes
 * @param {boolean} [disabled] - Disable the button
 */
export default function SpeakButton({
  nativeText,
  nativeLocale,
  transliteration,
  variant = 'icon',
  sentenceNativeText,
  sentenceTransliteration,
  className = '',
  disabled = false,
}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [wasLongPress, setWasLongPress] = useState(false);
  const touchHandledRef = useRef(false);
  const longPressTimerRef = useRef(null);

  // Subscribe to TTS events
  useEffect(() => {
    const unsubscribe = ttsService.addListener((eventType) => {
      if (eventType === 'start') {
        setIsSpeaking(true);
      } else if (eventType === 'end' || eventType === 'cancel' || eventType === 'error') {
        setIsSpeaking(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      ttsService.stop();
    };
  }, []);

  // Handle click - speak the word
  const handleClick = useCallback((e) => {
    // Don't trigger if this was a long press (already handled)
    if (wasLongPress) {
      setWasLongPress(false);
      return;
    }

    // Skip if we just handled this via touch event (avoid double-trigger from synthetic click)
    if (touchHandledRef.current) {
      touchHandledRef.current = false;
      return;
    }

    // Only stop propagation, don't prevent default to preserve user gesture
    e.stopPropagation();

    if (disabled || !nativeText) return;

    ttsService.speakSmart({
      nativeText,
      nativeLocale,
      transliteration,
      mode: 'word',
    });
  }, [nativeText, nativeLocale, transliteration, disabled, wasLongPress]);

  // Handle long press start
  const handlePressStart = useCallback((e) => {
    if (disabled) return;

    const timer = setTimeout(() => {
      // Long press triggered - speak sentence if available
      if (sentenceNativeText || sentenceTransliteration) {
        setWasLongPress(true);
        ttsService.speakSmart({
          nativeText: sentenceNativeText || nativeText,
          nativeLocale,
          transliteration: sentenceTransliteration || transliteration,
          mode: 'sentence',
        });
      }
      longPressTimerRef.current = null;
    }, 500); // 500ms long press threshold

    longPressTimerRef.current = timer;
  }, [sentenceNativeText, sentenceTransliteration, nativeText, nativeLocale, transliteration, disabled]);

  // Handle long press cancel
  const handlePressEnd = useCallback((e) => {
    if (longPressTimerRef.current) {
      // Timer still active means it was a short press (< 500ms)
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;

      // For touch events, trigger speech directly (required for mobile user gesture)
      if (e && e.type && e.type.startsWith('touch')) {
        if (!disabled && nativeText) {
          touchHandledRef.current = true;
          ttsService.speakSmart({
            nativeText,
            nativeLocale,
            transliteration,
            mode: 'word',
          });
        }
      }
      // For mouse events, let the click handler deal with it
    }
  }, [disabled, nativeText, nativeLocale, transliteration]);

  // Button styles
  const baseStyles = `
    inline-flex items-center justify-center gap-2
    rounded-lg border border-slate-700 bg-slate-800/50
    font-medium text-slate-200
    transition-all duration-150
    hover:bg-slate-700 hover:border-slate-600
    active:scale-95
    disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-slate-800/50
  `;

  const sizeStyles = variant === 'iconWithLabel'
    ? 'px-3 py-2 text-sm'
    : 'p-2 text-base';

  const speakingStyles = isSpeaking
    ? 'bg-emerald-600/20 border-emerald-500 ring-2 ring-emerald-500/50'
    : '';

  return (
    <button
      onClick={handleClick}
      onMouseDown={handlePressStart}
      onMouseUp={handlePressEnd}
      onMouseLeave={handlePressEnd}
      onTouchStart={handlePressStart}
      onTouchEnd={handlePressEnd}
      onTouchCancel={handlePressEnd}
      disabled={disabled}
      className={`${baseStyles} ${sizeStyles} ${speakingStyles} ${className}`}
      style={{
        // Hit slop for better touch targets
        minWidth: '40px',
        minHeight: '40px',
      }}
      aria-label={variant === 'icon' ? 'Speak text' : undefined}
      title={sentenceNativeText || sentenceTransliteration ? 'Click: speak word, Long press: speak sentence' : 'Speak word'}
    >
      {/* Speaker Icon */}
      <span className={`text-lg ${isSpeaking ? 'animate-pulse' : ''}`}>
        {isSpeaking ? '🔊' : '🔈'}
      </span>

      {/* Label (only for iconWithLabel variant) */}
      {variant === 'iconWithLabel' && (
        <span>{isSpeaking ? 'Speaking...' : 'Speak'}</span>
      )}
    </button>
  );
}
