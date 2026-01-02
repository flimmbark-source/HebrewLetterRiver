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
  const lastInteractionRef = useRef(0);

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

  // Simple speak function
  const speak = useCallback(() => {
    if (disabled || !nativeText) return;

    // Always refresh the synth reference (cheap/no-op on desktop).
    // On mobile this prevents the synth from becoming stuck after the first playback.
    ttsService.initTts().catch((err) => console.error('[SpeakButton] Failed to init TTS', err));

    // If voices are not ready yet, the init call will kick off loading
    // and we should avoid speaking during this gesture to preserve the
    // user-gesture chain on mobile browsers.
    if (!ttsService.getIsInitialized()) {
      return;
    }

    // Some mobile browsers require an explicit resume before each utterance
    // once the engine has been suspended, otherwise subsequent taps are
    // ignored after the first successful playback.
    ttsService.resume();

    ttsService.speakSmart({
      nativeText,
      nativeLocale,
      transliteration,
      mode: 'word',
    });
  }, [nativeText, nativeLocale, transliteration, disabled]);

  // Handle touch events (mobile)
  const handleTouch = useCallback((e) => {
    lastInteractionRef.current = Date.now();
    speak();
  }, [speak]);

  // Handle click events (desktop, or as fallback)
  const handleClick = useCallback((e) => {
    // If we just handled a touch event, skip the synthetic click
    if (Date.now() - lastInteractionRef.current < 500) {
      return;
    }

    e.stopPropagation();
    speak();
  }, [speak]);

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
      onTouchEnd={handleTouch}
      disabled={disabled}
      className={`${baseStyles} ${sizeStyles} ${speakingStyles} ${className}`}
      style={{
        // Hit slop for better touch targets
        minWidth: '40px',
        minHeight: '40px',
      }}
      aria-label={variant === 'icon' ? 'Speak text' : undefined}
      title="Speak word"
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
