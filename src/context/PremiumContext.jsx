import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { loadState, saveState } from '../lib/storage.js';
import { emit } from '../lib/eventBus.js';
import { bridgeBuilderSections } from '../data/bridgeBuilderSections.js';

/* ──────────────────────────────────────────────────────────────
   Free-tier rules (single source of truth)
   ──────────────────────────────────────────────────────────────
   Letter River           — ALWAYS FREE, unlimited
   Bridge Builder         — First 2 packs free per section, rest premium
   Deep Script            — 3 runs per day free, unlimited premium
   Conversation           — 1 scenario per day free, unlimited premium
   Daily Quests           — ALWAYS FREE
   Achievements           — ALWAYS FREE
   SRS Reviews            — ALWAYS FREE
   Profile customization  — Basic free, premium themes/avatars for premium
   Advanced Stats         — Premium only
   Ad-Free                — Premium only
   ────────────────────────────────────────────────────────────── */

const FREE_PACKS_PER_SECTION = 2;
const FREE_DEEP_SCRIPT_RUNS_PER_DAY = 3;
const FREE_CONVERSATION_SCENARIOS_PER_DAY = 1;

const defaultFeatures = {
  unlimitedModes: false,
  noAds: false,
  advancedStats: false,
  customThemes: false,
  priorityContent: false,
};

const defaultPremiumState = {
  isPremium: false,
  purchasedAt: null,
  plan: null,           // 'monthly' | 'annual' | 'lifetime' | null
  expiresAt: null,      // null for lifetime
  features: { ...defaultFeatures },
};

const STORAGE_KEY = 'premium.status';

function getDailyUsageKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function loadDailyUsage() {
  const dateKey = getDailyUsageKey();
  return loadState(`premium.dailyUsage.${dateKey}`, {
    deepScriptRuns: 0,
    conversationScenarios: 0,
  });
}

function saveDailyUsage(usage) {
  const dateKey = getDailyUsageKey();
  saveState(`premium.dailyUsage.${dateKey}`, usage);
}

/**
 * Determine the set of free pack IDs for a given section.
 * The first FREE_PACKS_PER_SECTION packs (by order in the section's packIds list) are free.
 */
function getFreePacks() {
  const freePacks = new Set();
  for (const section of bridgeBuilderSections) {
    const freeSlice = section.packIds.slice(0, FREE_PACKS_PER_SECTION);
    for (const packId of freeSlice) {
      freePacks.add(packId);
    }
  }
  return freePacks;
}

const freePackIds = getFreePacks();

function isFreePack(packId) {
  return freePackIds.has(packId);
}

const PremiumContext = createContext(null);

