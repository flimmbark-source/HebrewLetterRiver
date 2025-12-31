/**
 * Vowel Layout System Modal
 *
 * General educational modal explaining the vowel layout icon system.
 * Shown once on first reading area entry (global, not per-pack).
 * Can be reopened via help button.
 */

import React from 'react';
import { VowelLayoutIcon } from './VowelLayoutIcon.jsx';
import { VOWEL_COLORS } from '../../lib/vowelLayoutDerivation.js';

export function VowelLayoutSystemModal({
  isVisible,
  onClose,
  appFontClass = ''
}) {
  if (!isVisible) {
    return null;
  }

  // Handle backdrop click to close
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Example vowel color mappings for display
  const vowelExamples = [
    { vowel: 'A', color: VOWEL_COLORS.A, sound: '"a" (ah)' },
    { vowel: 'E', color: VOWEL_COLORS.E, sound: '"e" (eh)' },
    { vowel: 'I', color: VOWEL_COLORS.I, sound: '"i" (ee)' },
    { vowel: 'O', color: VOWEL_COLORS.O, sound: '"o" (oh)' },
    { vowel: 'U', color: VOWEL_COLORS.U, sound: '"u" (oo)' },
    { vowel: 'Y', color: VOWEL_COLORS.Y, sound: '"y" (eye)' }
  ];

  // Example shape/beat mappings
  const shapeExamples = [
    { beats: 1, layoutId: 'VL_1_A', shape: 'Circle' },
    { beats: 2, layoutId: 'VL_2_A-A', shape: 'Diamond' },
    { beats: 3, layoutId: 'VL_3_U-A-Y', shape: 'Triangle' },
    { beats: 4, layoutId: 'VL_4_A-O-A-Y', shape: 'Square' }
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 p-4 pt-15 overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-3xl rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl my-4">
        {/* Header */}
        <div className="mb-6 text-center">
          <h2 className={`${appFontClass} mb-2 text-2xl font-bold text-white`}>
            Hebrew Vowel Patterns
          </h2>
          <p className={`${appFontClass} text-base text-slate-400`}>
            Understanding the visual system
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* What Are These Icons? */}
          <section>
            <h3 className={`${appFontClass} mb-3 text-lg font-semibold text-white`}>
              What are these icons?
            </h3>
            <p className={`${appFontClass} text-base text-slate-300 leading-relaxed`}>
              Hebrew words follow vowel patterns. These colorful icons help you visualize and
              learn the vowel sequence in each word. They are read clockwise, starting at the
              top of each shape at 12 o'clock. Each icon appears next to the Hebrew text
              while you practice reading.
            </p>
          </section>

          {/* How Shapes Work */}
          <section>
            <h3 className={`${appFontClass} mb-3 text-lg font-semibold text-white`}>
              Shapes = Number of vowel sounds
            </h3>
            <p className={`${appFontClass} mb-4 text-base text-slate-300`}>
              The shape tells you how many vowel sounds (beats) the word has:
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {shapeExamples.map(({ beats, layoutId, shape }) => (
                <div
                  key={layoutId}
                  className="flex flex-col items-center gap-2 rounded-xl border border-slate-600 bg-slate-800 p-3"
                >
                  <VowelLayoutIcon layoutId={layoutId} size={40} />
                  <div className="text-center">
                    <div className={`${appFontClass} text-sm font-semibold text-white`}>
                      {beats} {beats === 1 ? 'Beat' : 'Beats'}
                    </div>
                    <div className={`${appFontClass} text-xs text-slate-400`}>
                      {shape}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* How Colors Work */}
          <section>
            <h3 className={`${appFontClass} mb-3 text-lg font-semibold text-white`}>
              Colors = Vowel sounds
            </h3>
            <p className={`${appFontClass} mb-4 text-base text-slate-300`}>
              Each color represents a different vowel sound. The colored segments show the
              vowel sequence in order:
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {vowelExamples.map(({ vowel, color, sound }) => (
                <div
                  key={vowel}
                  className="flex items-center gap-3 rounded-lg border border-slate-600 bg-slate-800 p-2"
                >
                  <div
                    className="h-6 w-6 rounded-full ring-2 ring-slate-600 flex-shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <div className="flex flex-col min-w-0">
                    <span className={`${appFontClass} text-sm font-bold text-white`}>
                      {vowel}
                    </span>
                    <span className={`${appFontClass} text-xs text-slate-400 truncate`}>
                      {sound}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* How to Use */}
          <section>
            <h3 className={`${appFontClass} mb-3 text-lg font-semibold text-white`}>
              How to use the icons
            </h3>
            <ul className={`${appFontClass} space-y-2 text-base text-slate-300`}>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 flex-shrink-0">•</span>
                <span>Icons appear in the reading area, next to each Hebrew word</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 flex-shrink-0">•</span>
                <span>Click any icon to see the detailed vowel pattern for that word</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 flex-shrink-0">•</span>
                <span>A "NEW" dot means you haven't learned that pattern yet</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 flex-shrink-0">•</span>
                <span>Use the icons as a visual guide while reading Hebrew text</span>
              </li>
            </ul>
          </section>
        </div>

        {/* Close Button */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={onClose}
            className={`${appFontClass} rounded-full bg-blue-600 px-10 py-4 text-lg font-semibold text-white transition-colors hover:bg-blue-500`}
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}

export default VowelLayoutSystemModal;
