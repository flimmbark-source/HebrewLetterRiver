import React, { createContext, useCallback, useContext, useMemo } from 'react';
import { loadLanguage } from '../lib/languageLoader.js';
import {
  formatTemplate,
  getDictionary,
  translate as translateFromDictionary
} from '../i18n/index.js';
import { defaultAppLanguageId } from '../data/languages/index.js';
import { useLanguage } from './LanguageContext.jsx';

const LocalizationContext = createContext({
  languagePack: loadLanguage(),
  interfaceLanguagePack: loadLanguage(defaultAppLanguageId),
  dictionary: getDictionary(defaultAppLanguageId),
  t: (key, fallbackOrReplacements = {}, replacements = {}) => {
    const hasFallback = typeof fallbackOrReplacements === 'string';
    const fallback = hasFallback ? fallbackOrReplacements : undefined;
    const params = hasFallback ? replacements : fallbackOrReplacements;

    const translated = translateFromDictionary(getDictionary(defaultAppLanguageId), key, params);
    if (!translated || translated === key) return fallback ? formatTemplate(fallback, params) : key;
    return translated;
  }
});

export function LocalizationProvider({ children }) {
  const { languageId: practiceLanguageId, appLanguageId } = useLanguage();
  const languagePack = useMemo(() => loadLanguage(practiceLanguageId), [practiceLanguageId]);
  const interfaceLanguagePack = useMemo(() => loadLanguage(appLanguageId), [appLanguageId]);
  const dictionary = useMemo(() => getDictionary(appLanguageId), [appLanguageId]);

  const t = useCallback((key, fallbackOrReplacements = {}, replacements = {}) => {
    const hasFallback = typeof fallbackOrReplacements === 'string';
    const fallback = hasFallback ? fallbackOrReplacements : undefined;
    const params = hasFallback ? replacements : fallbackOrReplacements;

    const translated = translateFromDictionary(dictionary, key, params);
    if (translated && translated !== key) return translated;

    if (import.meta.env.DEV) {
      console.warn('[i18n] Missing translation key', { key, appLanguageId });
    }
    return fallback ? formatTemplate(fallback, params) : key;
  }, [dictionary, appLanguageId]);

  const value = useMemo(
    () => ({
      practiceLanguageId,
      appLanguageId,
      languagePack,
      interfaceLanguagePack,
      dictionary,
      t
    }),
    [practiceLanguageId, appLanguageId, languagePack, interfaceLanguagePack, dictionary, t]
  );

  return <LocalizationContext.Provider value={value}>{children}</LocalizationContext.Provider>;
}

export function useLocalization() {
  return useContext(LocalizationContext);
}
