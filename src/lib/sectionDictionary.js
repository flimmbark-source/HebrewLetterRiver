/**
 * Section Dictionary Helper
 * Derives dictionary entries from reading text tokens and translations
 */

import { getReadingTextsForLanguage } from '../data/readingTexts/index.js';
import { getTextDirection, getFontClass } from './readingUtils.js';
import { getLanguageCode } from './languageUtils.js';

/**
 * Derive dictionary entries for a section
 *
 * @param {string} sectionId - Section identifier ('starter', 'cafeTalk', etc.)
 * @param {string} practiceLanguageId - Practice language ID
 * @param {string} appLanguageId - App language ID (for translations)
 * @param {Function} t - Localization function
 * @returns {Array} Dictionary entries with { wordId, practiceWord, canonical, meaning, direction, fontClass }
 */
export function getSectionDictionary(sectionId, practiceLanguageId, appLanguageId, t) {
  // Get all reading texts for the practice language
  const readingTexts = getReadingTextsForLanguage(practiceLanguageId);

  // Filter to texts in this section
  const sectionTexts = readingTexts.filter(text => text.sectionId === sectionId);

  if (sectionTexts.length === 0) {
    return [];
  }

  // Collect unique word entries
  const wordMap = new Map(); // wordId -> entry

  sectionTexts.forEach(text => {
    if (!text.tokens) return;

    text.tokens.forEach(token => {
      // Only process word tokens with an ID
      if (token.type !== 'word' || !token.id) return;

      const wordId = token.id;

      // Skip if we've already seen this word
      if (wordMap.has(wordId)) return;

      // Get practice word text
      const practiceWord = token.text;

      // Get translation canonical form (support both language IDs and locale codes)
      let canonical = '—';
      const langCode = getLanguageCode(appLanguageId);
      const textTranslations =
        text.translations?.[appLanguageId] || text.translations?.[langCode];
      if (textTranslations && textTranslations[wordId]) {
        canonical = textTranslations[wordId].canonical || '—';
      }

      // Get meaning from i18n
      let meaning = '—';
      const meaningKey = text.meaningKeys?.[wordId];
      if (meaningKey) {
        try {
          meaning = t(meaningKey);
          // DEBUG: Log first few translations to help diagnose issues
          if (wordId === 'so' || wordId === 'but' || wordId === 'I') {
            console.log(`[SectionDict DEBUG] wordId: ${wordId}, meaningKey: ${meaningKey}, t() returned: "${meaning}"`);
          }
          // If translation key doesn't exist, t() might return the key itself
          if (meaning === meaningKey) {
            console.warn(`[SectionDict] Meaning key not found in i18n: ${meaningKey}`);
            meaning = '—';
          }
        } catch (e) {
          console.error(`[SectionDict] Error translating ${meaningKey}:`, e);
          meaning = '—';
        }
      } else {
        console.warn(`[SectionDict] No meaningKey for wordId: ${wordId}`);
      }

      // Store entry
      wordMap.set(wordId, {
        wordId,
        practiceWord,
        canonical,
        meaning
      });
    });
  });

  // Convert map to array (maintains insertion order = order of first appearance)
  const entries = Array.from(wordMap.values());

  // Get direction and font for practice language
  const direction = getTextDirection(practiceLanguageId);
  const fontClass = getFontClass(practiceLanguageId);

  // Add direction and font to each entry
  return entries.map(entry => ({
    ...entry,
    direction,
    fontClass
  }));
}

/**
 * Get count of unique words in a section
 *
 * @param {string} sectionId - Section identifier
 * @param {string} practiceLanguageId - Practice language ID
 * @returns {number} Count of unique words
 */
export function getSectionWordCount(sectionId, practiceLanguageId) {
  const readingTexts = getReadingTextsForLanguage(practiceLanguageId);
  const sectionTexts = readingTexts.filter(text => text.sectionId === sectionId);

  const uniqueWordIds = new Set();

  sectionTexts.forEach(text => {
    if (!text.tokens) return;
    text.tokens.forEach(token => {
      if (token.type === 'word' && token.id) {
        uniqueWordIds.add(token.id);
      }
    });
  });

  return uniqueWordIds.size;
}
