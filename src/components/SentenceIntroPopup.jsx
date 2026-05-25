import { useEffect, useRef, useState } from 'react';
import FloatingCapsulesGame from './FloatingCapsulesGame';
import './deepScript/DeepScript.css';
import { markSentenceIntroduced } from '../lib/introducedSentenceStorage';
import { markWordsSeen } from '../lib/seenWordsStorage';

export default function SentenceIntroPopup({
  sentenceId,
  sentenceText,
  wordPairs,
  onClose,
  onComplete
}) {
  const [isClosing, setIsClosing] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const overlayRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    previousFocusRef.current = document.activeElement;
    document.body.style.overflow = 'hidden';

    requestAnimationFrame(() => {
      setIsVisible(true);
    });

    if (overlayRef.current) {
      overlayRef.current.focus();
    }

    const wordIds = wordPairs.map(pair => pair.wordId).filter(Boolean);
    if (wordIds.length > 0) {
      markWordsSeen(wordIds);
    }

    return () => {
      document.body.style.overflow = '';
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [wordPairs]);

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

    if (e.key === 'Escape') {
      handleClose();
    }
  };

  const handleGameComplete = (stats) => {
    markSentenceIntroduced(sentenceId, {
      completionTime: stats.completionTime,
      mismatchCount: stats.mismatchCount
    });

    if (onComplete) {
      onComplete(stats);
    }

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

  const cappedWordPairs = wordPairs.slice(0, 8);

  return (
    <div
      ref={overlayRef}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
        isClosing ? 'opacity-0' : isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-labelledby="intro-popup-title"
    >
      <div
        className={`relative w-[90vw] h-[70vh] md:w-[45vw] md:h-[80vh] max-w-4xl bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${
          isClosing ? 'scale-95 opacity-0' : isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <div className="absolute top-0 left-0 right-0 z-20 p-3 bg-gradient-to-b from-slate-800/95 to-transparent pointer-events-none">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h2 id="intro-popup-title" className="text-lg font-bold text-white">
                Learn These Words
              </h2>
            </div>

            <button
              onClick={handleClose}
              className="pointer-events-auto px-3 py-1.5 text-xs text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-700/50 flex-shrink-0"
              aria-label="Skip introduction"
            >
              Skip
            </button>
          </div>
        </div>

        <div className="absolute inset-0 pt-14 pb-4">
          <FloatingCapsulesGame
            wordPairs={cappedWordPairs}
            onComplete={handleGameComplete}
            bubbleMode
          />
        </div>
      </div>
    </div>
  );
}
