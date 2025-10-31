import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { defaultLanguageId, languagePacks } from '../data/languages/index.js';
import { loadState, saveState } from '../lib/storage.js';

const STORAGE_KEY = 'preferences.language';

const LanguageContext = createContext({
  languageId: defaultLanguageId,
  languageOptions: [],
  setLanguageId: () => {},
  selectLanguage: () => {},
  markLanguageSelected: () => {},
  hasSelectedLanguage: false
});

function buildLanguageOptions() {
  return Object.values(languagePacks)
    .map((pack) => ({ id: pack.id, name: pack.name, metadata: pack.metadata ?? {} }))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
}

export function LanguageProvider({ children }) {
  const stored = loadState(STORAGE_KEY, null);
  const initialId = stored?.id ?? defaultLanguageId;
  const initialConfirmed = stored?.confirmed === true;

  const [languageId, setLanguageIdState] = useState(initialId);
  const [hasSelectedLanguage, setHasSelectedLanguage] = useState(initialConfirmed);

  const setLanguageId = useCallback((nextId) => {
    setLanguageIdState(nextId);
  }, []);

  const selectLanguage = useCallback((nextId) => {
    setLanguageIdState(nextId);
    setHasSelectedLanguage(true);
  }, []);

  const markLanguageSelected = useCallback(() => {
    setHasSelectedLanguage(true);
  }, []);

  useEffect(() => {
    saveState(STORAGE_KEY, { id: languageId, confirmed: hasSelectedLanguage });
  }, [languageId, hasSelectedLanguage]);

  const languageOptions = useMemo(() => buildLanguageOptions(), []);

  const value = useMemo(
    () => ({
      languageId,
      languageOptions,
      hasSelectedLanguage,
      setLanguageId,
      selectLanguage,
      markLanguageSelected
    }),
    [languageId, languageOptions, hasSelectedLanguage, setLanguageId, selectLanguage, markLanguageSelected]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
