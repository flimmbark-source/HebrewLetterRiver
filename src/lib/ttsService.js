/**
 * TTS Service using Web Speech API
 *
 * Provides text-to-speech functionality for reading mode.
 * Supports native language voices with automatic fallback to English transliteration.
 */

class TtsService {
  constructor() {
    this.synth = null;
    this.voices = [];
    this.isInitialized = false;
    this.isSpeaking = false;
    this.currentUtterance = null;
    this.listeners = new Set();
  }

  /**
   * Detect if we're on a mobile device
   */
  isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  /**
   * Initialize the TTS engine and load available voices
   * On mobile, always reinitialize to prevent suspended state after first playback
   * Returns synchronously after first initialization to preserve user gesture chain
   */
  initTts() {
    if (!('speechSynthesis' in window)) {
      console.warn('[TTS] Speech Synthesis API not supported in this browser');
      return Promise.resolve();
    }

    // On mobile, always get a fresh synth reference to avoid suspended state
    // But only load voices once (they don't change between calls)
    const needsVoiceLoad = !this.isInitialized;

    this.synth = window.speechSynthesis;

    // Load voices only on first initialization to avoid breaking gesture chain
    if (needsVoiceLoad) {
      const loadPromise = this.loadVoices();
      loadPromise.then(() => {
        this.isInitialized = true;
        console.log('[TTS] Initialized with', this.voices.length, 'voices');
      });
      return loadPromise;
    }

    // On subsequent calls, return synchronously (no await, no async break)
    this.isInitialized = true;
    console.log('[TTS] Reinitialized synth reference (voices already cached)');
    return Promise.resolve();
  }

  /**
   * Load available voices from the browser
   */
  async loadVoices() {
    return new Promise((resolve) => {
      // Get initial voices
      this.voices = this.synth.getVoices();
      console.log('[TTS] Initial voices loaded:', this.voices.length);

      if (this.voices.length > 0) {
        console.log('[TTS] Available voices:', this.voices.map(v => `${v.name} (${v.lang})`).join(', '));
        resolve();
        return;
      }

      // Some browsers require waiting for voiceschanged event
      const voicesChangedHandler = () => {
        this.voices = this.synth.getVoices();
        console.log('[TTS] Voices loaded via event:', this.voices.length);
        console.log('[TTS] Available voices:', this.voices.map(v => `${v.name} (${v.lang})`).join(', '));
        this.synth.removeEventListener('voiceschanged', voicesChangedHandler);
        resolve();
      };

      this.synth.addEventListener('voiceschanged', voicesChangedHandler);

      // Timeout fallback
      setTimeout(() => {
        this.voices = this.synth.getVoices();
        console.log('[TTS] Voices loaded via timeout:', this.voices.length);
        if (this.voices.length > 0) {
          console.log('[TTS] Available voices:', this.voices.map(v => `${v.name} (${v.lang})`).join(', '));
        }
        resolve();
      }, 1000);
    });
  }

  /**
   * Get all available voices
   */
  getAvailableVoices() {
    return this.voices;
  }

  normalizeLocaleTag(tag) {
    if (!tag) return '';
    return tag
      // Normalize legacy Hebrew tag used by Chrome/Android (iw-IL ➜ he-IL)
      .replace(/^iw(\b|[-_])/i, 'he$1')
      .toLowerCase();
  }

