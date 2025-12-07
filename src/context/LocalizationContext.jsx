import React, { createContext, useContext, useMemo } from 'react';
import { loadLanguage } from '../lib/languageLoader.js';
import {
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
    if (!translated || translated === key) return fallback ?? key;
    return translated;
  }
});

export function LocalizationProvider({ children }) {
  const { languageId, appLanguageId } = useLanguage();
  const languagePack = useMemo(() => loadLanguage(languageId), [languageId]);
  const interfaceLanguagePack = useMemo(() => loadLanguage(appLanguageId), [appLanguageId]);
  const dictionary = useMemo(() => getDictionary(appLanguageId), [appLanguageId]);

  const value = useMemo(
    () => ({
      languagePack,
      interfaceLanguagePack,
      dictionary,
            t: (key, fallbackOrReplacements = {}, replacements = {}) => {
        const hasFallback = typeof fallbackOrReplacements === 'string';
        const fallback = hasFallback ? fallbackOrReplacements : undefined;
        const params = hasFallback ? replacements : fallbackOrReplacements;

        const translated = translateFromDictionary(dictionary, key, params);
        if (!translated || translated === key) return fallback ?? key;
        return translated;
      }
    }),
    [languagePack, interfaceLanguagePack, dictionary]
  );

  return <LocalizationContext.Provider value={value}>{children}</LocalizationContext.Provider>;
}

export function useLocalization() {
  return useContext(LocalizationContext);
}
