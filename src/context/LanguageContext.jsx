import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  defaultAppLanguageId,
  defaultLanguageId,
  languagePacks
} from '../data/languages/index.js';
import { loadState, saveState } from '../lib/storage.js';

const PRACTICE_STORAGE_KEY = 'preferences.practiceLanguage';
const APP_STORAGE_KEY = 'preferences.appLanguage';

const LanguageContext = createContext({
  languageId: defaultLanguageId,
  appLanguageId: defaultAppLanguageId,
  languageOptions: [],
  setLanguageId: () => {},
  selectLanguage: () => {},
  setAppLanguageId: () => {},
  selectAppLanguage: () => {},
  markLanguageSelected: () => {},
  hasSelectedLanguage: false
});

function buildLanguageOptions() {
  return Object.values(languagePacks)
    .map((pack) => ({ id: pack.id, name: pack.name, metadata: pack.metadata ?? {} }))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
}

export function LanguageProvider({ children }) {
  const storedPractice = loadState(PRACTICE_STORAGE_KEY, null);
  const storedApp = loadState(APP_STORAGE_KEY, null);
  const legacyPreferences = loadState('preferences.language', null);

  const initialPracticeId = storedPractice?.id ?? legacyPreferences?.id ?? defaultLanguageId;
  const initialAppId = storedApp?.id ?? legacyPreferences?.id ?? defaultAppLanguageId;
  const initialConfirmed =
    (storedPractice?.confirmed ?? legacyPreferences?.confirmed) === true &&
    (storedApp?.confirmed ?? legacyPreferences?.confirmed) === true;

  const [languageId, setLanguageIdState] = useState(initialPracticeId);
  const [appLanguageId, setAppLanguageIdState] = useState(initialAppId);
  const [hasSelectedLanguage, setHasSelectedLanguage] = useState(initialConfirmed);

  const setLanguageId = useCallback((nextId) => {
    setLanguageIdState(nextId);
  }, []);

  const selectLanguage = useCallback((nextId) => {
    setLanguageIdState(nextId);
    setHasSelectedLanguage(true);
  }, []);

  const setAppLanguageId = useCallback((nextId) => {
    setAppLanguageIdState(nextId);
  }, []);

  const selectAppLanguage = useCallback((nextId) => {
    setAppLanguageIdState(nextId);
    setHasSelectedLanguage(true);
  }, []);

  const markLanguageSelected = useCallback(() => {
    setHasSelectedLanguage(true);
  }, []);

  useEffect(() => {
    saveState(PRACTICE_STORAGE_KEY, { id: languageId, confirmed: hasSelectedLanguage });
  }, [languageId, hasSelectedLanguage]);

  useEffect(() => {
    saveState(APP_STORAGE_KEY, { id: appLanguageId, confirmed: hasSelectedLanguage });
  }, [appLanguageId, hasSelectedLanguage]);

  const languageOptions = useMemo(() => buildLanguageOptions(), []);

  const value = useMemo(
    () => ({
      languageId,
      appLanguageId,
      languageOptions,
      hasSelectedLanguage,
      setLanguageId,
      selectLanguage,
      setAppLanguageId,
      selectAppLanguage,
      markLanguageSelected
    }),
    [
      languageId,
      appLanguageId,
      languageOptions,
      hasSelectedLanguage,
      setLanguageId,
      selectLanguage,
      setAppLanguageId,
      selectAppLanguage,
      markLanguageSelected
    ]
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
