import React, { act } from 'react';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createRoot } from 'react-dom/client';
import { LanguageProvider, useLanguage } from './LanguageContext.jsx';
import { LocalizationProvider, useLocalization } from './LocalizationContext.jsx';
import ScenicHomeHero from '../components/home/ScenicHomeHero.jsx';

let container;
let root;

function setup(node) {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => root.render(node));
}

function Wrap() {
  const {
    languageId,
    appLanguageId,
    languageOptions,
    appLanguageOptions,
    selectLanguage,
    selectAppLanguage
  } = useLanguage();
  const { t } = useLocalization();
  return (
    <div>
      <div data-testid="app-id">{appLanguageId}</div>
      <div data-testid="practice-id">{languageId}</div>
      <ScenicHomeHero
        streakDays={0}
        onProfileClick={() => {}}
        appLanguageId={appLanguageId}
        practiceLanguageId={languageId}
        appLanguageOptions={appLanguageOptions}
        practiceLanguageOptions={languageOptions}
        onAppLanguageChange={selectAppLanguage}
        onPracticeLanguageChange={selectLanguage}
        t={t}
      />
    </div>
  );
}

function changeSelect(selector, nextValue) {
  const el = container.querySelector(selector);
  if (!el) throw new Error(`No element matched ${selector}`);
  act(() => {
    el.value = nextValue;
    el.dispatchEvent(new Event('change', { bubbles: true }));
  });
}

describe('ScenicHomeHero dropdown wiring', () => {
  beforeEach(() => {
    global.IS_REACT_ACT_ENVIRONMENT = true;
    window.localStorage.setItem(
      'hlr.preferences.appLanguage',
      JSON.stringify({ id: 'hebrew', confirmed: true })
    );
    window.localStorage.setItem(
      'hlr.preferences.practiceLanguage',
      JSON.stringify({ id: 'hebrew', confirmed: true })
    );
  });

  afterEach(() => {
    if (root) act(() => root.unmount());
    if (container) container.remove();
    root = null;
    container = null;
    window.localStorage.clear();
  });

  it('the App dropdown only updates appLanguageId', () => {
    setup(
      <LanguageProvider>
        <LocalizationProvider>
          <Wrap />
        </LocalizationProvider>
      </LanguageProvider>
    );

    changeSelect('#home-scenic-app-language', 'spanish');

    expect(container.querySelector('[data-testid="app-id"]').textContent).toBe('spanish');
    expect(container.querySelector('[data-testid="practice-id"]').textContent).toBe('hebrew');
  });

  it('the Practice dropdown only updates languageId', () => {
    setup(
      <LanguageProvider>
        <LocalizationProvider>
          <Wrap />
        </LocalizationProvider>
      </LanguageProvider>
    );

    changeSelect('#home-scenic-practice-language', 'english');

    expect(container.querySelector('[data-testid="practice-id"]').textContent).toBe('english');
    expect(container.querySelector('[data-testid="app-id"]').textContent).toBe('hebrew');
  });

  it('changing app then practice leaves both at the selected values', () => {
    setup(
      <LanguageProvider>
        <LocalizationProvider>
          <Wrap />
        </LocalizationProvider>
      </LanguageProvider>
    );

    changeSelect('#home-scenic-app-language', 'spanish');
    expect(container.querySelector('[data-testid="app-id"]').textContent).toBe('spanish');

    changeSelect('#home-scenic-practice-language', 'english');
    expect(container.querySelector('[data-testid="app-id"]').textContent).toBe('spanish');
    expect(container.querySelector('[data-testid="practice-id"]').textContent).toBe('english');
  });
});
