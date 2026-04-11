import React, { useEffect, useRef } from 'react';
import { celebrate } from '../lib/celebration.js';
import { saveState } from '../lib/storage.js';

export default function FirstSessionSuccess({ lettersLearned = 0, starsEarned = 0, onContinue }) {
  const celebratedRef = useRef(false);

  useEffect(() => {
    if (!celebratedRef.current) {
      celebratedRef.current = true;
      saveState('onboarding.firstSessionComplete', true);
      // Fire confetti after a brief delay for the entrance animation
      const timer = setTimeout(() => celebrate({ particleCount: 120, spread: 80 }), 400);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 animate-fade-in"
      style={{ background: 'var(--app-bg)' }}
    >
      <div
        className="animate-scale-in w-full max-w-lg rounded-3xl p-6 text-center sm:p-8"
        style={{
          background: 'var(--app-card-bg)',
          border: '1px solid var(--app-card-border)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)'
        }}
      >
        {/* Celebration icon */}
        <div
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-full"
          style={{ background: 'var(--app-primary-container)' }}
        >
          <span
            className="material-symbols-outlined text-4xl"
            style={{
              color: 'var(--app-primary)',
              fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 48"
            }}
            aria-hidden="true"
          >
            celebration
          </span>
        </div>

        <h2
          className="mt-5 text-2xl font-bold sm:text-3xl"
          style={{ fontFamily: '"Baloo 2", system-ui, sans-serif', color: 'var(--app-on-surface)' }}
        >
          Great start!
        </h2>
        <p className="mt-2 text-sm sm:text-base" style={{ color: 'var(--app-muted)' }}>
          You completed your first session. Keep going!
        </p>

        {/* Stats */}
        <div className="mt-6 flex justify-center gap-6">
          {lettersLearned > 0 && (
            <div className="text-center">
              <div
                className="text-3xl font-black"
                style={{ color: 'var(--app-primary)', fontFamily: '"Baloo 2", system-ui, sans-serif' }}
              >
                {lettersLearned}
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--app-muted)' }}>
                Letters learned
              </p>
            </div>
          )}
          {starsEarned > 0 && (
            <div className="text-center">
              <div
                className="text-3xl font-black"
                style={{ color: 'var(--app-mode-bridge, #f59e0b)', fontFamily: '"Baloo 2", system-ui, sans-serif' }}
              >
                {starsEarned}
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--app-muted)' }}>
                Stars earned
              </p>
            </div>
          )}
        </div>

        {/* What's next */}
        <div
          className="mt-6 rounded-2xl p-4 text-left"
          style={{ background: 'var(--app-surface, var(--app-card-bg))', border: '1px solid var(--app-card-border)' }}
        >
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--app-muted)' }}>
            What's next
          </p>
          <div className="mt-2 space-y-2">
            <div className="flex items-center gap-3">
              <span
                className="material-symbols-outlined text-lg"
                style={{ color: 'var(--app-primary)', fontVariationSettings: "'FILL' 1, 'wght' 500" }}
                aria-hidden="true"
              >
                event_repeat
              </span>
              <p className="text-sm" style={{ color: 'var(--app-on-surface)' }}>
                Come back tomorrow for your daily quests
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className="material-symbols-outlined text-lg"
                style={{ color: 'var(--app-mode-bridge, #f59e0b)', fontVariationSettings: "'FILL' 1, 'wght' 500" }}
                aria-hidden="true"
              >
                extension
              </span>
              <p className="text-sm" style={{ color: 'var(--app-on-surface)' }}>
                Try Vocab Builder for word practice
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onContinue}
          className="btn-cta mt-6 w-full px-5 py-3.5 text-base sm:w-auto sm:px-8"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
