/**
 * TTS Service using HTML5 Audio with Google Translate TTS
 *
 * Provides text-to-speech functionality that works reliably on mobile devices,
 * especially Android where Web Speech API has playback issues with repeated button presses.
 *
 * This implementation uses HTML5 Audio elements with Google Translate's TTS API,
 * which is much more reliable for mobile playback.
 */

class TtsService {
  constructor() {
    this.currentAudio = null;
    this.listeners = new Set();
    this.isSpeaking = false;
    this.audioCache = new Map(); // Cache audio URLs to avoid repeated requests
  }

  /**
   * Initialize the TTS service (compatibility method, not needed for this implementation)
   */
  initTts() {
    // HTML5 Audio doesn't require initialization, but keep for API compatibility
    return Promise.resolve();
  }

  /**
   * Convert locale to Google Translate language code
   * @param {string} locale - BCP 47 locale (e.g., "he-IL", "es-ES")
   * @returns {string} - Google Translate language code (e.g., "he", "es")
   */
  localeToLangCode(locale) {
    if (!locale) return 'en';

    // Extract language code from locale
    const langCode = locale.toLowerCase().split('-')[0];

    // Map any special cases
    const langMap = {
      'iw': 'he', // Legacy Hebrew code
    };

    return langMap[langCode] || langCode;
  }

  /**
   * Generate Google Translate TTS URL
   * @param {string} text - Text to speak
   * @param {string} langCode - Language code (e.g., "he", "en", "es")
   * @returns {string} - Google Translate TTS URL
   */
  generateTtsUrl(text, langCode) {
    if (!text) return null;

    const encodedText = encodeURIComponent(text);

    // Google Translate TTS URL format
    // Using 'tw-ob' client which is more reliable than 'gtx'
    return `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${langCode}&q=${encodedText}`;
  }

  /**
   * Normalize transliteration for better pronunciation
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
   * Create and configure an audio element
   * @param {string} url - Audio source URL
   * @returns {HTMLAudioElement}
   */
  createAudioElement(url) {
    const audio = new Audio();

    // Set attributes for better mobile compatibility
    audio.preload = 'auto';
    audio.crossOrigin = 'anonymous'; // Required for CORS

    // Set the source
    audio.src = url;

    return audio;
  }

  /**
   * Smart speak: tries native voice first, falls back to English transliteration
   * @param {Object} params
   * @param {string} params.nativeText - Text in target language script
   * @param {string} params.nativeLocale - BCP 47 locale (e.g., "he-IL")
   * @param {string} params.transliteration - Romanized pronunciation
   * @param {string} [params.mode] - "word" | "sentence" (kept for API compatibility)
   */
  speakSmart({ nativeText, nativeLocale, transliteration, mode = 'word' }) {
    console.log('[TTS] speakSmart called with:', { nativeText, nativeLocale, transliteration, mode });

    // Stop any currently playing audio
    this.stop();

    // Determine what to speak and in which language
    let textToSpeak = nativeText;
    let langCode = this.localeToLangCode(nativeLocale);

    // If no native text or it's a placeholder, use transliteration
    if (!textToSpeak || textToSpeak === '—') {
      if (transliteration) {
        textToSpeak = this.normalizeTranslit(transliteration);
        langCode = 'en';
      } else {
        console.warn('[TTS] No text to speak');
        return;
      }
    }

    console.log('[TTS] Speaking:', textToSpeak, 'in language:', langCode);

    // Check cache first
    const cacheKey = `${langCode}:${textToSpeak}`;
    let audioUrl;

    if (this.audioCache.has(cacheKey)) {
      audioUrl = this.audioCache.get(cacheKey);
      console.log('[TTS] Using cached URL');
    } else {
      audioUrl = this.generateTtsUrl(textToSpeak, langCode);
      this.audioCache.set(cacheKey, audioUrl);
      console.log('[TTS] Generated new URL');
    }

    if (!audioUrl) {
      console.warn('[TTS] Failed to generate audio URL');
      return;
    }

    // Create new audio element
    const audio = this.createAudioElement(audioUrl);
    this.currentAudio = audio;

    // Set up event listeners
    audio.addEventListener('play', () => {
      this.isSpeaking = true;
      this.notifyListeners('start');
      console.log('[TTS] ✓ Playback started');
    });

    audio.addEventListener('ended', () => {
      this.isSpeaking = false;
      this.notifyListeners('end');
      console.log('[TTS] ✓ Playback ended');

      // Clean up
      if (this.currentAudio === audio) {
        this.currentAudio = null;
      }
    });

    audio.addEventListener('error', (e) => {
      console.error('[TTS] ✗ Audio error:', e);
      this.isSpeaking = false;
      this.notifyListeners('error', e);

      // Try fallback to English transliteration if we haven't already
      if (langCode !== 'en' && transliteration) {
        console.log('[TTS] Trying fallback to English transliteration');
        this.speakSmart({
          nativeText: this.normalizeTranslit(transliteration),
          nativeLocale: 'en-US',
          transliteration: transliteration,
          mode: mode
        });
      }

      // Clean up
      if (this.currentAudio === audio) {
        this.currentAudio = null;
      }
    });

    audio.addEventListener('pause', () => {
      console.log('[TTS] Paused');
      this.notifyListeners('pause');
    });

    // Load and play the audio
    // On mobile, we need to load() first, then play() to ensure reliable playback
    audio.load();

    const playPromise = audio.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log('[TTS] Play promise resolved successfully');
        })
        .catch(error => {
          console.error('[TTS] Play promise rejected:', error);
          this.isSpeaking = false;
          this.notifyListeners('error', error);
        });
    }
  }

  /**
   * Stop current speech
   */
  stop() {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
        this.currentAudio = null;
      } catch (error) {
        console.error('[TTS] Error stopping audio:', error);
      }

      if (this.isSpeaking) {
        this.isSpeaking = false;
        this.notifyListeners('cancel');
      }
    }
  }

  /**
   * Pause current speech
   */
  pause() {
    if (this.currentAudio && this.isSpeaking) {
      this.currentAudio.pause();
    }
  }

  /**
   * Resume paused speech
   */
  resume() {
    if (this.currentAudio && !this.isSpeaking) {
      const playPromise = this.currentAudio.play();

      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error('[TTS] Resume failed:', error);
        });
      }
    }
  }

  /**
   * Reset playback slot (compatibility method for old API)
   */
  resetPlaybackSlot() {
    // Not needed for HTML5 Audio, but keep for API compatibility
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
    this.audioCache.clear();
  }

  /**
   * Clear the audio cache (useful if memory becomes an issue)
   */
  clearCache() {
    this.audioCache.clear();
    console.log('[TTS] Cache cleared');
  }
}

// Export singleton instance
const ttsService = new TtsService();
export default ttsService;

// Export class for testing
export { TtsService };
