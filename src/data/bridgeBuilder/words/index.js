/**
 * Bridge Builder per-language word index.
 *
 * Provides getBridgeBuilderWordsForLanguage(languageId) which returns
 * the word array for a given language. Falls back to Hebrew if
 * the requested language has no word data.
 */

import { bridgeBuilderWordsHebrew } from './hebrew.js';

// Lazy-loaded language word modules
const loaders = {
  hebrew: () => ({ words: bridgeBuilderWordsHebrew }),
  arabic: () => import('./arabic.js').then(m => ({ words: m.bridgeBuilderWordsArabic })),
  japanese: () => import('./japanese.js').then(m => ({ words: m.bridgeBuilderWordsJapanese })),
  mandarin: () => import('./mandarin.js').then(m => ({ words: m.bridgeBuilderWordsMandarin })),
  russian: () => import('./russian.js').then(m => ({ words: m.bridgeBuilderWordsRussian })),
  spanish: () => import('./spanish.js').then(m => ({ words: m.bridgeBuilderWordsSpanish })),
  french: () => import('./french.js').then(m => ({ words: m.bridgeBuilderWordsFrench })),
  portuguese: () => import('./portuguese.js').then(m => ({ words: m.bridgeBuilderWordsPortuguese })),
  hindi: () => import('./hindi.js').then(m => ({ words: m.bridgeBuilderWordsHindi })),
  bengali: () => import('./bengali.js').then(m => ({ words: m.bridgeBuilderWordsBengali })),
  amharic: () => import('./amharic.js').then(m => ({ words: m.bridgeBuilderWordsAmharic })),
  english: () => import('./english.js').then(m => ({ words: m.bridgeBuilderWordsEnglish })),
};

// Cache loaded word arrays
const cache = {
  hebrew: bridgeBuilderWordsHebrew,
};

/**
 * Get Bridge Builder words for a language (synchronous, from cache).
 * Returns Hebrew words as fallback if language not yet loaded.
 */
export function getBridgeBuilderWordsSync(languageId) {
  return cache[languageId] || cache.hebrew || bridgeBuilderWordsHebrew;
}

/**
 * Load Bridge Builder words for a language (async).
 * Returns the word array once loaded, caches for future sync access.
 */
export async function loadBridgeBuilderWords(languageId) {
  if (cache[languageId]) return cache[languageId];

  const loader = loaders[languageId];
  if (!loader) return bridgeBuilderWordsHebrew;

  try {
    const result = await (typeof loader === 'function' ? loader() : loader);
    const words = result.words || [];
    cache[languageId] = words;
    return words;
  } catch (err) {
    console.warn(`Failed to load Bridge Builder words for ${languageId}:`, err);
    return bridgeBuilderWordsHebrew;
  }
}

/**
 * Check if a language has dedicated Bridge Builder word data.
 */
export function hasBridgeBuilderWords(languageId) {
  return languageId in loaders;
}
