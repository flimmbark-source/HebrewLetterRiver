import React, { act } from 'react';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createRoot } from 'react-dom/client';
import { LanguageProvider, useLanguage } from './LanguageContext.jsx';
import { LocalizationProvider, useLocalization } from './LocalizationContext.jsx';

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

function getByTestId(id) {
  const el = container.querySelector(`[data-testid="${id}"]`);
  if (!el) throw new Error(`No element with data-testid="${id}"`);
  return el;
}

function click(id) {
  act(() => {
    getByTestId(id).dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
}

function Harness({ probeChildren }) {
  return (
    <LanguageProvider>
      <LocalizationProvider>{probeChildren}</LocalizationProvider>
    </LanguageProvider>
  );
}

function BasicProbe() {
  const { appLanguageId, selectAppLanguage } = useLanguage();
  const { t } = useLocalization();
  return (
    <div>
      <div data-testid="current-app">{appLanguageId}</div>
      <div data-testid="home-key">{t('app.nav.home', 'Home')}</div>
      <button data-testid="switch-en" onClick={() => selectAppLanguage('english')}>EN</button>
      <button data-testid="switch-he" onClick={() => selectAppLanguage('hebrew')}>HE</button>
    </div>
  );
}

describe('language switching', () => {
  beforeEach(() => {
    global.IS_REACT_ACT_ENVIRONMENT = true;
    window.localStorage.clear();
  });

  afterEach(() => {
    if (root) {
      act(() => root.unmount());
      root = null;
    }
    if (container) {
      container.remove();
      container = null;
    }
    window.localStorage.clear();
  });

  it('switches from hebrew to english properly', () => {
    mount(<Harness probeChildren={<BasicProbe />} />);

    click('switch-he');
    expect(getByTestId('current-app').textContent).toBe('hebrew');
    expect(getByTestId('home-key').textContent).not.toBe('Home');

    click('switch-en');
    expect(getByTestId('current-app').textContent).toBe('english');
    expect(getByTestId('home-key').textContent).toBe('Home');
  });

  it('initializes from saved hebrew app language, then switches to english', () => {
    window.localStorage.setItem(
      'hlr.preferences.appLanguage',
      JSON.stringify({ id: 'hebrew', confirmed: true })
    );
    window.localStorage.setItem(
      'hlr.preferences.practiceLanguage',
      JSON.stringify({ id: 'spanish', confirmed: true })
    );

    mount(<Harness probeChildren={<BasicProbe />} />);

    expect(getByTestId('current-app').textContent).toBe('hebrew');
    expect(getByTestId('home-key').textContent).not.toBe('Home');

    click('switch-en');
    expect(getByTestId('current-app').textContent).toBe('english');
    expect(getByTestId('home-key').textContent).toBe('Home');
  });

  it('legacy id field (practice language) does not force hebrew app language', () => {
    window.localStorage.setItem(
      'hlr.preferences.language',
      JSON.stringify({ id: 'hebrew', confirmed: true })
    );

    mount(<Harness probeChildren={<BasicProbe />} />);

    expect(getByTestId('current-app').textContent).toBe('english');
  });

  it('switches direction (RTL/LTR) and dictionary when switching from hebrew', () => {
    window.localStorage.setItem(
      'hlr.preferences.appLanguage',
      JSON.stringify({ id: 'hebrew', confirmed: true })
    );
    window.localStorage.setItem(
      'hlr.preferences.practiceLanguage',
      JSON.stringify({ id: 'hebrew', confirmed: true })
    );

    function Probe() {
      const { appLanguageId, selectAppLanguage } = useLanguage();
      const { t, interfaceLanguagePack } = useLocalization();
      const targets = ['english', 'spanish', 'french', 'arabic', 'russian', 'japanese', 'mandarin'];
      return (
        <div>
          <div data-testid="cur">{appLanguageId}</div>
          <div data-testid="dir">{interfaceLanguagePack.metadata?.textDirection}</div>
          <div data-testid="greeting">{t('home.scenic.greeting', 'Good morning, Explorer!')}</div>
          {targets.map((id) => (
            <button key={id} data-testid={`go-${id}`} onClick={() => selectAppLanguage(id)}>{id}</button>
          ))}
        </div>
      );
    }

    mount(<Harness probeChildren={<Probe />} />);

    expect(getByTestId('cur').textContent).toBe('hebrew');
    expect(getByTestId('dir').textContent).toBe('rtl');
    const hebrewGreeting = getByTestId('greeting').textContent;
    expect(hebrewGreeting).not.toBe('Good morning, Explorer!');

    for (const target of ['english', 'spanish', 'french', 'arabic', 'russian', 'japanese', 'mandarin']) {
      click(`go-${target}`);
      expect(getByTestId('cur').textContent).toBe(target);
      // app language should never get stuck on hebrew once switched away
      expect(getByTestId('greeting').textContent).not.toBe(hebrewGreeting);
      const expectedDir = target === 'arabic' ? 'rtl' : 'ltr';
      expect(getByTestId('dir').textContent).toBe(expectedDir);
    }
  });
});
