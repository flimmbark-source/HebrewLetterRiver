import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  defaultAppLanguageId,
  defaultLanguageId,
  languagePacks
} from '../data/languages/index.js';
import { loadState, saveState } from '../lib/storage.js';

const PRACTICE_STORAGE_KEY = 'preferences.practiceLanguage';
const APP_STORAGE_KEY = 'preferences.appLanguage';
const LEGACY_STORAGE_KEY = 'preferences.language';

// App language controls the interface dictionary, while practice language controls
// the learning content pack. The repo already includes i18n JSON files for these
// language packs, and missing individual keys still fall back through i18n/index.js.
const SUPPORTED_APP_LANGUAGE_IDS = Object.keys(languagePacks);

const LanguageContext = createContext({
  languageId: defaultLanguageId,
  appLanguageId: defaultAppLanguageId,
  languageOptions: [],
  appLanguageOptions: [],
  setLanguageId: () => {},
  selectLanguage: () => {},
  setAppLanguageId: () => {},
  selectAppLanguage: () => {},
  markLanguageSelected: () => {},
  hasSelectedLanguage: false
});

function buildLanguageOptions(languageIds = null) {
  const packs = Array.isArray(languageIds)
    ? languageIds.map((id) => languagePacks[id]).filter(Boolean)
    : Object.values(languagePacks);

  return packs
    .map((pack) => ({ id: pack.id, name: pack.name, metadata: pack.metadata ?? {} }))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
}

function normalizeLanguageId(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : value;
}

function getValidLanguageId(candidateId, fallbackId) {
  const normalized = normalizeLanguageId(candidateId);
  return languagePacks[normalized] ? normalized : fallbackId;
}

function getValidAppLanguageId(candidateId, fallbackId = defaultAppLanguageId) {
  const normalized = normalizeLanguageId(candidateId);
  const isSupported = SUPPORTED_APP_LANGUAGE_IDS.includes(normalized);
  return isSupported && languagePacks[normalized] ? normalized : fallbackId;
}

export function LanguageProvider({ children }) {
  const storedPractice = loadState(PRACTICE_STORAGE_KEY, null);
  const storedApp = loadState(APP_STORAGE_KEY, null);
  const legacyPreferences = loadState('preferences.language', null);

  const initialPracticeId = getValidLanguageId(
    storedPractice?.id ?? legacyPreferences?.practiceId ?? legacyPreferences?.id,
    defaultLanguageId
  );
  const initialAppId = getValidAppLanguageId(
    storedApp?.id ?? legacyPreferences?.appId ?? legacyPreferences?.id,
    defaultAppLanguageId
  );
  const initialConfirmed =
    (storedPractice?.confirmed ?? legacyPreferences?.confirmed) === true &&
    (storedApp?.confirmed ?? legacyPreferences?.confirmed) === true;

  const [languageId, setLanguageIdState] = useState(initialPracticeId);
  const [appLanguageId, setAppLanguageIdState] = useState(initialAppId);
  const [hasSelectedLanguage, setHasSelectedLanguage] = useState(initialConfirmed);

  const syncLegacyLanguagePreference = useCallback((nextPracticeId, nextAppId, isConfirmed) => {
    saveState(LEGACY_STORAGE_KEY, {
      id: nextPracticeId,
      practiceId: nextPracticeId,
      appId: nextAppId,
      confirmed: isConfirmed
    });
  }, []);

  const setLanguageId = useCallback((nextId) => {
    setLanguageIdState((current) => {
      const resolved = getValidLanguageId(nextId, current);
      syncLegacyLanguagePreference(resolved, appLanguageId, hasSelectedLanguage);
      return resolved;
    });
  }, [appLanguageId, hasSelectedLanguage, syncLegacyLanguagePreference]);

  const selectLanguage = useCallback((nextId) => {
    setLanguageIdState((current) => {
      const resolved = getValidLanguageId(nextId, current);
      syncLegacyLanguagePreference(resolved, appLanguageId, true);
      return resolved;
    });
    setHasSelectedLanguage(true);
  }, [appLanguageId, syncLegacyLanguagePreference]);

  const setAppLanguageId = useCallback((nextId) => {
    setAppLanguageIdState((current) => {
      const resolved = getValidAppLanguageId(nextId, current);
      syncLegacyLanguagePreference(languageId, resolved, hasSelectedLanguage);
      return resolved;
    });
  }, [languageId, hasSelectedLanguage, syncLegacyLanguagePreference]);

  const selectAppLanguage = useCallback((nextId) => {
    setAppLanguageIdState((current) => {
      const resolved = getValidAppLanguageId(nextId, current);
      syncLegacyLanguagePreference(languageId, resolved, true);
      return resolved;
    });
    setHasSelectedLanguage(true);
  }, [languageId, syncLegacyLanguagePreference]);

  const markLanguageSelected = useCallback(() => {
    setHasSelectedLanguage(true);
    syncLegacyLanguagePreference(languageId, appLanguageId, true);
  }, [appLanguageId, languageId, syncLegacyLanguagePreference]);

  useEffect(() => {
    saveState(PRACTICE_STORAGE_KEY, { id: languageId, confirmed: hasSelectedLanguage });
  }, [languageId, hasSelectedLanguage]);

  useEffect(() => {
    saveState(APP_STORAGE_KEY, { id: appLanguageId, confirmed: hasSelectedLanguage });
  }, [appLanguageId, hasSelectedLanguage]);

  const languageOptions = useMemo(() => buildLanguageOptions(), []);
  const appLanguageOptions = useMemo(() => buildLanguageOptions(SUPPORTED_APP_LANGUAGE_IDS), []);

  const value = useMemo(
    () => ({
      languageId,
      appLanguageId,
      languageOptions,
      appLanguageOptions,
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
      appLanguageOptions,
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

export function useLanguageSettings() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguageSettings must be used within LanguageProvider');
  }
  return context;
}

export function useLanguage() {
  return useLanguageSettings();
}

export function useAppLanguage() {
  const { appLanguageId, setAppLanguageId, selectAppLanguage } = useLanguageSettings();
  return { appLanguageId, setAppLanguageId, selectAppLanguage };
}

export function usePracticeLanguage() {
  const { languageId: practiceLanguageId, setLanguageId, selectLanguage } = useLanguageSettings();
  return { practiceLanguageId, setPracticeLanguageId: setLanguageId, selectPracticeLanguage: selectLanguage };
}
