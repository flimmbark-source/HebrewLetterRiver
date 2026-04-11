/**
 * Unified UI sound library — Web Audio API synthesized sounds.
 *
 * Follows the same oscillator/gain pattern as deepScript/dsSounds.js.
 * All sounds are procedurally generated (no audio files needed).
 *
 * Sounds check:
 *   1. localStorage `settings.uiSounds` (default true)
 *   2. `prefers-reduced-motion` media query
 *   3. AudioContext availability
 * and fail silently when any check fails.
 */

let audioCtx;
let masterGain;
let _soundEnabled = null; // cached from localStorage
let _volume = null;       // cached from localStorage (0-1)

// ─── Helpers ───────────────────────────────────────────────

function getCtx() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    audioCtx = Ctx ? new Ctx() : null;
    if (audioCtx) {
      masterGain = audioCtx.createGain();
      masterGain.gain.value = getVolume();
      masterGain.connect(audioCtx.destination);
    }
  }
  // Resume suspended context (autoplay policy)
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

function getDest() {
  getCtx();
  return masterGain || (audioCtx && audioCtx.destination) || null;
}

function prefersReducedMotion() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function loadEnabled() {
  if (typeof window === 'undefined') return true;
  try {
    const raw = localStorage.getItem('settings.uiSounds');
    if (raw === null) return true; // default on
    return raw === 'true';
  } catch {
    return true;
  }
}

function loadVolume() {
  if (typeof window === 'undefined') return 0.7;
  try {
    const raw = localStorage.getItem('settings.soundVolume');
    if (raw === null) return 0.7;
    const v = parseFloat(raw);
    return isNaN(v) ? 0.7 : Math.max(0, Math.min(1, v));
  } catch {
    return 0.7;
  }
}

function getVolume() {
  if (_volume === null) _volume = loadVolume();
  return _volume;
}

function canPlay() {
  if (_soundEnabled === null) _soundEnabled = loadEnabled();
  return _soundEnabled && !prefersReducedMotion();
}

function safePlay(fn) {
  if (!canPlay()) return;
  try { fn(); } catch { /* silent */ }
}

// ─── Public settings API ───────────────────────────────────

export function setSoundEnabled(enabled) {
  _soundEnabled = !!enabled;
  try { localStorage.setItem('settings.uiSounds', String(_soundEnabled)); } catch { /* */ }
}

export function isSoundEnabled() {
  if (_soundEnabled === null) _soundEnabled = loadEnabled();
  return _soundEnabled;
}

export function setSoundVolume(volume) {
  _volume = Math.max(0, Math.min(1, volume));
  try { localStorage.setItem('settings.soundVolume', String(_volume)); } catch { /* */ }
  if (masterGain) {
    masterGain.gain.value = _volume;
  }
}

export function getSoundVolume() {
  return getVolume();
}

/** Call on any user interaction to ensure AudioContext is resumed. */
export function ensureAudioResumed() {
  getCtx();
}

// ─── Sound effects ─────────────────────────────────────────

/** Bright ascending two-tone chime — Letter River correct answer */
export function playCorrectCatch() {
  safePlay(() => {
    const ctx = getCtx();
    const dest = getDest();
    if (!ctx || !dest) return;
    const now = ctx.currentTime;
    [587.33, 783.99].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const t = now + i * 0.07;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.18, t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
      osc.connect(gain);
      gain.connect(dest);
      osc.start(t);
      osc.stop(t + 0.25);
    });
  });
}

/** Soft low thud — wrong answer */
export function playWrongCatch() {
  safePlay(() => {
    const ctx = getCtx();
    const dest = getDest();
    if (!ctx || !dest) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.12);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.14, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
    osc.connect(gain);
    gain.connect(dest);
    osc.start(now);
    osc.stop(now + 0.2);
  });
}

/** Triumphant ascending 4-note scale — level up */
export function playLevelUp() {
  safePlay(() => {
    const ctx = getCtx();
    const dest = getDest();
    if (!ctx || !dest) return;
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const t = now + i * 0.1;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.18, t + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
      osc.connect(gain);
      gain.connect(dest);
      osc.start(t);
      osc.stop(t + 0.45);
    });
  });
}

/** Two quick ascending tones — quest complete */
export function playQuestComplete() {
  safePlay(() => {
    const ctx = getCtx();
    const dest = getDest();
    if (!ctx || !dest) return;
    const now = ctx.currentTime;
    [659.25, 880].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const t = now + i * 0.08;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.16, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
      osc.connect(gain);
      gain.connect(dest);
      osc.start(t);
      osc.stop(t + 0.25);
    });
  });
}

