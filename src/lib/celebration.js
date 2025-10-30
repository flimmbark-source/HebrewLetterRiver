import confetti from 'canvas-confetti';

let audioContext;

function playTone() {
  if (typeof window === 'undefined') return;
  try {
    if (!audioContext) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      audioContext = Ctx ? new Ctx() : null;
    }
    if (!audioContext) return;
    const now = audioContext.currentTime;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(880, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.3, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
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
