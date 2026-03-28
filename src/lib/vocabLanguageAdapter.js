/**
 * vocabLanguageAdapter.js
 *
 * Provides language-agnostic access to word data for Bridge Builder and Deep Script.
 * All word objects use `hebrew`/`english` fields internally (legacy structure).
 * This adapter provides normalized accessors so components can work with any language.
 *
 * The key abstraction: components should call getNativeScript(word) and getMeaning(word)
 * instead of accessing word.hebrew or word.english directly.
 */

import { getLanguageDefinition } from '../data/languages/index.js';

// ─── Word field accessors ───────────────────────────────────
// These read the language-agnostic field if present, falling back to legacy fields.

/**
 * Get the native script text for a word (e.g., 'שלום', 'مرحبا', 'こんにちは').
 * Reads `nativeScript` first, falls back to `hebrew` for backward compat.
 */
export function getNativeScript(word) {
  return word?.nativeScript ?? word?.hebrew ?? '';
}

/**
 * Get the meaning/translation of a word (English gloss).
 * Reads `meaning` first, falls back to `english` then `translation`.
 */
export function getMeaning(word) {
  return word?.meaning ?? word?.english ?? word?.translation ?? '';
}

/**
 * Get the letters array for a word.
 */
export function getLetters(word) {
  return word?.letters ?? [...getNativeScript(word)];
}

/**
 * Get the language ID for a word, falling back to 'hebrew'.
 */
export function getWordLanguageId(word) {
  return word?.languageId ?? 'hebrew';
}

// ─── Language metadata helpers ──────────────────────────────

/**
 * Get the text direction for a language ('rtl' or 'ltr').
 */
export function getTextDirection(languageId) {
  const pack = getLanguageDefinition(languageId);
  return pack?.metadata?.textDirection ?? 'ltr';
}

/**
 * Get the font CSS class for a language.
 */
export function getFontClass(languageId) {
  const pack = getLanguageDefinition(languageId);
  return pack?.metadata?.fontClass ?? '';
}

/**
 * Get all unique letters from a language's consonant definitions.
 * Used as the letter pool for Deep Script combat.
 */
export function getLetterPoolForLanguage(languageId) {
  const pack = getLanguageDefinition(languageId);
  if (!pack) return [];
  const consonants = pack.consonants || pack.basicConsonants || pack.items || [];
  return consonants.map(c => c.symbol).filter(Boolean);
}

// ─── Word normalization ─────────────────────────────────────

/**
 * Normalize a word object to include both legacy and generic fields.
 * This ensures any word works with both old (word.hebrew) and new (getNativeScript(word)) code.
 */
export function normalizeWord(word, languageId = null) {
  if (!word) return null;
  const lang = languageId || getWordLanguageId(word);
  return {
    ...word,
    nativeScript: getNativeScript(word),
    meaning: getMeaning(word),
    languageId: lang,
    // Keep legacy fields for backward compat
    hebrew: word.hebrew ?? word.nativeScript ?? '',
    english: word.english ?? word.meaning ?? word.translation ?? '',
  };
}

/**
 * Convert Bridge Builder words into Deep Script format, language-aware.
 * Filters out multi-word phrases (containing spaces) since DS combat needs single words.
 */
export function convertBBWordsToDSGeneric(bbWords, languageId = 'hebrew') {
  const nativeField = getNativeScriptField(languageId);
  return bbWords
    .filter(w => {
      const text = w.nativeScript || w[nativeField] || w.hebrew || '';
      return !text.includes(' ');
    })
    .map(w => {
      const nativeText = w.nativeScript || w[nativeField] || w.hebrew || '';
      return {
        id: w.id,
        nativeScript: nativeText,
        hebrew: nativeText, // backward compat
        letters: [...nativeText],
        transliteration: w.transliteration,
        meaning: w.translation || w.meaning || '',
        english: w.translation || w.meaning || '', // backward compat
        difficulty: w.difficulty || 1,
        tags: w.tags || [],
        languageId,
        isMiniboss: false,
      };
    });
}

/**
 * Get the legacy field name for native script text based on language ID.
 * Currently all words use 'hebrew' as the field name, but future
 * language-specific word files may use 'nativeScript' directly.
 */
function getNativeScriptField(_languageId) {
  // All current word files use 'hebrew' as the field name
  return 'hebrew';
}
