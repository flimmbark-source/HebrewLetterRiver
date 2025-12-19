import React, { useLayoutEffect, useState, useEffect } from 'react';
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
  const [rect, setRect] = useState(null);

  // Measure the target element's bounding box whenever the step changes
  useLayoutEffect(() => {
    if (!step?.targetSelector) {
      setRect(null);
      return;
    }

    const measureElement = () => {
      const element = document.querySelector(step.targetSelector);
      if (element) {
        const box = element.getBoundingClientRect();
        setRect({
          top: box.top,
          left: box.left,
          right: box.right,
          bottom: box.bottom,
          width: box.width,
          height: box.height
        });
      } else {
        setRect(null);
      }
    };

    // Measure immediately
    measureElement();

    // Re-measure on resize
    window.addEventListener('resize', measureElement);
    window.addEventListener('scroll', measureElement);

    return () => {
      window.removeEventListener('resize', measureElement);
      window.removeEventListener('scroll', measureElement);
    };
  }, [step]);

  // Add padding around the spotlight
  const padding = 8;

  // Compute spotlight style with a hole over the target using CSS clip-path
  const spotlightStyle = rect
    ? {
        clipPath: `polygon(
          0% 0%,
          0% 100%,
          100% 100%,
          100% 0%,
          0% 0%,
          0% ${rect.top - padding}px,
          ${rect.left - padding}px ${rect.top - padding}px,
          ${rect.left - padding}px ${rect.bottom + padding}px,
          ${rect.right + padding}px ${rect.bottom + padding}px,
          ${rect.right + padding}px ${rect.top - padding}px,
          ${rect.left - padding}px ${rect.top - padding}px,
          ${rect.left - padding}px 0%,
          0% 0%
        )`
      }
    : {};

  // Position the callout below or above the target depending on space
  const calloutWidth = 320;
  const calloutHeight = 200; // Approximate
  const calloutStyle = rect
    ? {
        position: 'fixed',
        top: rect.bottom + padding + 12 < window.innerHeight - calloutHeight
          ? `${rect.bottom + padding + 12}px`
          : `${Math.max(rect.top - calloutHeight - padding - 12, 16)}px`,
        left: `${Math.min(Math.max(rect.left + rect.width / 2 - calloutWidth / 2, 16), window.innerWidth - calloutWidth - 16)}px`,
        width: `${calloutWidth}px`
      }
    : {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: `${calloutWidth}px`
      };

  // Add pulse animation to highlighted element
  useEffect(() => {
    if (!step?.targetSelector) return;

    const element = document.querySelector(step.targetSelector);
    if (!element) return;

    element.style.position = 'relative';
    element.style.zIndex = '201';

    return () => {
      element.style.position = '';
      element.style.zIndex = '';
    };
  }, [step]);

  return (
    <div className="fixed inset-0 z-[200]" aria-modal="true" role="dialog">
      {/* Dark overlay with cut-out around target */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-all duration-300"
        style={spotlightStyle}
        onClick={onSkip}
        aria-label="Click to skip tutorial"
      />

      {/* Callout card */}
      <div
        className="bg-slate-800 border-2 border-cyan-500 rounded-xl shadow-2xl transition-all duration-300 animate-fadeIn"
        style={calloutStyle}
      >
        <div className="p-4">
          <div className="flex items-start mb-3">
            <div className="text-4xl mr-3 flex-shrink-0">{step.icon}</div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-bold text-lg leading-tight mb-1">{step.title}</h3>
              <div className="text-cyan-400 text-xs font-semibold">
                Step {stepIndex + 1} of {totalSteps}
              </div>
            </div>
          </div>

          <p className="text-slate-300 text-sm mb-4 leading-relaxed">
            {step.description}
          </p>

          {/* Progress dots */}
          <div className="flex justify-center gap-1.5 mb-4">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full transition-all ${
                  index === stepIndex
                    ? 'w-6 bg-cyan-500'
                    : index < stepIndex
                    ? 'w-1.5 bg-cyan-700'
                    : 'w-1.5 bg-slate-700'
                }`}
              />
            ))}
          </div>

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
              className="flex-1 py-2.5 px-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              {isLast ? 'Got it!' : 'Next'}
            </button>
          </div>

          <button
            onClick={onSkip}
            className="block w-full mt-2 text-xs text-slate-400 hover:text-slate-300 transition-colors"
          >
            Skip tutorial
          </button>
        </div>
      </div>
    </div>
  );
}

TutorialSpotlight.propTypes = {
  step: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
    targetSelector: PropTypes.string
  }).isRequired,
  isFirst: PropTypes.bool.isRequired,
  isLast: PropTypes.bool.isRequired,
  onNext: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  onSkip: PropTypes.func.isRequired,
  stepIndex: PropTypes.number.isRequired,
  totalSteps: PropTypes.number.isRequired
};
