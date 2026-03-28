/**
 * Deep Script per-language word index.
 *
 * Provides getDeepScriptWordsForLanguage(languageId) which returns
 * the word array for a given language. Falls back to Hebrew if
 * the requested language has no word data.
 */

import { deepScriptWordsHebrew } from './hebrew.js';

// Lazy-loaded language word modules
const loaders = {
  hebrew: () => ({ words: deepScriptWordsHebrew }),
  arabic: () => import('./arabic.js').then(m => ({ words: m.deepScriptWordsArabic })),
  japanese: () => import('./japanese.js').then(m => ({ words: m.deepScriptWordsJapanese })),
  mandarin: () => import('./mandarin.js').then(m => ({ words: m.deepScriptWordsMandarin })),
  russian: () => import('./russian.js').then(m => ({ words: m.deepScriptWordsRussian })),
  spanish: () => import('./spanish.js').then(m => ({ words: m.deepScriptWordsSpanish })),
  french: () => import('./french.js').then(m => ({ words: m.deepScriptWordsFrench })),
  portuguese: () => import('./portuguese.js').then(m => ({ words: m.deepScriptWordsPortuguese })),
  hindi: () => import('./hindi.js').then(m => ({ words: m.deepScriptWordsHindi })),
  bengali: () => import('./bengali.js').then(m => ({ words: m.deepScriptWordsBengali })),
  amharic: () => import('./amharic.js').then(m => ({ words: m.deepScriptWordsAmharic })),
  english: () => import('./english.js').then(m => ({ words: m.deepScriptWordsEnglish })),
};

// Cache loaded word arrays
const cache = {
  hebrew: deepScriptWordsHebrew,
};

/**
 * Get Deep Script words for a language (synchronous, from cache).
 * Returns Hebrew words as fallback if language not yet loaded.
 */
export function getDeepScriptWordsSync(languageId) {
  return cache[languageId] || cache.hebrew || deepScriptWordsHebrew;
}

/**
 * Load Deep Script words for a language (async).
 * Returns the word array once loaded, caches for future sync access.
 */
export async function loadDeepScriptWords(languageId) {
  if (cache[languageId]) return cache[languageId];

  const loader = loaders[languageId];
  if (!loader) return deepScriptWordsHebrew;

  try {
    const result = await (typeof loader === 'function' ? loader() : loader);
    const words = result.words || [];
    cache[languageId] = words;
    return words;
  } catch (err) {
    console.warn(`Failed to load Deep Script words for ${languageId}:`, err);
    return deepScriptWordsHebrew;
  }
}

/**
 * Check if a language has dedicated Deep Script word data.
 */
export function hasDeepScriptWords(languageId) {
  return languageId in loaders;
}
