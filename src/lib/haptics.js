/**
 * Haptic feedback utilities.
 *
 * All functions check navigator.vibrate availability and the
 * app's reducedMotion setting before triggering vibration.
 * They fail silently on unsupported browsers.
 */

function isReducedMotion() {
  // Check the app-level setting first
  try {
    const saved = localStorage.getItem('gameSettings');
    if (saved) {
      const settings = JSON.parse(saved);
      if (settings.reducedMotion) return true;
    }
  } catch { /* ignore */ }
  // Fall back to OS-level media query
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  return false;
}

function canVibrate() {
  return typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
}

function safeVibrate(pattern) {
  if (!canVibrate() || isReducedMotion()) return;
  try {
    navigator.vibrate(pattern);
  } catch { /* silent */ }
}

/** Very short vibration for button feedback (10ms) */
export function tapHaptic() {
  safeVibrate(10);
}

/** Two short pulses for correct answers (10ms, 20ms gap, 15ms) */
export function successHaptic() {
  safeVibrate([10, 20, 15]);
}

/** Longer pattern for milestone/reward events */
export function milestoneHaptic() {
  safeVibrate([15, 30, 15, 30, 25]);
}

/** Check whether the Vibration API is available */
export function isHapticsSupported() {
  return canVibrate();
}
