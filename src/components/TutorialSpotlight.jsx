import React, { useLayoutEffect, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

export default function TutorialSpotlight({
  step,
  isFirst,
  isLast,
  onNext,
  onBack,
  onSkip,
  stepIndex,
  totalSteps
}) {
  const [targetRect, setTargetRect] = useState(null);
  const [targetElement, setTargetElement] = useState(null);

  // Measure and track the target element
  useLayoutEffect(() => {
    if (!step?.targetSelector) {
      setTargetRect(null);
      setTargetElement(null);
      return;
    }

    const measureElement = () => {
      const element = document.querySelector(step.targetSelector);
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetRect({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          right: rect.right,
          bottom: rect.bottom
        });
        setTargetElement(element);
      } else {
        setTargetRect(null);
        setTargetElement(null);
      }
    };

    measureElement();

    const observer = new ResizeObserver(measureElement);
    const mutationObserver = new MutationObserver(measureElement);

    if (targetElement) {
      observer.observe(targetElement);
      mutationObserver.observe(document.body, {
        childList: true,
        subtree: true
      });
    }

    window.addEventListener('resize', measureElement);
    window.addEventListener('scroll', measureElement, true);

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener('resize', measureElement);
      window.removeEventListener('scroll', measureElement, true);
    };
  }, [step?.targetSelector, targetElement]);

  // Handle click detection on target element for interactive steps
  useEffect(() => {
    if (!step?.waitForAction || step.waitForAction !== 'click' || !targetElement) {
      return;
    }

    const handleClick = (e) => {
      // If clicking on the target element, advance to next step
      if (targetElement.contains(e.target)) {
        onNext();
      }
    };

    // Capture phase to intercept before other handlers
    document.addEventListener('click', handleClick, true);

    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, [step?.waitForAction, targetElement, onNext]);

  // Block all interactions except on the target when in interactive mode
  const handleOverlayClick = useCallback((e) => {
    // If we're waiting for an action and they clicked the target, let it through
    if (step?.waitForAction && targetElement?.contains(e.target)) {
      return;
    }

    // Otherwise, block the click
    e.stopPropagation();
    e.preventDefault();
  }, [step?.waitForAction, targetElement]);

  // Calculate callout position - ensure it doesn't overlap target
  const getCalloutStyle = () => {
    if (!targetRect) {
      // Centered modal if no target
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        maxWidth: '90vw',
        width: '400px'
      };
    }

    const calloutWidth = 340;
    const padding = 20;
    const viewportWidth = window.innerWidth;

    // For elements in the bottom half of the screen, just position at top
    const targetCenterY = targetRect.top + targetRect.height / 2;
    const isInLowerHalf = targetCenterY > window.innerHeight / 2;

    if (isInLowerHalf) {
      // Position at top of screen, horizontally centered
      return {
        position: 'fixed',
        top: `${padding}px`,
        left: '50%',
        transform: 'translateX(-50%)',
        width: `${calloutWidth}px`,
        maxWidth: `calc(100vw - ${padding * 2}px)`
      };
    }

    // For upper half, position below the target
    const top = targetRect.bottom + 20;
    const centerX = targetRect.left + targetRect.width / 2;
    const left = Math.max(padding, Math.min(centerX - calloutWidth / 2, viewportWidth - calloutWidth - padding));

    return {
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      width: `${calloutWidth}px`,
      maxWidth: `calc(100vw - ${padding * 2}px)`
    };
  };

  return (
    <>
      {/* Overlay that blocks interactions */}
      <div
        className="fixed inset-0 z-[999]"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        onClick={handleOverlayClick}
        onTouchStart={handleOverlayClick}
      />

      {/* Spotlight highlight for target element */}
      {targetRect && (
        <div
          className="fixed z-[1000] pointer-events-none"
          style={{
            top: `${targetRect.top - 4}px`,
            left: `${targetRect.left - 4}px`,
            width: `${targetRect.width + 8}px`,
            height: `${targetRect.height + 8}px`,
            border: '3px solid #3b82f6',
            borderRadius: '8px',
            boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.3), 0 0 20px rgba(59, 130, 246, 0.5)',
            animation: 'pulse 2s ease-in-out infinite'
          }}
        />
      )}

      {/* Tutorial callout card */}
      <div
        className="z-[1001] bg-slate-800 rounded-xl shadow-2xl border-2 border-blue-500"
        style={getCalloutStyle()}
      >
        <div className="p-5">
          <div className="flex items-start gap-3 mb-3">
            <div className="text-4xl flex-shrink-0">{step.icon}</div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-bold text-lg leading-tight mb-1">
                {step.title}
              </h3>
              <div className="text-blue-400 text-xs font-semibold">
                Step {stepIndex + 1} of {totalSteps}
              </div>
            </div>
          </div>

          <p className="text-slate-300 text-sm mb-4 leading-relaxed">
            {step.description}
          </p>

          {/* Show instruction if waiting for action */}
          {step.waitForAction === 'click' && targetRect && (
            <div className="mb-4 p-3 bg-blue-900/30 border border-blue-500/50 rounded-lg">
              <p className="text-blue-300 text-sm font-semibold">
                👆 Click the highlighted element to continue
              </p>
            </div>
          )}

          {/* Progress dots */}
          <div className="flex justify-center gap-1.5 mb-4">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full transition-all ${
                  index === stepIndex
                    ? 'w-6 bg-blue-500'
                    : index < stepIndex
                    ? 'w-1.5 bg-blue-700'
                    : 'w-1.5 bg-slate-700'
                }`}
              />
            ))}
          </div>

          {/* Navigation buttons - only show if not waiting for action */}
          {!step.waitForAction && (
            <div className="flex gap-2">
              {!isFirst && (
                <button
                  onClick={onBack}
                  className="flex-1 py-2.5 px-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-semibold transition-colors"
                >
                  Back
                </button>
              )}
              <button
                onClick={onNext}
                className="flex-1 py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                {isLast ? 'Got it!' : 'Next'}
              </button>
            </div>
          )}

          <button
            onClick={onSkip}
            className="block w-full mt-2 text-xs text-slate-400 hover:text-slate-300 transition-colors"
          >
            Skip tutorial
          </button>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </>
  );
}

TutorialSpotlight.propTypes = {
  step: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
    targetSelector: PropTypes.string,
    waitForAction: PropTypes.oneOf(['click', 'none'])
  }).isRequired,
  isFirst: PropTypes.bool.isRequired,
  isLast: PropTypes.bool.isRequired,
  onNext: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  onSkip: PropTypes.func.isRequired,
  stepIndex: PropTypes.number.isRequired,
  totalSteps: PropTypes.number.isRequired
};
