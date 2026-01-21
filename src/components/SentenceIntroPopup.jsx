import { useEffect, useRef, useState } from 'react';
import FloatingCapsulesGame from './FloatingCapsulesGame';
import { markSentenceIntroduced } from '../lib/introducedSentenceStorage';

/**
 * SentenceIntroPopup - Modal overlay that shows the word-matching mini-game
 * for introducing new sentences to learners.
 *
 * This component:
 * - Creates a full-screen modal overlay
 * - Traps focus for accessibility
 * - Prevents interaction with underlying content
 * - Manages the mini-game lifecycle
 * - Persists completion to storage
 */

export default function SentenceIntroPopup({
  sentenceId,
  sentenceText,
  wordPairs,
  onClose,
  onComplete
}) {
  const [isClosing, setIsClosing] = useState(false);
  const overlayRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    // Store currently focused element to restore later
    previousFocusRef.current = document.activeElement;

    // Prevent scrolling on body
    document.body.style.overflow = 'hidden';

    // Focus the overlay
    if (overlayRef.current) {
      overlayRef.current.focus();
    }

    return () => {
      // Restore scrolling
      document.body.style.overflow = '';

      // Restore focus
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, []);

  // Trap focus within modal
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      const focusableElements = overlayRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (!focusableElements || focusableElements.length === 0) {
        e.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }

    // Escape key handling (could show confirmation dialog)
    if (e.key === 'Escape') {
      handleSkip();
    }
  };

  const handleSkip = () => {
    const confirmSkip = window.confirm(
      'Are you sure you want to skip this introduction? You can always practice these words later.'
    );

    if (confirmSkip) {
      handleClose();
    }
  };

  const handleGameComplete = (stats) => {
    // Save to storage
    markSentenceIntroduced(sentenceId, {
      completionTime: stats.completionTime,
      mismatchCount: stats.mismatchCount
    });

    // Notify parent
    if (onComplete) {
      onComplete(stats);
    }

    // Close after a brief delay for user to see completion
    setTimeout(() => {
      handleClose();
    }, 300);
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  // Cap word pairs to 8 for manageability
  const cappedWordPairs = wordPairs.slice(0, 8);

  return (
    <div
      ref={overlayRef}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-900/95 backdrop-blur-sm transition-opacity duration-200 ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-labelledby="intro-popup-title"
    >
      {/* Modal container */}
      <div
        className={`relative w-full h-full max-w-6xl max-h-[90vh] m-4 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl overflow-hidden transition-transform duration-200 ${
          isClosing ? 'scale-95' : 'scale-100'
        }`}
      >
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-20 p-6 bg-gradient-to-b from-slate-800/90 to-transparent pointer-events-none">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 id="intro-popup-title" className="text-2xl font-bold text-white mb-2">
                Learn These Words
              </h2>
              <p className="text-slate-300 text-sm mb-3">
                Match the Hebrew words with their meanings to continue
              </p>
              <div
                className="hebrew-font text-lg text-blue-300 bg-slate-900/50 px-4 py-2 rounded-lg inline-block"
                dir="rtl"
              >
                {sentenceText}
              </div>
            </div>

            {/* Skip button */}
            <button
              onClick={handleSkip}
              className="pointer-events-auto px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-700/50"
              aria-label="Skip introduction"
            >
              Skip
            </button>
          </div>
        </div>

        {/* Game area */}
        <div className="absolute inset-0 pt-32 pb-8">
          <FloatingCapsulesGame
            wordPairs={cappedWordPairs}
            onComplete={handleGameComplete}
          />
        </div>

        {/* Footer hint */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-800/90 to-transparent pointer-events-none">
          <p className="text-center text-xs text-slate-400">
            Drag the blue Hebrew capsules onto the purple meaning capsules
          </p>
        </div>
      </div>
    </div>
  );
}
