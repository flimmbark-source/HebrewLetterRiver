/**
 * TTS Service using Web Speech API with improved mobile reliability
 *
 * This implementation uses a simpler, more reliable approach for mobile:
 * - Always creates fresh utterances
 * - Minimal state management to avoid corruption
 * - Delays between utterances to let the engine reset
 * - No aggressive recovery logic that can make things worse
 */

class TtsService {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.currentUtterance = null;
    this.listeners = new Set();
    this.isSpeaking = false;
    this.lastSpeakTime = 0;
  }

  /**
   * Initialize the TTS service
   */
  initTts() {
    if (!this.synth) {
      console.warn('[TTS] Speech Synthesis not available');
      return Promise.resolve();
    }
    return Promise.resolve();
  }

  /**
   * Detect if we're on a mobile device
   */
  isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  /**
   * Stop any current speech and clean up
   */
  stop() {
    if (!this.synth) return;

    // Only cancel if actually speaking to avoid interfering with the engine
    if (this.synth.speaking || this.synth.pending) {
      this.synth.cancel();
    }

    if (this.isSpeaking) {
      this.isSpeaking = false;
      this.notifyListeners('cancel');
    }

    this.currentUtterance = null;
  }

  /**
   * Normalize transliteration for better pronunciation
   */
  normalizeTranslit(text) {
    if (!text) return '';
    return text
      .trim()
      .replace(/'/g, '')
      .replace(/-/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Get the best voice for a locale
   */
  pickVoiceForLocale(locale) {
    if (!this.synth || !locale) return null;

    const voices = this.synth.getVoices();
    const normalizedLocale = locale.toLowerCase().replace(/^iw(\b|[-_])/i, 'he$1');
    const langCode = normalizedLocale.split('-')[0];

    // Score and sort voices
    const scored = voices
      .map((voice, index) => {
        const voiceLang = voice.lang.toLowerCase().replace(/^iw(\b|[-_])/i, 'he$1');
        const voiceLangCode = voiceLang.split('-')[0];

        let score = 0;
        if (voiceLang === normalizedLocale) score += 10;
        else if (voiceLangCode === langCode) score += 5;

        if (voice.localService) score += 2;
        if (/google/i.test(voice.name)) score += 3;
        if (/espeak/i.test(voice.name)) score -= 5;

        return { voice, score, index };
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score || a.index - b.index);

    return scored.length > 0 ? scored[0].voice : null;
  }

  /**
   * Smart speak: tries native voice, falls back to transliteration
   * MUST be synchronous to preserve user gesture on mobile
   */
  speakSmart({ nativeText, nativeLocale, transliteration, mode = 'word' }) {
    console.log('[TTS] speakSmart called:', { nativeText, nativeLocale, transliteration });

    if (!this.synth) {
      console.warn('[TTS] Speech synthesis not available');
      return;
    }

    // On mobile, enforce a minimum delay between utterances to let engine reset
    // Return early if too soon (don't use await - it breaks user gesture!)
    const now = Date.now();
    const timeSinceLastSpeak = now - this.lastSpeakTime;
    const minDelay = this.isMobile() ? 300 : 100;

    if (timeSinceLastSpeak < minDelay) {
      const waitTime = minDelay - timeSinceLastSpeak;
      console.log(`[TTS] Ignoring click - too soon (wait ${waitTime}ms more)`);
      return; // Don't wait, just ignore the click
    }

    // Always cancel before speaking to reset the engine (issue #1)
    // This is like calling audio.load() - it ensures a clean slate
    if (this.synth) {
      this.synth.cancel();
    }

    // Clear our state
    this.isSpeaking = false;
    this.currentUtterance = null;

    // Determine what to speak
    let textToSpeak = nativeText;
    let locale = nativeLocale;

    if (!textToSpeak || textToSpeak === '—') {
      if (transliteration) {
        textToSpeak = this.normalizeTranslit(transliteration);
        locale = 'en-US';
      } else {
        console.warn('[TTS] No text to speak');
        return;
      }
    }

    console.log('[TTS] Will speak:', textToSpeak, 'in locale:', locale);

    // Get voices - if not loaded yet, use default voice
    // We can't wait for voices without breaking the user gesture
    const voices = this.synth.getVoices();

    if (voices.length === 0) {
      console.log('[TTS] Voices not loaded yet, using default');
    }

    // Pick the best voice
    const voice = this.pickVoiceForLocale(locale);
    console.log('[TTS] Selected voice:', voice ? `${voice.name} (${voice.lang})` : 'default');

    // Create a fresh utterance
    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = locale;
    }

    utterance.rate = mode === 'sentence' ? 0.9 : 0.85;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Track state
    this.currentUtterance = utterance;
    let started = false;
    let ended = false;

    // Set up event handlers
    utterance.onstart = () => {
      started = true;
      this.isSpeaking = true;
      this.notifyListeners('start');
      console.log('[TTS] ✓ Started speaking');
    };

    utterance.onend = () => {
      ended = true;
      this.isSpeaking = false;
      this.currentUtterance = null;
      this.notifyListeners('end');
      console.log('[TTS] ✓ Finished speaking');
    };

    utterance.onerror = (event) => {
      ended = true;
      this.isSpeaking = false;
      this.currentUtterance = null;
      console.error('[TTS] ✗ Error:', event.error);
      this.notifyListeners('error', event.error);

      // Try English fallback if appropriate
      if (event.error === 'language-unavailable' && locale !== 'en-US' && transliteration) {
        console.log('[TTS] Trying English fallback...');
        setTimeout(() => {
          this.speakSmart({
            nativeText: this.normalizeTranslit(transliteration),
            nativeLocale: 'en-US',
            transliteration,
            mode
          });
        }, 100);
      }
    };

    // Speak the utterance
    console.log('[TTS] Calling synth.speak()...');
    this.synth.speak(utterance);
    this.lastSpeakTime = Date.now();

    // Safety timeout: if speaking didn't start after 2 seconds, assume it failed
    setTimeout(() => {
      if (!started && !ended) {
        console.warn('[TTS] Speech did not start within 2 seconds');
        this.isSpeaking = false;
        this.notifyListeners('error', 'timeout');
      }
    }, 2000);
  }

  /**
   * Pause current speech
   */
  pause() {
    if (this.synth && this.isSpeaking) {
      this.synth.pause();
    }
  }

  /**
   * Resume paused speech
   */
  resume() {
    if (this.synth && this.synth.paused) {
      this.synth.resume();
    }
  }

  /**
   * Reset playback slot (compatibility)
   */
  resetPlaybackSlot() {
    // Not needed in this simpler implementation
  }

  /**
   * Check if currently speaking
   */
  getIsSpeaking() {
    return this.isSpeaking;
  }

  /**
   * Add event listener
   */
  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Notify all listeners
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
   * Cleanup
   */
  cleanup() {
    this.stop();
    this.listeners.clear();
  }
}

// Export singleton
const ttsService = new TtsService();
export default ttsService;

export { TtsService };
