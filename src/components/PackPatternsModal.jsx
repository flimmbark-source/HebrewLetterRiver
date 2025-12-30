import React, { useEffect } from 'react';

/**
 * PackPatternsModal Component
 *
 * One-time intro modal shown when starting a pack with vowel patterns.
 * Lists all patterns used in the pack with their chip labels.
 * Tapping a pattern opens its detailed teaching modal.
 *
 * Props:
 * - isOpen: boolean - Whether the modal is visible
 * - packName: string - Name of the pack (e.g., "Basic Connectors")
 * - patterns: array - Array of pattern objects with id, chipLabel, title
 * - onPatternClick: function(patternId) - Callback when a pattern is clicked
 * - onClose: function - Callback when modal is closed
 */
export function PackPatternsModal({
  isOpen,
  packName,
  patterns,
  onPatternClick,
  onClose
}) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen || !patterns || patterns.length === 0) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-white mb-2">
            Vowel Patterns in {packName}
          </h2>
          <p className="text-slate-300">
            This pack uses {patterns.length} vowel pattern{patterns.length > 1 ? 's' : ''}.
            Each pattern helps you learn the pronunciation structure.
            Tap any pattern to learn more about it.
          </p>
        </div>

        {/* Pattern List */}
        <div className="space-y-3 mb-6">
          {patterns.map((pattern) => (
            <button
              key={pattern.id}
              onClick={() => onPatternClick(pattern.id)}
              className="w-full flex items-center justify-between p-4 rounded-lg border border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 transition-colors text-left"
            >
              <div className="flex-1">
                <div className="text-lg font-semibold text-white mb-1">
                  {pattern.chipLabel}
                </div>
                <div className="text-sm text-slate-300">
                  {pattern.title}
                </div>
              </div>
              <div className="text-slate-400">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </button>
          ))}
        </div>

        {/* Close Button */}
        <div className="flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
          >
            Got it, let's practice!
          </button>
        </div>
      </div>
    </div>
  );
}
