const prefix = 'hlr.';

function getStorage() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
  } catch (err) {
    // ignore
  }
  return {
    getItem() {
      return null;
    },
    setItem() {},
    removeItem() {}
  };
}

export function loadState(key, fallback) {
  const store = getStorage();
  try {
    const raw = store.getItem(prefix + key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.warn('failed to parse storage', key, err);
    return fallback;
  }
}

export function saveState(key, value) {
  const store = getStorage();
  try {
    store.setItem(prefix + key, JSON.stringify(value));
  } catch (err) {
    console.warn('failed to save storage', key, err);
  }
}

export function removeState(key) {
  const store = getStorage();
  try {
    store.removeItem(prefix + key);
  } catch (err) {
    console.warn('failed to remove storage', key, err);
  }
}

// Export a storage object for backward compatibility
export const storage = {
  get: loadState,
  set: saveState,
  remove: removeState
};

/**
 * Vowel Pattern Learning Progress
 * Stores which patterns have been learned per language
 * Format: { languageId: { patternId: true, ... }, ... }
 */
export function loadLearnedPatterns() {
  return loadState('learnedVowelPatterns', {});
}

export function saveLearnedPatterns(learnedPatterns) {
  saveState('learnedVowelPatterns', learnedPatterns);
}

export function markPatternAsLearned(languageId, patternId) {
  const learned = loadLearnedPatterns();
  if (!learned[languageId]) {
    learned[languageId] = {};
  }
  learned[languageId][patternId] = true;
  saveLearnedPatterns(learned);
}

export function isPatternLearned(languageId, patternId) {
  const learned = loadLearnedPatterns();
  return learned[languageId]?.[patternId] === true;
}

/**
 * Pack Pattern Intro Progress
 * Stores which pack intros have been shown
 * Format: { languageId: { packId: true, ... }, ... }
 */
export function loadPackIntrosShown() {
  return loadState('packIntrosShown', {});
}

export function savePackIntrosShown(packIntros) {
  saveState('packIntrosShown', packIntros);
}

export function markPackIntroAsShown(languageId, packId) {
  const intros = loadPackIntrosShown();
  if (!intros[languageId]) {
    intros[languageId] = {};
  }
  intros[languageId][packId] = true;
  savePackIntrosShown(intros);
}

export function hasSeenPackIntro(languageId, packId) {
  const intros = loadPackIntrosShown();
  return intros[languageId]?.[packId] === true;
}
