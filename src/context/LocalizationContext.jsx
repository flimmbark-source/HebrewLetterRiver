import React, { createContext, useContext, useMemo } from 'react';
import { loadLanguage } from '../lib/languageLoader.js';
import { getDictionary, translate as translateFromDictionary } from '../i18n/index.js';

const LocalizationContext = createContext({
  languagePack: loadLanguage(),
  dictionary: getDictionary('english'),
  t: (key, replacements) => translateFromDictionary(getDictionary('english'), key, replacements)
});

export function LocalizationProvider({ children }) {
  const languagePack = useMemo(() => loadLanguage(), []);
  const dictionary = useMemo(() => getDictionary(languagePack.id), [languagePack.id]);

  const value = useMemo(
    () => ({
      languagePack,
      dictionary,
      t: (key, replacements = {}) => translateFromDictionary(dictionary, key, replacements)
    }),
    [languagePack, dictionary]
  );

  return <LocalizationContext.Provider value={value}>{children}</LocalizationContext.Provider>;
}

export function useLocalization() {
  return useContext(LocalizationContext);
}
