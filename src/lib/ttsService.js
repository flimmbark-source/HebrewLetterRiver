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
   * Initialize the TTS engine and load available voices
   */
  async initTts() {
    if (this.isInitialized) return;

    if (!('speechSynthesis' in window)) {
      console.warn('[TTS] Speech Synthesis API not supported in this browser');
      return;
    }

    this.synth = window.speechSynthesis;

    // Load voices (may require async on some browsers)
    await this.loadVoices();

    this.isInitialized = true;
    console.log('[TTS] Initialized with', this.voices.length, 'voices');
  }

  /**
   * Load available voices from the browser
   */
  async loadVoices() {
    return new Promise((resolve) => {
      // Get initial voices
      this.voices = this.synth.getVoices();

      if (this.voices.length > 0) {
        resolve();
        return;
      }

      // Some browsers require waiting for voiceschanged event
      const voicesChangedHandler = () => {
        this.voices = this.synth.getVoices();
        console.log('[TTS] Loaded', this.voices.length, 'voices');
        this.synth.removeEventListener('voiceschanged', voicesChangedHandler);
        resolve();
      };

      this.synth.addEventListener('voiceschanged', voicesChangedHandler);

      // Timeout fallback
      setTimeout(() => {
        this.voices = this.synth.getVoices();
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

  /**
   * Pick the best voice for a given locale
   * @param {string} locale - BCP 47 language tag (e.g., "he-IL", "es-ES", "en-US")
   * @returns {SpeechSynthesisVoice|null}
   */
  pickVoiceForLocale(locale) {
    if (!locale || this.voices.length === 0) return null;

    const localeLower = locale.toLowerCase();
    const langCode = localeLower.split('-')[0]; // e.g., "he" from "he-IL"

    // Try exact match first (e.g., "he-IL")
    let voice = this.voices.find(v => v.lang.toLowerCase() === localeLower);

    // Try language prefix match (e.g., "he" matches "he-IL" or "he")
    if (!voice) {
      voice = this.voices.find(v => v.lang.toLowerCase().startsWith(langCode));
    }

    // Prefer local voices over remote when available
    if (voice && !voice.localService) {
      const localVoice = this.voices.find(v =>
        v.lang.toLowerCase().startsWith(langCode) && v.localService
      );
      if (localVoice) voice = localVoice;
    }

    console.log('[TTS] Selected voice for', locale, ':', voice ? `${voice.name} (${voice.lang})` : 'none');
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
   * @param {Object} params
   * @param {string} params.nativeText - Text in target language script
   * @param {string} params.nativeLocale - BCP 47 locale (e.g., "he-IL")
   * @param {string} params.transliteration - Romanized pronunciation
   * @param {string} [params.mode] - "word" | "sentence" (affects rate)
   * @returns {Promise<void>}
   */
  async speakSmart({ nativeText, nativeLocale, transliteration, mode = 'word' }) {
    await this.initTts();

    if (!this.synth) {
      console.warn('[TTS] Speech synthesis not available');
      return;
    }

    // Stop any current speech
    this.stop();

    // Determine what to speak and which voice to use
    let textToSpeak = nativeText;
    let voice = null;

    if (nativeLocale) {
      voice = this.pickVoiceForLocale(nativeLocale);
    }

    // Fallback to English transliteration if no native voice available
    if (!voice && transliteration) {
      console.log('[TTS] No native voice for', nativeLocale, '- falling back to English transliteration');
      textToSpeak = this.normalizeTranslit(transliteration);
      voice = this.pickVoiceForLocale('en-US') || this.pickVoiceForLocale('en');
    }

    // Final fallback: use default system voice
    if (!voice && this.voices.length > 0) {
      voice = this.voices[0];
    }

    if (!textToSpeak || textToSpeak === '—') {
      console.warn('[TTS] No text to speak');
      return;
    }

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

    // Event handlers
    utterance.onstart = () => {
      this.isSpeaking = true;
      this.currentUtterance = utterance;
      this.notifyListeners('start');
      console.log('[TTS] Speaking:', textToSpeak);
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.currentUtterance = null;
      this.notifyListeners('end');
      console.log('[TTS] Finished speaking');
    };

    utterance.onerror = (event) => {
      console.error('[TTS] Error:', event.error);
      this.isSpeaking = false;
      this.currentUtterance = null;
      this.notifyListeners('error', event.error);
    };

    utterance.onpause = () => {
      this.notifyListeners('pause');
    };

    utterance.onresume = () => {
      this.notifyListeners('resume');
    };

    // Speak
    this.synth.speak(utterance);
  }

  /**
   * Stop current speech
   */
  stop() {
    if (!this.synth) return;

    if (this.isSpeaking) {
      this.synth.cancel();
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
