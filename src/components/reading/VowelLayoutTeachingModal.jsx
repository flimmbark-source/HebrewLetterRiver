/**
 * Vowel Layout Teaching Modal
 *
 * Shows detailed teaching content for a specific Hebrew vowel layout.
 * Displays:
 * - Layout icon (large)
 * - Vowel sequence with colored dots
 * - Explanation and rules
 * - Examples from the current pack
 * - Got it / Close buttons
 */

import React from 'react';
import { VowelLayoutIcon } from './VowelLayoutIcon.jsx';
import {
  deriveLayoutFromTransliteration,
  generateTeachingContent,
  getVowelSequenceDescription,
  VOWEL_COLORS
} from '../../lib/vowelLayoutDerivation.js';
import { setLearnedLayout } from '../../lib/vowelLayoutProgress.js';

export function VowelLayoutTeachingModal({
  isVisible,
  onClose,
  layoutId,
  transliteration,
  languageCode = 'he',
  examples = [],
  practiceFontClass = '',
  appFontClass = ''
}) {
  if (!isVisible) {
    return null;
  }

  // Derive layout info
  let layoutInfo;
  if (transliteration) {
    layoutInfo = deriveLayoutFromTransliteration(transliteration);
  } else if (layoutId) {
    // Parse layoutId to extract info
    const parts = layoutId.split('_');
    if (parts.length >= 3) {
      const vowelTokens = parts.slice(2).join('_').split('-');
      layoutInfo = {
        id: layoutId,
        vowelTokens,
        beatCount: vowelTokens.length
      };
    }
  }

  if (!layoutInfo) {
    console.warn(`VowelLayoutTeachingModal: invalid layout info`);
    return null;
  }

  const { vowelTokens, beatCount } = layoutInfo;
  const teachingContent = generateTeachingContent(vowelTokens, beatCount);
  const vowelSequence = getVowelSequenceDescription(vowelTokens);

  // Handle "Got it" - marks layout as learned and closes
  const handleGotIt = () => {
    setLearnedLayout(languageCode, layoutId || deriveLayoutFromTransliteration(transliteration).id);
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
        {/* Header with large icon */}
        <div className="mb-6 flex flex-col items-center text-center">
          <VowelLayoutIcon
            layoutId={layoutId}
            transliteration={transliteration}
            size={80}
            className="mb-4"
          />

          <h2 className={`${appFontClass} text-2xl font-bold text-white`}>
            {teachingContent.title}
          </h2>

          {/* Vowel sequence with colored dots */}
          <div className="mt-3 flex items-center gap-2">
            <span className={`${appFontClass} text-sm text-slate-400`}>Vowel sequence:</span>
            <div className="flex items-center gap-2">
              {vowelTokens.map((token, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && <span className="text-slate-500">→</span>}
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className="h-4 w-4 rounded-full ring-2 ring-slate-600"
                      style={{ backgroundColor: VOWEL_COLORS[token] }}
                      title={`${token} vowel`}
                    />
                    <span className={`${appFontClass} text-xs font-bold text-white`}>
                      {token}
                    </span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>

          <p className={`${appFontClass} mt-3 text-base text-slate-300`}>
            {teachingContent.explanation}
          </p>
        </div>

        {/* Rules Section */}
        <div className="mb-6">
          <h3 className={`${appFontClass} mb-3 text-lg font-semibold text-white`}>
            How it works:
          </h3>
          <ul className="space-y-2">
            {teachingContent.rules.map((rule, idx) => (
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