export function PremiumProvider({ children }) {
  const [premiumState, setPremiumState] = useState(() => {
    const stored = loadState(STORAGE_KEY, null);
    if (stored && typeof stored === 'object') {
      return {
        ...defaultPremiumState,
        ...stored,
        features: { ...defaultFeatures, ...(stored.features || {}) },
      };
    }
    return { ...defaultPremiumState };
  });

  const [dailyUsage, setDailyUsage] = useState(() => loadDailyUsage());

  // Persist premium state changes
  useEffect(() => {
    saveState(STORAGE_KEY, premiumState);
  }, [premiumState]);

  // Persist daily usage changes
  useEffect(() => {
    saveDailyUsage(dailyUsage);
  }, [dailyUsage]);

  // Reset daily usage at midnight (check on focus)
  useEffect(() => {
    function checkDateRoll() {
      const current = loadDailyUsage();
      setDailyUsage(current);
    }
    window.addEventListener('focus', checkDateRoll);
    return () => window.removeEventListener('focus', checkDateRoll);
  }, []);

  const isPremium = premiumState.isPremium;

  const isFeatureUnlocked = useCallback(
    (featureName) => {
      if (isPremium) return true;
      // Free features that are always unlocked
      const alwaysFreeFeatures = ['letterRiver', 'dailyQuests', 'achievements', 'srsReviews'];
      if (alwaysFreeFeatures.includes(featureName)) return true;
      // Check specific premium features
      if (premiumState.features[featureName]) return true;
      return false;
    },
    [isPremium, premiumState.features]
  );

  const getDailyRunCount = useCallback(() => dailyUsage.deepScriptRuns, [dailyUsage]);
  const getDailyScenarioCount = useCallback(() => dailyUsage.conversationScenarios, [dailyUsage]);

  const isContentLocked = useCallback(
    (contentType, contentId) => {
      if (isPremium) return false;
      switch (contentType) {
        case 'bridgePack':
          return !isFreePack(contentId);
        case 'deepScriptRun':
          return getDailyRunCount() >= FREE_DEEP_SCRIPT_RUNS_PER_DAY;
        case 'conversationScenario':
          return getDailyScenarioCount() >= FREE_CONVERSATION_SCENARIOS_PER_DAY;
        case 'customTheme':
          return true;
        case 'advancedStats':
          return true;
        default:
          return false;
      }
    },
    [isPremium, getDailyRunCount, getDailyScenarioCount]
  );

  const incrementDailyUsage = useCallback((usageType) => {
    setDailyUsage((prev) => {
      const next = { ...prev };
      if (usageType === 'deepScriptRun') {
        next.deepScriptRuns = (prev.deepScriptRuns || 0) + 1;
      } else if (usageType === 'conversationScenario') {
        next.conversationScenarios = (prev.conversationScenarios || 0) + 1;
      }
      return next;
    });
  }, []);

  const getRemainingFreeUses = useCallback(
    (contentType) => {
      if (isPremium) return Infinity;
      switch (contentType) {
        case 'deepScriptRun':
          return Math.max(0, FREE_DEEP_SCRIPT_RUNS_PER_DAY - getDailyRunCount());
        case 'conversationScenario':
          return Math.max(0, FREE_CONVERSATION_SCENARIOS_PER_DAY - getDailyScenarioCount());
        default:
          return Infinity;
      }
    },
    [isPremium, getDailyRunCount, getDailyScenarioCount]
  );

  const setPremiumStatus = useCallback((status) => {
    const features = status.isPremium
      ? {
          unlimitedModes: true,
          noAds: true,
          advancedStats: true,
          customThemes: true,
          priorityContent: true,
        }
      : { ...defaultFeatures };

    setPremiumState({
      isPremium: !!status.isPremium,
      purchasedAt: status.purchasedAt || null,
      plan: status.plan || null,
      expiresAt: status.expiresAt || null,
      features,
    });

    emit('premium_status_changed', { isPremium: !!status.isPremium, plan: status.plan });
  }, []);

  const clearPremium = useCallback(() => {
    setPremiumState({ ...defaultPremiumState });
    emit('premium_status_changed', { isPremium: false, plan: null });
  }, []);

  const value = React.useMemo(
    () => ({
      isPremium,
      premiumState,
      isFeatureUnlocked,
      isContentLocked,
      setPremiumStatus,
      clearPremium,
      incrementDailyUsage,
      getRemainingFreeUses,
      getDailyRunCount,
      getDailyScenarioCount,
      // Constants exposed for consumers
      FREE_PACKS_PER_SECTION,
      FREE_DEEP_SCRIPT_RUNS_PER_DAY,
      FREE_CONVERSATION_SCENARIOS_PER_DAY,
    }),
    [
      isPremium,
      premiumState,
      isFeatureUnlocked,
      isContentLocked,
      setPremiumStatus,
      clearPremium,
      incrementDailyUsage,
      getRemainingFreeUses,
      getDailyRunCount,
      getDailyScenarioCount,
    ]
  );

  return <PremiumContext.Provider value={value}>{children}</PremiumContext.Provider>;
}

export function usePremium() {
  const ctx = useContext(PremiumContext);
  if (!ctx) throw new Error('usePremium must be used within PremiumProvider');
  return ctx;
}
