import { loadState, saveState } from './storage.js';
import { on } from './eventBus.js';

// --- Canonical Event Taxonomy ---
const EVENT_TAXONOMY = new Set([
  'app_open',
  'onboarding_started',
  'onboarding_completed',
  'first_session_started',
  'first_session_completed',
  'session_started',
  'session_completed',
  'streak_viewed',
  'streak_extended',
  'streak_frozen',
  'review_started',
  'review_completed',
  'share_clicked',
  'share_completed',
  'paywall_viewed',
  'premium_started',
  'experiment_exposure',
]);

// --- Ring Buffer (last 500 events) ---
const BUFFER_MAX = 500;
let ringBuffer = [];

// --- Funnel metrics persisted in localStorage ---
const DEFAULT_FUNNEL = {
  first_session_completed: false,
  sessions_total: 0,
  d1_returned: false,
  d7_returned: false,
  mode_usage: {},
  share_click_count: 0,
  paywall_view_count: 0,
  first_open_ts: null,
  last_open_ts: null,
};

let funnelMetrics = loadState('analytics.funnel', { ...DEFAULT_FUNNEL });

// Restore persisted event summary counts
let eventCounts = loadState('analytics.events', {});

const isDev =
  typeof import.meta !== 'undefined' &&
  import.meta.env &&
  import.meta.env.DEV;

// --- Core API ---

/**
 * Track an analytics event.
 * Validates against the canonical taxonomy, timestamps it, stores in ring buffer,
 * updates summary counts, and updates funnel metrics.
 */
export function track(eventName, payload = {}) {
  if (!EVENT_TAXONOMY.has(eventName)) {
    if (isDev) {
      console.warn(`[analytics] Unknown event: "${eventName}". Skipping.`);
    }
    return;
  }

  const event = {
    event: eventName,
    timestamp: Date.now(),
    ...payload,
  };

  // Ring buffer
  ringBuffer.push(event);
  if (ringBuffer.length > BUFFER_MAX) {
    ringBuffer = ringBuffer.slice(ringBuffer.length - BUFFER_MAX);
  }

  // Summary counts
  eventCounts[eventName] = (eventCounts[eventName] || 0) + 1;
  saveState('analytics.events', eventCounts);

  // Funnel updates
  updateFunnel(eventName, payload);

  // Dev logging
  if (isDev) {
    console.log(`[analytics] ${eventName}`, payload);
  }

  // TODO: Future remote analytics hook — send event to remote endpoint here
}

/**
 * Return the in-memory ring buffer of recent events.
 */
export function getEventLog() {
  return [...ringBuffer];
}

/**
 * Return counts per event name.
 */
export function getEventCounts() {
  return { ...eventCounts };
}

/**
 * Return key funnel metrics.
 */
export function getFunnelMetrics() {
  return { ...funnelMetrics };
}

/**
 * Clear all analytics data (ring buffer, counts, funnel).
 */
export function clearAnalytics() {
  ringBuffer = [];
  eventCounts = {};
  funnelMetrics = { ...DEFAULT_FUNNEL };
  saveState('analytics.events', eventCounts);
  saveState('analytics.funnel', funnelMetrics);
}

// --- Internal: Funnel updater ---

function updateFunnel(eventName, payload) {
  const now = Date.now();

  switch (eventName) {
    case 'app_open': {
      if (!funnelMetrics.first_open_ts) {
        funnelMetrics.first_open_ts = now;
      }
      // Check d1 / d7 retention
      if (funnelMetrics.first_open_ts) {
        const daysSinceFirst =
          (now - funnelMetrics.first_open_ts) / (1000 * 60 * 60 * 24);
        if (daysSinceFirst >= 1) funnelMetrics.d1_returned = true;
        if (daysSinceFirst >= 7) funnelMetrics.d7_returned = true;
      }
      funnelMetrics.last_open_ts = now;
      break;
    }
    case 'first_session_completed':
      funnelMetrics.first_session_completed = true;
    // intentional fall-through to also count as a session
    // eslint-disable-next-line no-fallthrough
    case 'session_completed': {
      funnelMetrics.sessions_total += 1;
      const mode = payload.mode || 'unknown';
      funnelMetrics.mode_usage[mode] =
        (funnelMetrics.mode_usage[mode] || 0) + 1;
      break;
    }
    case 'share_clicked':
      funnelMetrics.share_click_count += 1;
      break;
    case 'paywall_viewed':
      funnelMetrics.paywall_view_count += 1;
      break;
    default:
      break;
  }

  saveState('analytics.funnel', funnelMetrics);
}

// --- Event Bus Bridge ---
// Translate existing eventBus events into canonical analytics events.

export function initAnalyticsBridge() {
  on('game:session-start', (payload) => {
    track('session_started', { mode: payload?.mode || 'letter-river' });
  });

  on('game:session-complete', (payload) => {
    track('session_completed', {
      mode: payload?.mode || 'letter-river',
      score: payload?.score ?? 0,
      accuracy: payload?.accuracy ?? 0,
    });
  });

  on('bridge:session-complete', (payload) => {
    track('session_completed', {
      mode: 'bridge-builder',
      score: payload?.score ?? 0,
      accuracy: payload?.accuracy ?? 0,
    });
  });

  on('deep-script:combat-won', (payload) => {
    track('session_completed', {
      mode: 'deep-script',
      score: payload?.score ?? 0,
      accuracy: payload?.accuracy ?? 0,
    });
  });

  on('deep-script:run-end', (payload) => {
    track('session_completed', {
      mode: 'deep-script',
      score: payload?.score ?? 0,
      accuracy: payload?.accuracy ?? 0,
    });
  });
}

// Auto-initialize bridge on import
initAnalyticsBridge();
