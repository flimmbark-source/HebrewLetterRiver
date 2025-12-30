import React from 'react';

/**
 * VowelPatternChip Component
 *
 * Displays a minimal chip label for a vowel pattern (e.g., "◇ Pattern 1")
 * Shows a "NEW" indicator if the pattern hasn't been learned yet
 * Clicking the chip opens the pattern teaching modal
 *
 * Props:
 * - patternId: string - The pattern ID (e.g., 'P1')
 * - chipLabel: string - The label to display (e.g., '◇ Pattern 1')
 * - isLearned: boolean - Whether the pattern has been learned
 * - onClick: function - Callback when chip is clicked
 */
export function VowelPatternChip({ patternId, chipLabel, isLearned, onClick }) {
  if (!patternId || !chipLabel) {
    return null;
  }

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 rounded-full border border-slate-600 bg-slate-800/70 px-4 py-2 text-sm hover:bg-slate-700/70 transition-colors"
      aria-label={`Vowel pattern ${patternId}: ${chipLabel}${!isLearned ? ' (new)' : ''}`}
    >
      <span className="text-slate-100 font-medium whitespace-nowrap">
        {chipLabel}
      </span>
      {!isLearned && (
        <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-semibold text-blue-200 bg-blue-600/80 rounded">
          NEW
        </span>
      )}
    </button>
  );
}
