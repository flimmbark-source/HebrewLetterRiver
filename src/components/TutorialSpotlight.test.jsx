import React, { act } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createRoot } from 'react-dom/client';
import TutorialSpotlight from './TutorialSpotlight.jsx';

describe('TutorialSpotlight ResizeObserver fallback', () => {
  const originalResizeObserver = global.ResizeObserver;
  const originalMutationObserver = global.MutationObserver;
  let container;
  let root;

  beforeEach(() => {
    global.IS_REACT_ACT_ENVIRONMENT = true;
    global.MutationObserver = class {
      observe() {}
      disconnect() {}
    };
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    if (root) {
      act(() => {
        root.unmount();
      });
      root = null;
    }

    if (container) {
      container.remove();
      container = null;
    }

    document.body.innerHTML = '';

    if (originalMutationObserver === undefined) {
      delete global.MutationObserver;
    } else {
      global.MutationObserver = originalMutationObserver;
    }

    if (originalResizeObserver === undefined) {
      delete global.ResizeObserver;
    } else {
      global.ResizeObserver = originalResizeObserver;
    }

    vi.restoreAllMocks();
  });

  it('renders and relies on resize/scroll listeners when ResizeObserver is unavailable', () => {
    delete global.ResizeObserver;

    const addSpy = vi.spyOn(window, 'addEventListener');

    const target = document.createElement('button');
    target.className = 'spotlight-target';
    document.body.appendChild(target);

    expect(() => {
      act(() => {
        root.render(
          <TutorialSpotlight
            step={{
              id: 'step-1',
              title: 'Title',
              description: 'Description',
              icon: '🧪',
              targetSelector: '.spotlight-target'
            }}
            steps={[]}
            tutorialId="tour"
            isFirst
            isLast={false}
            onNext={() => {}}
            onBack={() => {}}
            onSkip={() => {}}
            stepIndex={0}
            totalSteps={3}
          />
        );
      });
    }).not.toThrow();

    expect(addSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    expect(addSpy).toHaveBeenCalledWith('scroll', expect.any(Function), true);
  });
});
