/**
 * Mode Select Modal
 *
 * Modal that appears when a user selects a reading text card.
 * Offers two practice modes: "Learn Vocab" and "Vocab Practice"
 */

import React from 'react';

export function ModeSelectModal({
  isVisible,
  onSelectMode,
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-md rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-6 text-center">
          <h2 className={`${appFontClass} mb-2 text-2xl font-bold text-white`}>
            Choose Practice Mode
          </h2>
          <p className={`${appFontClass} text-base text-slate-400`}>
            How would you like to practice?
          </p>
        </div>

        {/* Mode Options */}
        <div className="space-y-4">
          {/* Learn Vocab Mode */}
          <button
            onClick={() => onSelectMode('learn')}
            className="w-full rounded-2xl border-2 border-blue-600 bg-gradient-to-br from-blue-600 to-blue-700 p-6 text-left transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/30"
          >
            <div className="mb-2 flex items-center gap-3">
              <span className="text-3xl">📚</span>
              <h3 className={`${appFontClass} text-xl font-bold text-white`}>
                Learn Vocab
              </h3>
            </div>
            <p className={`${appFontClass} text-sm text-blue-100`}>
              See the Hebrew words and type their translations. Perfect for learning new vocabulary.
            </p>
          </button>

          {/* Vocab Practice Mode */}
          <button
            onClick={() => onSelectMode('practice')}
            className="w-full rounded-2xl border-2 border-purple-600 bg-gradient-to-br from-purple-600 to-purple-700 p-6 text-left transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/30"
          >
            <div className="mb-2 flex items-center gap-3">
              <span className="text-3xl">🎯</span>
              <h3 className={`${appFontClass} text-xl font-bold text-white`}>
                Vocab Practice
              </h3>
            </div>
            <p className={`${appFontClass} text-sm text-purple-100`}>
              Test your memory! Words are hidden and shown as emojis. Type to reveal them.
            </p>
          </button>
        </div>

        {/* Cancel Button */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={onClose}
            className={`${appFontClass} rounded-full border border-slate-600 bg-slate-800 px-8 py-3 text-base font-medium text-slate-300 transition-colors hover:bg-slate-700`}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModeSelectModal;
