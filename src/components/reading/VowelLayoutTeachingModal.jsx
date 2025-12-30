/**
 * Vowel Layout Teaching Modal
 *
 * Shows detailed teaching content for a specific Hebrew vowel layout.
 * Displays:
 * - Layout title and explanation
 * - Rules/guidelines
 * - Examples from the current pack
 * - Got it / Close buttons
 */

import React from 'react';
import { getVowelLayout } from '../../data/vowelLayouts/hebrewVowelLayouts.js';
import { setLearnedLayout } from '../../lib/vowelLayoutProgress.js';

export function VowelLayoutTeachingModal({
  isVisible,
  onClose,
  layoutId,
  languageCode = 'he',
  examples = [],
  practiceFontClass = '',
  appFontClass = ''
}) {
  if (!isVisible || !layoutId) {
    return null;
  }

  // Get layout definition (defensive: check if exists)
  const layout = getVowelLayout(layoutId);
  if (!layout) {
    console.warn(`VowelLayoutTeachingModal: layout not found: ${layoutId}`);
    return null;
  }

  // Handle "Got it" - marks layout as learned and closes
  const handleGotIt = () => {
    setLearnedLayout(languageCode, layoutId);
    onClose();
  };

  // Handle backdrop click to close
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 p-4 pt-15"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-2xl rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mb-2 text-5xl" aria-hidden="true">
            {layout.chipLabel}
          </div>
          <h2 className={`${appFontClass} text-2xl font-bold text-white`}>
            {layout.title}
          </h2>
          <p className={`${appFontClass} mt-2 text-base text-slate-300`}>
            {layout.explanation}
          </p>
        </div>

        {/* Rules Section */}
        <div className="mb-6">
          <h3 className={`${appFontClass} mb-3 text-lg font-semibold text-white`}>
            How it works:
          </h3>
          <ul className="space-y-2">
            {layout.rules.map((rule, idx) => (
              <li
                key={idx}
                className={`${appFontClass} flex items-start gap-2 text-slate-200`}
              >
                <span className="mt-1 text-blue-400">•</span>
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Examples Section */}
        {examples.length > 0 && (
          <div className="mb-6">
            <h3 className={`${appFontClass} mb-3 text-lg font-semibold text-white`}>
              Examples from this pack:
            </h3>
            <div className="space-y-2 rounded-2xl border border-slate-700 bg-slate-800/50 p-4">
              {examples.slice(0, 5).map((example, idx) => (
                <div
                  key={idx}
                  className="flex flex-wrap items-center gap-3 border-b border-slate-700/50 pb-2 last:border-0 last:pb-0"
                >
                  <span className={`${practiceFontClass} text-xl text-white`}>
                    {example.hebrew}
                  </span>
                  <span className="text-slate-500">→</span>
                  <span className={`${appFontClass} font-mono text-base text-blue-300`}>
                    {example.transliteration}
                  </span>
                  <span className={`${appFontClass} text-sm text-slate-400`}>
                    ({example.meaning})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={handleGotIt}
            className={`${appFontClass} rounded-full bg-blue-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-blue-500`}
          >
            Got it! ✓
          </button>
          <button
            onClick={onClose}
            className={`${appFontClass} rounded-full border border-slate-600 bg-slate-800 px-8 py-3 font-semibold text-white transition-colors hover:bg-slate-700`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default VowelLayoutTeachingModal;