/** Sparkly ascending achievement fanfare — badge earned */
export function playBadgeEarned() {
  safePlay(() => {
    const ctx = getCtx();
    const dest = getDest();
    if (!ctx || !dest) return;
    const now = ctx.currentTime;
    // Sparkle: fast ascending harmonics
    const notes = [880, 1108.73, 1318.51, 1567.98, 1760];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      const t = now + i * 0.06;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.1, t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
      osc.connect(gain);
      gain.connect(dest);
      osc.start(t);
      osc.stop(t + 0.3);
    });
    // Final sustain chord
    [1046.5, 1318.51].forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const t = now + 0.3;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.08, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
      osc.connect(gain);
      gain.connect(dest);
      osc.start(t);
      osc.stop(t + 0.4);
    });
  });
}

/** Clicking sequence then chime — bridge word assembly complete */
export function playBridgeWordComplete() {
  safePlay(() => {
    const ctx = getCtx();
    const dest = getDest();
    if (!ctx || !dest) return;
    const now = ctx.currentTime;
    // 3 quick clicks
    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      const t = now + i * 0.05;
      osc.frequency.setValueAtTime(1200, t);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.06, t + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);
      osc.connect(gain);
      gain.connect(dest);
      osc.start(t);
      osc.stop(t + 0.04);
    }
    // Final chime
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    const t = now + 0.18;
    osc.frequency.setValueAtTime(880, t);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.15, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
    osc.connect(gain);
    gain.connect(dest);
    osc.start(t);
    osc.stop(t + 0.3);
  });
}

/** Warm whoosh + chime — daily streak continued */
export function playStreakExtended() {
  safePlay(() => {
    const ctx = getCtx();
    const dest = getDest();
    if (!ctx || !dest) return;
    const now = ctx.currentTime;
    // Whoosh: filtered noise sweep
    const bufferSize = Math.floor(ctx.sampleRate * 0.2);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(2400, now + 0.1);
    filter.frequency.exponentialRampToValueAtTime(400, now + 0.2);
    filter.Q.setValueAtTime(2, now);
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.08, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
    source.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(dest);
    source.start(now);
    // Chime after whoosh
    const osc = ctx.createOscillator();
    const chimeGain = ctx.createGain();
    osc.type = 'triangle';
    const t = now + 0.15;
    osc.frequency.setValueAtTime(783.99, t);
    chimeGain.gain.setValueAtTime(0.0001, t);
    chimeGain.gain.exponentialRampToValueAtTime(0.14, t + 0.02);
    chimeGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
    osc.connect(chimeGain);
    chimeGain.connect(dest);
    osc.start(t);
    osc.stop(t + 0.3);
  });
}

/** Celebratory short fanfare — milestone reached */
export function playMilestoneReached() {
  safePlay(() => {
    const ctx = getCtx();
    const dest = getDest();
    if (!ctx || !dest) return;
    const now = ctx.currentTime;
    // Major triad arpeggio
    const notes = [523.25, 659.25, 783.99];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const t = now + i * 0.08;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.16, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
      osc.connect(gain);
      gain.connect(dest);
      osc.start(t);
      osc.stop(t + 0.35);
    });
    // Sustain chord at end
    [523.25, 783.99].forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      const t = now + 0.24;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.06, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
      osc.connect(gain);
      gain.connect(dest);
      osc.start(t);
      osc.stop(t + 0.35);
    });
  });
}

/** Very subtle click — button tap */
export function playButtonTap() {
  safePlay(() => {
    const ctx = getCtx();
    const dest = getDest();
    if (!ctx || !dest) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.03);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.08, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);
    osc.connect(gain);
    gain.connect(dest);
    osc.start(now);
    osc.stop(now + 0.06);
  });
}

/** Coins/stars collecting sound — reward claim */
export function playRewardClaim() {
  safePlay(() => {
    const ctx = getCtx();
    const dest = getDest();
    if (!ctx || !dest) return;
    const now = ctx.currentTime;
    // Quick ascending plinks
    const notes = [1046.5, 1318.51, 1567.98, 2093];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      const t = now + i * 0.045;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.1, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
      osc.connect(gain);
      gain.connect(dest);
      osc.start(t);
      osc.stop(t + 0.15);
    });
  });
}
