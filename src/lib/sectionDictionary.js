/**
 * Section Dictionary Helper
 * Derives dictionary entries from reading text tokens and translations
 */

import { getReadingTextsForLanguage } from '../data/readingTexts/index.js';
import { getTextDirection, getFontClass, normalizeForLanguage } from './readingUtils.js';
import { getLanguageCode, getLocalizedTitle } from './languageUtils.js';
import { getWordGhostSequence } from './readingResultsStorage.js';

/**
 * Derive dictionary entries for a section
 *
 * @param {string} sectionId - Section identifier ('starter', 'cafeTalk', etc.)
 * @param {string} practiceLanguageId - Practice language ID
 * @param {string} appLanguageId - App language ID (for translations)
 * @param {Function} t - Localization function
 * @returns {Array} Array of groups: [{ textId, title, entries: [{ wordId, practiceWord, canonical, meaning, direction, fontClass }] }]
 */
export function getSectionDictionary(sectionId, practiceLanguageId, appLanguageId, t) {
  // Get all reading texts for the practice language
  const readingTexts = getReadingTextsForLanguage(practiceLanguageId);

  // Filter to texts in this section
  const sectionTexts = readingTexts.filter(text => text.sectionId === sectionId);

  if (sectionTexts.length === 0) {
    return [];
  }

  // Get direction and font for practice language (same for every group)
  const direction = getTextDirection(practiceLanguageId);
  const fontClass = getFontClass(practiceLanguageId);
  const langCode = getLanguageCode(appLanguageId);

  // Build dictionary groups per reading text (preserves on-screen order)
  const groups = sectionTexts.map(text => {
    const seenWordIds = new Set();
    const entries = [];

    if (!text.tokens) return null;

    text.tokens.forEach(token => {
      // Only process word tokens with an ID
      if (token.type !== 'word' || !token.id) return;

      const wordId = token.id;

      // Skip duplicate words within the same reading text
      if (seenWordIds.has(wordId)) return;

      seenWordIds.add(wordId);

      // Get practice word text
      const practiceWord = token.text;

      // Get translation canonical form (support both language IDs and locale codes)
      let canonical = '—';
      const textTranslations =
        text.translations?.[appLanguageId] || text.translations?.[langCode];
      if (textTranslations && textTranslations[wordId]) {
        const rawCanonical = textTranslations[wordId].canonical || '—';
        // Normalize the canonical form to match what users need to type during grading
        canonical = rawCanonical === '—' ? '—' : normalizeForLanguage(rawCanonical, appLanguageId);
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

      // Get the most recent ghost sequence for this word (for colored rendering)
      const ghostSequence = getWordGhostSequence(practiceLanguageId, sectionId, wordId);

      entries.push({
        wordId,
        practiceWord,
        canonical,
        meaning,
        direction,
        fontClass,
        ghostSequence
      });
    });

    return {
      textId: text.id,
      title: getLocalizedTitle(text, appLanguageId),
      entries
    };
  });

  // Remove empty or null groups
  return groups.filter(group => group && group.entries.length > 0);
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
