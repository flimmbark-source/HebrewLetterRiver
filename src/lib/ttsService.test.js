import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TtsService } from './ttsService.js';

defineGlobal();

function defineGlobal() {
  if (!global.performance) {
    global.performance = { now: () => Date.now() };
  }
}

function createMockSynth(overrides = {}) {
  const synth = {
    speaking: false,
    pending: false,
    paused: false,
    cancel: vi.fn(() => {
      synth.speaking = false;
      synth.pending = false;
    }),
    resume: vi.fn(() => {
      synth.paused = false;
    }),
    speak: vi.fn((utterance) => {
      utterance.onstart?.();
      utterance.onend?.();
    }),
    getVoices: vi.fn(() => [
      { name: 'Test Voice', lang: 'en-US', localService: true }
    ]),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    ...overrides
  };

  return synth;
}

function setupSpeechGlobals(mockSynth, userAgent = 'iPhone') {
  global.navigator = { userAgent };
  global.window = {
    speechSynthesis: mockSynth,
    performance: global.performance,
  };

  global.SpeechSynthesisUtterance = function (text) {
    this.text = text;
    this.lang = undefined;
    this.rate = 1;
    this.pitch = 1;
    this.volume = 1;
  };
}

describe('TtsService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('refreshes suspended synth before speaking', async () => {
    const synth = createMockSynth({ paused: true });
    setupSpeechGlobals(synth);

    const service = new TtsService();
    await service.initTts();

    const initSpy = vi.spyOn(service, 'initTts');

    service.speakSmart({
      nativeText: 'שלום',
      nativeLocale: 'he-IL',
      transliteration: '',
    });

    expect(synth.cancel).toHaveBeenCalled();
    expect(initSpy).toHaveBeenCalled();
    expect(synth.resume).toHaveBeenCalled();
    expect(synth.speak).toHaveBeenCalled();
  });

  it('refreshes after stale inactivity', async () => {
    const synth = createMockSynth();
    setupSpeechGlobals(synth, 'Android');

    const service = new TtsService();
    await service.initTts();

    const initSpy = vi.spyOn(service, 'initTts');

    service.lastSpeakStartTime = (performance.now ? performance.now() : Date.now()) - 12000;

    service.speakSmart({
      nativeText: 'hello',
      nativeLocale: 'en-US',
      transliteration: '',
    });

    expect(initSpy).toHaveBeenCalled();
    expect(synth.cancel).toHaveBeenCalled();
    expect(synth.resume).toHaveBeenCalled();
    expect(synth.speak).toHaveBeenCalled();
  });
});
