/**
 * Pack Vowel Layouts Intro Modal
 *
 * Shown on first pack open (per pack), displays all unique vowel layouts
 * that appear in the pack. Users can tap each layout glyph to learn about it,
 * or tap "Start" to begin practice.
 */

import React, { useState } from 'react';
import { getVowelLayout } from '../../data/vowelLayouts/hebrewVowelLayouts.js';
import { setShownPackIntro } from '../../lib/vowelLayoutProgress.js';
import VowelLayoutTeachingModal from './VowelLayoutTeachingModal.jsx';

export function PackVowelLayoutsIntroModal({
  isVisible,
  onStart,
  packId,
  packTitle = '',
  layoutIdsInPack = [],
  learnedLayouts = {},
  examples = {},
  practiceFontClass = '',
  appFontClass = ''
}) {
  const [teachingLayoutId, setTeachingLayoutId] = useState(null);

  if (!isVisible) {
    return null;
  }

  // Filter out invalid layout IDs (defensive)
  const validLayoutIds = layoutIdsInPack.filter(id => getVowelLayout(id));

  // Handle "Start" button - mark intro as shown and begin practice
  const handleStart = () => {
    if (packId) {
      setShownPackIntro(packId);
    }
    onStart();
  };

  // Handle backdrop click to start (same as Start button)
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleStart();
    }
  };

  // Open teaching modal for a specific layout
  const handleLayoutClick = (layoutId) => {
    setTeachingLayoutId(layoutId);
  };

  // Close teaching modal and return to intro
  const closeTeachingModal = () => {
    setTeachingLayoutId(null);
  };

  return (
    <>
      {/* Main Intro Modal */}
      <div
        className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 p-4 pt-15"
        onClick={handleBackdropClick}
      >
        <div className="w-full max-w-2xl rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
          {/* Header */}
          <div className="mb-6 text-center">
            <h2 className={`${appFontClass} mb-2 text-2xl font-bold text-white`}>
              Vowel Layouts in this Pack
            </h2>
            {packTitle && (
              <p className={`${appFontClass} text-base text-slate-400`}>
                {packTitle}
              </p>
            )}
            <p className={`${appFontClass} mt-3 text-sm text-slate-300`}>
              These chips help you know which vowel pattern to use. Tap a chip to learn more.
            </p>
          </div>

          {/* Layout Grid */}
          {validLayoutIds.length > 0 ? (
            <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {validLayoutIds.map((layoutId) => {
                const layout = getVowelLayout(layoutId);
                const isLearned = learnedLayouts[layoutId];

                return (
                  <button
                    key={layoutId}
                    onClick={() => handleLayoutClick(layoutId)}
                    className="group relative flex flex-col items-center justify-center gap-2 rounded-2xl border border-slate-600 bg-slate-800 p-6 transition-all hover:scale-105 hover:border-blue-500 hover:bg-slate-750"
                  >
                    {/* Chip Glyph */}
                    <div className="text-4xl" aria-label={`Vowel layout: ${layout.chipLabel}`}>
                      {layout.chipLabel}
                    </div>

                    {/* Layout Title (without chip) */}
                    <div className={`${appFontClass} text-sm text-slate-300 group-hover:text-white`}>
                      {layout.title.replace(layout.chipLabel, '').trim()}
                    </div>

                    {/* NEW/Learned indicator */}
                    {isLearned ? (
                      <div className="absolute right-2 top-2 h-2 w-2 rounded-full bg-green-500" title="Learned" />
                    ) : (
                      <div
                        className={`${appFontClass} absolute right-2 top-2 rounded-full bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white`}
                      >
                        NEW
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className={`${appFontClass} mb-6 text-center text-slate-400`}>
              No vowel layouts tagged in this pack yet.
            </div>
          )}

          {/* Start Button */}
          <div className="flex justify-center">
            <button
              onClick={handleStart}
              className={`${appFontClass} rounded-full bg-blue-600 px-10 py-4 text-lg font-semibold text-white transition-colors hover:bg-blue-500`}
            >
              Start Practice
            </button>
          </div>
        </div>
      </div>

      {/* Teaching Modal (opened when user taps a layout chip) */}
      {teachingLayoutId && (
        <VowelLayoutTeachingModal
          isVisible={true}
          onClose={closeTeachingModal}
          layoutId={teachingLayoutId}
          languageCode="he"
          examples={examples[teachingLayoutId] || []}
          practiceFontClass={practiceFontClass}
          appFontClass={appFontClass}
        />
      )}
    </>
  );
}

export default PackVowelLayoutsIntroModal;
