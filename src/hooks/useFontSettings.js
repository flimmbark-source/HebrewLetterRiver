import { useCallback, useEffect, useMemo, useState } from 'react';
import { getFontClass } from '../lib/vocabLanguageAdapter.js';

// Hebrew-specific font shuffle options (only applicable when language is Hebrew)
const SHUFFLE_FONT_CLASSES = [
  'game-font-frank-ruhl',
  'game-font-noto-serif',
  'game-font-taamey-frank',
  'game-font-ezra-sil',
  'game-font-keter-yg',
];

function hashSeed(seed) {
  const str = String(seed ?? '');
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function normalizeFont(fontValue) {
  if (fontValue === 'opendyslexic') return 'lexend';
  return fontValue || 'default';
}

function readSettings() {
  try {
    const raw = localStorage.getItem('gameSettings');
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    console.error('Failed to parse game settings for font usage', error);
    return {};
  }
}

export function useFontSettings() {
  const [settings, setSettings] = useState(() => readSettings());

  useEffect(() => {
    const syncSettings = () => setSettings(readSettings());
    syncSettings();
    window.addEventListener('gameSettingsChanged', syncSettings);
    window.addEventListener('storage', syncSettings);
    return () => {
      window.removeEventListener('gameSettingsChanged', syncSettings);
      window.removeEventListener('storage', syncSettings);
    };
  }, []);

  const selectedGameFont = normalizeFont(settings.gameFont);
  const fontShuffleEnabled = !!settings.fontShuffle;
  const selectedAppFont = normalizeFont(settings.appFont);

  const getGameFontClass = useCallback((seed) => {
    if (fontShuffleEnabled) {
      const index = hashSeed(seed) % SHUFFLE_FONT_CLASSES.length;
      return SHUFFLE_FONT_CLASSES[index];
    }
    if (selectedGameFont === 'default') return '';
    return `game-font-${selectedGameFont}`;
  }, [fontShuffleEnabled, selectedGameFont]);

  const appFontClass = useMemo(() => {
    if (selectedAppFont === 'default') return 'app-font-default';
    return `app-font-${selectedAppFont}`;
  }, [selectedAppFont]);

  /**
   * Get font class for native script display, language-aware.
   * For Hebrew: uses the user's game font preference / shuffle.
   * For other languages: uses the language-specific font class from the language pack.
   */
  const getNativeScriptFontClass = useCallback((seed, languageId) => {
    if (!languageId || languageId === 'hebrew') {
      return getGameFontClass(seed);
    }
    return getFontClass(languageId);
  }, [getGameFontClass]);

  return {
    getGameFontClass,
    getNativeScriptFontClass,
    appFontClass,
  };
}