  /**
   * Pick the best voice for a given locale
   * @param {string} locale - BCP 47 language tag (e.g., "he-IL", "es-ES", "en-US")
   * @returns {SpeechSynthesisVoice|null}
   */
  pickVoiceForLocale(locale) {
    if (!locale || this.voices.length === 0) return null;

    const normalizedLocale = this.normalizeLocaleTag(locale);
    const langCode = normalizedLocale.split('-')[0]; // e.g., "he" from "he-IL"

    // Score and sort voices so we pick the most natural-sounding option
    const scoredVoices = this.voices
      .map((voice, index) => {
        const voiceLang = this.normalizeLocaleTag(voice.lang);
        const voiceLangCode = voiceLang.split('-')[0];
        const isExact = voiceLang === normalizedLocale;
        const sharesLang = voiceLangCode === langCode;
        const isGoogle = /google|chrome os/i.test(voice.name);
        const isEspeak = /espeak/i.test(voice.name);

        // Higher score = better voice
        let score = 0;
        if (isExact) score += 4; // exact locale match
        else if (sharesLang) score += 3; // same language, different region

        if (voice.localService) score += 1; // local voices are more reliable offline
        if (isGoogle) score += 2; // Google/Chrome OS voices sound clearer than eSpeak
        if (isEspeak) score -= 2; // deprioritize eSpeak voices which are often robotic/quiet

        // Tie-breaker: keep existing order (stable sort)
        return { voice, score, index };
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score || a.index - b.index);

    const voice = scoredVoices.length > 0 ? scoredVoices[0].voice : null;
    console.log('[TTS] Selected voice for', normalizedLocale, ':', voice ? `${voice.name} (${voice.lang})` : 'none');
    return voice;
  }

  /**
   * Normalize transliteration for better English TTS pronunciation
   * @param {string} text - Transliterated text
   * @returns {string} - Normalized text
   */
  normalizeTranslit(text) {
    if (!text) return '';

    return text
      .trim()
      // Remove apostrophes (e.g., "sha'alu" -> "shaalu")
      .replace(/'/g, '')
      // Turn hyphens into spaces for better pronunciation
      .replace(/-/g, ' ')
      // Collapse multiple spaces
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Smart speak: tries native voice first, falls back to English transliteration
   * IMPORTANT: This must be synchronous to preserve user gesture chain on mobile
   * @param {Object} params
   * @param {string} params.nativeText - Text in target language script
   * @param {string} params.nativeLocale - BCP 47 locale (e.g., "he-IL")
   * @param {string} params.transliteration - Romanized pronunciation
   * @param {string} [params.mode] - "word" | "sentence" (affects rate)
   */
  speakSmart({ nativeText, nativeLocale, transliteration, mode = 'word' }) {
    console.log('[TTS] speakSmart called with:', { nativeText, nativeLocale, transliteration, mode });

    // No await here! Must be synchronous for mobile user gesture
    if (!this.isInitialized || !this.synth) {
      console.warn('[TTS] Not initialized - call initTts() first from a user gesture');
      return;
    }

    // Refresh voices if empty (some browsers need this)
    if (this.voices.length === 0) {
      console.log('[TTS] No voices loaded, refreshing...');
      this.voices = this.synth.getVoices();
      console.log('[TTS] After refresh:', this.voices.length, 'voices');
    }

    // Stop any current speech and ensure synth is ready
    this.stop();

    // On mobile, always resume to prevent stuck state
    if (this.isMobile()) {
      this.synth.resume();
    } else if (this.synth.paused) {
      this.synth.resume();
    }

    // Determine what to speak and which voice to use
    let textToSpeak = nativeText;
    let voice = null;

    if (nativeLocale) {
      voice = this.pickVoiceForLocale(nativeLocale);
      console.log('[TTS] Voice for', nativeLocale, ':', voice ? `${voice.name} (${voice.lang})` : 'not found');
    }

    // Final fallback: use default system voice
    if (!voice && this.voices.length > 0) {
      voice = this.voices[0];
      console.log('[TTS] Using default voice:', voice.name, voice.lang);
    }

    if (!textToSpeak || textToSpeak === '—') {
      console.warn('[TTS] No text to speak');
      return;
    }

    console.log('[TTS] Final settings - Text:', textToSpeak, 'Voice:', voice ? voice.name : 'browser default');

    // Create utterance
    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else if (nativeLocale) {
      utterance.lang = nativeLocale;
    }

    // Set speech parameters
    utterance.rate = mode === 'sentence' ? 0.9 : 0.85; // Slightly slower for clarity
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    console.log('[TTS] Utterance created - rate:', utterance.rate, 'pitch:', utterance.pitch, 'volume:', utterance.volume, 'lang:', utterance.lang);

    let utteranceStarted = false;
    let utteranceEnded = false;
    let utteranceStartTime = null;
    let fallbackAttempted = false;

    const attemptEnglishFallback = () => {
      if (fallbackAttempted || !transliteration) return;
      fallbackAttempted = true;

      const normalizedTranslit = this.normalizeTranslit(transliteration);
      const fallbackVoice = this.pickVoiceForLocale('en-US') || this.pickVoiceForLocale('en');
      const fallbackLocale = fallbackVoice ? fallbackVoice.lang : 'en-US';

      console.warn('[TTS] Primary voice was silent/unsupported, retrying with English voice');
      this.speakSmart({
        nativeText: normalizedTranslit,
        nativeLocale: fallbackLocale,
        transliteration: normalizedTranslit,
        mode,
      });
    };

    // Event handlers
    utterance.onstart = () => {
      utteranceStarted = true;
      utteranceStartTime = performance.now();
      this.isSpeaking = true;
      this.currentUtterance = utterance;
      this.notifyListeners('start');
      console.log('[TTS] ✓ Speaking started:', textToSpeak);
    };

    utterance.onend = () => {
      utteranceEnded = true;
      this.isSpeaking = false;
      this.currentUtterance = null;
      this.notifyListeners('end');
      console.log('[TTS] ✓ Finished speaking');

      if (utteranceStartTime) {
        const elapsed = performance.now() - utteranceStartTime;
        if (elapsed < 120) {
          console.warn('[TTS] Speech ended too quickly (', Math.round(elapsed), 'ms ), treating as silent playback');
          attemptEnglishFallback();
        }
      }
    };

    utterance.onerror = (event) => {
      utteranceEnded = true;
      console.error('[TTS] ✗ Error:', event.error, event);
      this.isSpeaking = false;
      this.currentUtterance = null;
      this.notifyListeners('error', event.error);

      // If the language/voice is unsupported, retry in English with transliteration
      if (event.error === 'language-unavailable' || event.error === 'voice-unavailable') {
        attemptEnglishFallback();
      }
    };

    utterance.onpause = () => {
      console.log('[TTS] Paused');
      this.notifyListeners('pause');
    };

    utterance.onresume = () => {
      console.log('[TTS] Resumed');
      this.notifyListeners('resume');
    };

    // Speak
    console.log('[TTS] Calling synth.speak()...');
    try {
      this.synth.speak(utterance);

      // Force resume immediately after speak (critical for some browsers)
      // This is a known workaround for Chrome/Safari TTS bugs
      setTimeout(() => {
        if (this.synth.paused) {
          console.log('[TTS] Synth paused after speak(), forcing resume...');
          this.synth.resume();
        }
      }, 10);

      // Check if speaking started
      setTimeout(() => {
        const speakingOrPending = this.synth.speaking || this.synth.pending;

        // Avoid false alarms for very short utterances that may finish quickly
        if (!utteranceStarted && !utteranceEnded && !speakingOrPending) {
          console.warn('[TTS] Speech did not start after 100ms. synth.speaking:', this.synth.speaking, 'synth.pending:', this.synth.pending);
          console.warn('[TTS] Attempting force resume...');
          this.synth.resume();
        }
      }, 100);
    } catch (error) {
      console.error('[TTS] Exception calling synth.speak():', error);
    }
  }

  /**
   * Stop current speech
   */
  stop() {
    if (!this.synth) return;

    // Clean up old utterance event handlers to prevent interference
    if (this.currentUtterance) {
      this.currentUtterance.onstart = null;
      this.currentUtterance.onend = null;
      this.currentUtterance.onerror = null;
      this.currentUtterance.onpause = null;
      this.currentUtterance.onresume = null;
    }

    // Only cancel if actually speaking or pending
    // On iOS, calling cancel() when nothing is queued can interfere with next speak()
    // Also, avoid pause() on mobile - it can permanently stick the engine
    if (this.synth.speaking || this.synth.pending) {
      this.synth.cancel();
    }

    if (this.isSpeaking) {
      this.isSpeaking = false;
      this.currentUtterance = null;
      this.notifyListeners('cancel');
    }
  }

  /**
   * Pause current speech
   */
  pause() {
    if (!this.synth || !this.isSpeaking) return;
    this.synth.pause();
  }

  /**
   * Resume paused speech
   */
  resume() {
    if (!this.synth) return;
    this.synth.resume();
  }

  /**
   * Check if currently speaking
   */
  getIsSpeaking() {
    return this.isSpeaking;
  }

  /**
   * Add event listener
   * @param {Function} callback - Called with (eventType, data)
   */
  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Notify all listeners of an event
   */
  notifyListeners(eventType, data) {
    this.listeners.forEach(callback => {
      try {
        callback(eventType, data);
      } catch (error) {
        console.error('[TTS] Listener error:', error);
      }
    });
  }

  /**
   * Cleanup and reset
   */
  cleanup() {
    this.stop();
    this.listeners.clear();
  }
}

// Export singleton instance
const ttsService = new TtsService();
export default ttsService;

// Export class for testing
export { TtsService };
