import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { loadState, saveState } from '../lib/storage.js';
import { track } from '../lib/eventTracker.js';

const DEFAULT_FLAGS = {
  newOnboarding: false,
  streakUI: false,
  recommendedSession: false,
  shareCard: false,
  premiumGating: false,
};

const STORAGE_KEY = 'experiment.flags';

const ExperimentContext = createContext(null);

export function ExperimentProvider({ children }) {
  const [flags, setFlags] = useState(() => {
    const saved = loadState(STORAGE_KEY, null);
    return { ...DEFAULT_FLAGS, ...(saved || {}) };
  });

  const setFlag = useCallback((name, value) => {
    setFlags((prev) => {
      const next = { ...prev, [name]: value };
      saveState(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const resetFlags = useCallback(() => {
    setFlags({ ...DEFAULT_FLAGS });
    saveState(STORAGE_KEY, { ...DEFAULT_FLAGS });
  }, []);

  const isEnabled = useCallback(
    (flagName) => {
      const value = !!flags[flagName];
      track('experiment_exposure', { flag: flagName, variant: value ? 'on' : 'off' });
      return value;
    },
    [flags]
  );

  const value = useMemo(
    () => ({ flags, setFlag, resetFlags, isEnabled }),
    [flags, setFlag, resetFlags, isEnabled]
  );

  return (
    <ExperimentContext.Provider value={value}>
      {children}
    </ExperimentContext.Provider>
  );
}

export function useExperiment() {
  const ctx = useContext(ExperimentContext);
  if (!ctx) {
    throw new Error('useExperiment must be used inside <ExperimentProvider>');
  }
  return ctx;
}
