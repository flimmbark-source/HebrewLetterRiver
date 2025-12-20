import React, { useLayoutEffect, useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useLocalization } from '../context/LocalizationContext.jsx';

export default function TutorialSpotlight({
  step,
  steps,
  tutorialId,
  isFirst,
  isLast,
  onNext,
  onBack,
  onSkip,
  stepIndex,
  totalSteps
}) {
  const { t } = useLocalization();
  const [targetRect, setTargetRect] = useState(null);
  const [targetElement, setTargetElement] = useState(null);

  const isConfirmLanguagesStep = step?.id === 'confirmLanguages';

  // --- CONFIG: step-specific behavior ---------------------------------
  // Step numbers shown to user are 1-based; stepIndex is 0-based.
  const STEP_5_INDEX = 4;

  // ✅ Step 5: remove Back button (prevents getting stuck)
  const disableBackOnThisStep = stepIndex === STEP_5_INDEX;

  // ✅ Route per step (edit these to match your app)
  // If you use hash routing, use values like '#/home'.
  // If you use history routing, use values like '/home'.
  const STEP_ROUTE_BY_INDEX = {
    // 0: '/',
    // 1: '/some-page',
    // 2: '/another-page',
    // 3: '/...',
    4: '/',
    6: '/',
    7: '/achievements',
    9: '/achievements',
    10: '/settings',
    12: '/settings',
  };

  const navigateTo = (route) => {
    if (!route) return;

    // Hash router
    if (route.startsWith('#')) {
      if (window.location.hash !== route) {
        window.location.hash = route;
      }
    } else {
      // History router (SPA-friendly)
      try {
        if (window.location.pathname !== route) {
          window.history.pushState({}, '', route);
          window.dispatchEvent(new PopStateEvent('popstate'));
        }
      } catch {
        // Fallback full navigation
        if (window.location.pathname !== route) {
          window.location.assign(route);
        }
      }
    }

    // Scroll to top (often helps targets appear)
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    } catch {
      window.scrollTo(0, 0);
    }
  };

  const getRouteForStepIndex = (idx) => {
    // Prefer an explicit route on the step object if you happen to add it later.
    // (No harm if you never do.)
    if (idx === stepIndex && step?.route) return step.route;

    const stepFromTutorial = steps?.[idx];
    if (stepFromTutorial?.navigateTo) return stepFromTutorial.navigateTo;
    if (stepFromTutorial?.route) return stepFromTutorial.route;

    return STEP_ROUTE_BY_INDEX[idx] || null;
  };

  // ✅ Step 5: force navigation to the main page when entering this step
  useEffect(() => {
    if (tutorialId !== 'firstTime') return;
    if (stepIndex !== STEP_5_INDEX) return;
    navigateTo(getRouteForStepIndex(STEP_5_INDEX) || '/');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex, tutorialId]);

  // Measure the callout so we can flip/clamp it reliably
  const calloutRef = useRef(null);
  const [calloutHeight, setCalloutHeight] = useState(0);

  useLayoutEffect(() => {
    if (!calloutRef.current) return;

    const measure = () => {
      const h = calloutRef.current?.getBoundingClientRect?.().height || 0;
      setCalloutHeight(h);
    };

    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(calloutRef.current);

    window.addEventListener('resize', measure);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [stepIndex, step?.title, step?.description, step?.waitForAction]);

  // Measure and track the target element
  useLayoutEffect(() => {
    if (!step?.targetSelector) {
      setTargetRect(null);
      setTargetElement(null);
      return;
    }

    let observer = null;
    let mutationObserver = null;

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

    mutationObserver = new MutationObserver(measureElement);
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    const elementNow = document.querySelector(step.targetSelector);
    if (elementNow) {
      observer = new ResizeObserver(measureElement);
      observer.observe(elementNow);
    }

    window.addEventListener('resize', measureElement);
    window.addEventListener('scroll', measureElement, true);

    return () => {
      if (observer) observer.disconnect();
      if (mutationObserver) mutationObserver.disconnect();
      window.removeEventListener('resize', measureElement);
      window.removeEventListener('scroll', measureElement, true);
    };
  }, [step?.targetSelector]);

  // Handle click detection on target element for interactive steps
  useEffect(() => {
    if (!step?.waitForAction || step.waitForAction !== 'click' || !targetElement) {
      return;
    }

    const handleClick = (e) => {
      if (targetElement.contains(e.target)) {
        onNext();
      }
    };

    document.addEventListener('click', handleClick, true);

    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, [step?.waitForAction, targetElement, onNext]);

  // Transparent click-blocker: prevents interaction everywhere EXCEPT the target's rect.
  const blockEvent = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const getBlockers = () => {
    if (isConfirmLanguagesStep) return [];

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const blockerStyleBase = {
      position: 'fixed',
      zIndex: 999,
      pointerEvents: 'auto',
      background: 'rgba(0,0,0,0.001)'
    };

    if (!targetRect) {
      return [
        {
          key: 'full',
          style: { ...blockerStyleBase, top: 0, left: 0, width: vw, height: vh }
        }
      ];
    }

    const holePad = 6;

    const topY = Math.max(0, Math.min(vh, targetRect.top - holePad));
    const bottomY = Math.max(0, Math.min(vh, targetRect.bottom + holePad));
    const leftX = Math.max(0, Math.min(vw, targetRect.left - holePad));
    const rightX = Math.max(0, Math.min(vw, targetRect.right + holePad));

    const safeW = (n) => Math.max(0, n);
    const safeH = (n) => Math.max(0, n);

    return [
      { key: 'top', style: { ...blockerStyleBase, top: 0, left: 0, width: vw, height: safeH(topY) } },
      {
        key: 'bottom',
        style: { ...blockerStyleBase, top: bottomY, left: 0, width: vw, height: safeH(vh - bottomY) }
      },
      {
        key: 'left',
        style: { ...blockerStyleBase, top: topY, left: 0, width: safeW(leftX), height: safeH(bottomY - topY) }
      },
      {
        key: 'right',
        style: { ...blockerStyleBase, top: topY, left: rightX, width: safeW(vw - rightX), height: safeH(bottomY - topY) }
      }
    ];
  };

  // Calculate callout position - flip + clamp so it never renders off-screen
  const getCalloutStyle = () => {
    // Minimal per-step y-offsets live here (0-based stepIndex)
    const stepYOffsetByTutorial = {
      firstTime: {
      1: 500, // Step 2 (stepIndex 1)
      3: -190,
      4: 170,
      5: 500,
      6: 0,
      7: -190, // Step 8 (stepIndex 7)
      8: 300,
      11: -190,
      12: -190,
      },
      tour: {
      0: 0,
      1: 500,
      2: 300,
      3: -200,
      },
      gameSetup: {
      0: 0,
      1: 0,
      2: 500,
      3: 0,
      },
    };

  const currentOffsets = stepYOffsetByTutorial[tutorialId] || {};
  const stepYOffset = currentOffsets[stepIndex] ?? 0;

  if (!targetRect) {
    return {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: `translate(-50%, calc(-50% + ${stepYOffset}px))`,
      maxWidth: '90vw',
      width: '400px'
    };
}

    const calloutWidth = 340;
    const edgePadding = 16;
    const topOffset = 100;
    const gap = 20;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const h = calloutHeight || 240;

    const targetOffscreen =
      targetRect.bottom < 0 ||
      targetRect.top > vh ||
      targetRect.right < 0 ||
      targetRect.left > vw;

    if (targetOffscreen) {
      let top = topOffset + stepYOffset;
      top = Math.max(edgePadding, Math.min(top, vh - h - edgePadding));
      return {
        position: 'fixed',
        top: `${top}px`,
        left: '50%',
        transform: 'translateX(-50%)',
        width: `${calloutWidth}px`,
        maxWidth: `calc(100vw - ${edgePadding * 2}px)`
      };
    }

    const targetCenterY = targetRect.top + targetRect.height / 2;
    const isInLowerHalf = targetCenterY > vh / 2;

    const centerX = targetRect.left + targetRect.width / 2;
    const clampedLeft = Math.max(
      edgePadding,
      Math.min(centerX - calloutWidth / 2, vw - calloutWidth - edgePadding)
    );

    if (isInLowerHalf) {
      let top = topOffset + stepYOffset;
      top = Math.max(edgePadding, Math.min(top, vh - h - edgePadding));
      return {
        position: 'fixed',
        top: `${top}px`,
        left: '50%',
        transform: 'translateX(-50%)',
        width: `${calloutWidth}px`,
        maxWidth: `calc(100vw - ${edgePadding * 2}px)`
      };
    }

    let top = targetRect.bottom + gap + stepYOffset;

    if (top + h + edgePadding > vh) {
      top = targetRect.top - gap - h + stepYOffset;
    }

    top = Math.max(edgePadding, Math.min(top, vh - h - edgePadding));

    return {
      position: 'fixed',
      top: `${top}px`,
      left: `${clampedLeft}px`,
      width: `${calloutWidth}px`,
      maxWidth: `calc(100vw - ${edgePadding * 2}px)`
    };
  };

  const blockers = getBlockers();

  return (
    <>
      {blockers.map((b) => (
        <div
          key={b.key}
          aria-hidden="true"
          style={b.style}
          onPointerDownCapture={blockEvent}
          onMouseDownCapture={blockEvent}
          onTouchStartCapture={blockEvent}
          onClickCapture={blockEvent}
        />
      ))}

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
            boxShadow:
              '0 0 0 4px rgba(59, 130, 246, 0.3), 0 0 20px rgba(59, 130, 246, 0.5)',
            animation: 'pulse 2s ease-in-out infinite'
          }}
        />
      )}

      <div
        ref={calloutRef}
        className="z-[1001] bg-slate-800 rounded-xl shadow-2xl border-2 border-blue-500"
        style={getCalloutStyle()}
      >
        <div className="p-5">
          <div className="flex items-start gap-3 mb-3">
            <div className="text-4xl flex-shrink-0">{step.icon}</div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-bold text-lg leading-tight mb-1">{step.title}</h3>
              <div className="text-blue-400 text-xs font-semibold">
                {t('tutorial.stepCounter', {
                  current: stepIndex + 1,
                  total: totalSteps
                })}
              </div>
            </div>
          </div>

          <p className="text-slate-300 text-sm mb-4 leading-relaxed">{step.description}</p>

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

          {!step.waitForAction && (
            <div className="flex gap-2">
              {!isFirst && !disableBackOnThisStep && (
                <button
                  onClick={onBack}
                  className="flex-1 py-2.5 px-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-semibold transition-colors"
                >
                  {t('tutorial.back')}
                </button>
              )}
              <button
                onClick={onNext}
                className="flex-1 py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                {isLast ? t('tutorial.gotIt') : t('tutorial.next')}
              </button>
            </div>
          )}

          <button
            onClick={onSkip}
            className="block w-full mt-2 text-xs text-slate-400 hover:text-slate-300 transition-colors"
          >
            {t('tutorial.skip')}
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
    waitForAction: PropTypes.oneOf(['click', 'none']),

    // Optional: if you ever choose to pass a route per step
    route: PropTypes.string
  }).isRequired,
  tutorialId: PropTypes.string,
  isFirst: PropTypes.bool.isRequired,
  isLast: PropTypes.bool.isRequired,
  onNext: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  onSkip: PropTypes.func.isRequired,
  stepIndex: PropTypes.number.isRequired,
  totalSteps: PropTypes.number.isRequired,
  steps: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      navigateTo: PropTypes.string,
      route: PropTypes.string
    })
  )
};
