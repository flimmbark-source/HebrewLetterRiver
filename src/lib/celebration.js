import confetti from 'canvas-confetti';

let audioContext;

function ensureAudioContext() {
  if (typeof window === 'undefined') return null;

  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;

    if (!audioContext || audioContext.state === 'closed') {
      audioContext = new Ctx();
    }

    // If the tab/app was backgrounded, audio can be suspended; resume in response to the user gesture
    if (audioContext.state === 'suspended') {
      audioContext.resume().catch((err) => {
        console.warn('audioContext resume blocked', err);
      });
    }

    return audioContext;
  } catch (err) {
    console.warn('audioContext init error', err);
    return null;
  }
}

function playTone() {
  if (typeof window === 'undefined') return;
  try {
    const ctx = ensureAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(880, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.3, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.45);
  } catch (err) {
    console.warn('tone error', err);
  }
}

export function celebrate(options = {}) {
  if (typeof window === 'undefined') return;
  const { particleCount = 80, spread = 65, originY = 0.6 } = options;
  confetti({
    particleCount,
    spread,
    origin: { y: originY }
  });
  if (navigator.vibrate) navigator.vibrate(35);
  playTone();
}
