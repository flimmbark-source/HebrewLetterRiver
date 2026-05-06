import React, { useState } from 'react';
import { loadState, saveState } from '../lib/storage.js';

const blocks = [
  {
    icon: 'waves',
    title: 'Learn letters through play',
    description: 'Catch letters as they flow down the river and build recognition naturally.'
  },
  {
    icon: 'extension',
    title: 'Build words through guided practice',
    description: 'Combine letters into words with vocabulary games and bridge-building challenges.'
  },
  {
    icon: 'menu_book',
    title: 'Progress into reading and conversation',
    description: 'Go from letters to sentences to real reading fluency at your own pace.'
  }
];

export default function WhyLetterRiverScreen({ onContinue }) {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleContinue = () => {
    if (dontShowAgain) {
      saveState('onboarding.whyScreenDismissed', true);
    }
    onContinue();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6 app-scroll-safe-bottom animate-fade-in"
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
        <h2
          className="text-2xl font-bold sm:text-3xl"
          style={{ fontFamily: '"Baloo 2", system-ui, sans-serif', color: 'var(--app-on-surface)' }}
        >
          How Letter River Works
        </h2>
        <p className="mt-2 text-sm" style={{ color: 'var(--app-muted)' }}>
          Three steps to fluency
        </p>

        <div className="mt-6 space-y-4 text-left">
          {blocks.map((block, index) => (
            <div
              key={block.icon}
              className="flex items-start gap-4 rounded-2xl p-4"
              style={{
                background: 'var(--app-surface, var(--app-card-bg))',
                border: '1px solid var(--app-card-border)'
              }}
            >
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                style={{ background: 'var(--app-primary-container)' }}
              >
                <span
                  className="material-symbols-outlined text-xl"
                  style={{
                    color: 'var(--app-primary)',
                    fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24"
                  }}
                  aria-hidden="true"
                >
                  {block.icon}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold" style={{ color: 'var(--app-on-surface)' }}>
                  <span
                    className="mr-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black"
                    style={{ background: 'var(--app-primary)', color: 'var(--app-on-primary, #fff)' }}
                  >
                    {index + 1}
                  </span>
                  {block.title}
                </p>
                <p className="mt-1 text-xs leading-relaxed" style={{ color: 'var(--app-muted)' }}>
                  {block.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleContinue}
          className="btn-cta mt-6 w-full px-5 py-3.5 text-base sm:w-auto sm:px-8"
        >
          Let's start!
        </button>

        <label className="mt-4 flex items-center justify-center gap-2 text-xs cursor-pointer" style={{ color: 'var(--app-muted)' }}>
          <input
            type="checkbox"
            checked={dontShowAgain}
            onChange={(e) => setDontShowAgain(e.target.checked)}
            className="h-3.5 w-3.5 rounded"
          />
          Don't show this again
        </label>
      </div>
    </div>
  );
}
