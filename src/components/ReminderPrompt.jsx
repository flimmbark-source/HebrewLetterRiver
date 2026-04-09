import React, { useState, useEffect, useCallback } from 'react';
import { loadState, saveState } from '../lib/storage.js';
import { useProgress } from '../context/ProgressContext.jsx';

function Icon({ children, className = '', filled = false, style = {} }) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{ fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 500, 'GRAD' 0, 'opsz' 24`, ...style }}
      aria-hidden="true"
    >
      {children}
    </span>
  );
}

const REMINDER_STORAGE_KEY = 'reminders';

export function getReminderPreferences() {
  return loadState(REMINDER_STORAGE_KEY, { prompted: false, enabled: false });
}

export function setReminderEnabled(enabled) {
  const current = getReminderPreferences();
  saveState(REMINDER_STORAGE_KEY, { ...current, enabled });
}

export default function ReminderPrompt() {
  const { player } = useProgress();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const sessions = player?.totals?.sessions ?? 0;

  useEffect(() => {
    const prefs = getReminderPreferences();
    // Show after 2nd or 3rd session, only if not already prompted
    if (!prefs.prompted && sessions >= 2 && sessions <= 4) {
      setVisible(true);
    }
  }, [sessions]);

  const handleEnable = useCallback(async () => {
    // Check if Notification API is available
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          saveState(REMINDER_STORAGE_KEY, { prompted: true, enabled: true });
        } else {
          // Permission denied or dismissed - save as prompted but not enabled
          saveState(REMINDER_STORAGE_KEY, { prompted: true, enabled: false });
        }
      } catch {
        saveState(REMINDER_STORAGE_KEY, { prompted: true, enabled: false });
      }
    } else {
      // Notifications not supported
      saveState(REMINDER_STORAGE_KEY, { prompted: true, enabled: false });
    }
    setDismissed(true);
    setTimeout(() => setVisible(false), 400);
  }, []);

  const handleDismiss = useCallback(() => {
    saveState(REMINDER_STORAGE_KEY, { prompted: true, enabled: false });
    setDismissed(true);
    setTimeout(() => setVisible(false), 400);
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`card-elevated overflow-hidden rounded-2xl p-5 transition-all duration-300 ${
        dismissed ? 'opacity-0 -translate-y-2' : 'opacity-100'
      }`}
      style={{ border: '1px solid var(--app-primary-container)' }}
    >
      <div className="flex items-start gap-4">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
          style={{ background: 'var(--app-primary-container)' }}
        >
          <Icon className="text-lg" filled style={{ color: 'var(--app-primary)' }}>
            notifications_active
          </Icon>
        </div>
        <div className="flex-1">
          <p
            className="text-sm font-bold"
            style={{ color: 'var(--app-on-surface)' }}
          >
            Want a daily reminder to keep your streak going?
          </p>
          <p
            className="mt-1 text-xs"
            style={{ color: 'var(--app-muted)' }}
          >
            {'Notification' in (typeof window !== 'undefined' ? window : {})
              ? "We'll send a gentle nudge each day."
              : 'Set a personal reminder to practice each day.'}
          </p>
          <div className="mt-3 flex gap-3">
            <button
              type="button"
              onClick={handleEnable}
              className="btn-press rounded-lg px-4 py-2 text-xs font-bold transition-colors"
              style={{
                background: 'var(--app-primary)',
                color: 'var(--app-on-primary)'
              }}
            >
              Enable
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="rounded-lg px-4 py-2 text-xs font-bold transition-colors"
              style={{ color: 'var(--app-muted)' }}
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
