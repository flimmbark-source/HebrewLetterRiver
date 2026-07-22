import React, { act } from 'react';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { LanguageProvider } from '../context/LanguageContext.jsx';
import { LocalizationProvider } from '../context/LocalizationContext.jsx';
import { ToastProvider } from '../context/ToastContext.jsx';
import { ProgressProvider } from '../context/ProgressContext.jsx';
import JourneyNextStep from './JourneyNextStep.jsx';

let container;
let root;

function mount(node) {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => {
    root.render(node);
  });
}

function Harness() {
  return (
    <MemoryRouter>
      <LanguageProvider>
        <LocalizationProvider>
          <ToastProvider>
            <ProgressProvider>
              <JourneyNextStep />
            </ProgressProvider>
          </ToastProvider>
        </LocalizationProvider>
      </LanguageProvider>
    </MemoryRouter>
  );
}

function seedPlayer(journey) {
  // ProgressContext stores per-language state under progress.<languageId>.player;
  // hebrew is the default practice language.
  window.localStorage.setItem(
    'hlr.progress.hebrew.player',
    JSON.stringify({ totals: { sessions: 0 }, letters: {}, journey })
  );
}

describe('JourneyNextStep', () => {
  beforeEach(() => {
    global.IS_REACT_ACT_ENVIRONMENT = true;
    window.localStorage.clear();
  });

  afterEach(() => {
    if (root) {
      act(() => root.unmount());
      root = null;
    }
    container?.remove();
    container = null;
  });

  it('shows progress toward the next locked stage for a fresh player', () => {
    mount(<Harness />);
    expect(container.textContent).toContain('Next stage: Words');
    expect(container.textContent).toContain('letters practiced');
  });

  it('shows the ready-to-advance moment when a stage unlocked without its intro seen', () => {
    seedPlayer({ unlockedStages: ['letters', 'words'], introsSeen: ['letters'], advancedAt: {} });
    mount(<Harness />);
    expect(container.textContent).toContain('Words is unlocked');
    expect(container.textContent).toContain('Start Words');
  });

  it('shows progress toward reading once the words intro was seen', () => {
    seedPlayer({ unlockedStages: ['letters', 'words'], introsSeen: ['letters', 'words'], advancedAt: {} });
    mount(<Harness />);
    expect(container.textContent).toContain('Next stage: Sentences & Reading');
  });
});
