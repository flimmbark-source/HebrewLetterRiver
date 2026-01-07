/**
 * Helper functions for building reading text translations
 */

import { HELLO, THANKS, YES, NO, GOOD } from './translations.js';

/**
 * Build translations for the 5 common starter words (hello, thanks, yes, no, good)
 * across all app languages with language-specific customizations
 *
 * @param {string} practiceLanguage - The language being practiced
 * @param {Object} customTranslations - Custom translations/variants per language
 * @returns {Object} Complete translations object for all app languages
 */
export function buildStarterWordTranslations(practiceLanguage, customTranslations = {}) {
  const allLanguages = ['en', 'es', 'fr', 'ar', 'pt', 'ru', 'ja', 'zh', 'hi', 'bn', 'am', 'he'];

  const result = {};

  allLanguages.forEach(lang => {
    result[lang] = {
      hello: buildWordTranslation(lang, 'hello', HELLO[lang], customTranslations?.hello?.[lang]),
      thanks: buildWordTranslation(lang, 'thanks', THANKS[lang], customTranslations?.thanks?.[lang]),
      yes: buildWordTranslation(lang, 'yes', YES[lang], customTranslations?.yes?.[lang]),
      no: buildWordTranslation(lang, 'no', NO[lang], customTranslations?.no?.[lang]),
      good: buildWordTranslation(lang, 'good', GOOD[lang], customTranslations?.good?.[lang])
    };
  });

  return result;
}

/**
 * Build a single word translation with canonical form and variants
 *
 * @param {string} appLang - The app/UI language
 * @param {string} wordId - Word identifier (e.g., 'hello')
 * @param {string} canonical - Canonical translation
 * @param {Array|Object} custom - Custom variants or full translation object
 * @returns {Object} Translation object with canonical and variants
 */
function buildWordTranslation(appLang, wordId, canonical, custom) {
  if (custom && typeof custom === 'object' && custom.canonical) {
    // Full custom translation object provided
    return custom;
  }

  const variants = Array.isArray(custom) ? [canonical, ...custom] : [canonical];

  // Remove duplicates
  return {
    canonical,
    variants: [...new Set(variants)]
  };
}

/**
 * Create a reading text object with default structure
 *
 * @param {Object} config - Configuration object
 * @param {string} config.id - Unique text ID
 * @param {Object} config.title - Title translations for all languages
 * @param {Object} config.subtitle - Subtitle translations for all languages
 * @param {string} config.practiceLanguage - Language being practiced
 * @param {Array} config.tokens - Array of word/punctuation tokens
 * @param {Object} config.meaningKeys - Mapping from word ID to i18n meaning key
 * @param {Object} config.glosses - Semantic meanings/glosses for all words in all languages
 * @param {Object} config.translations - Translations for all words in all app languages
 * @param {Object} [config.emojis] - Emoji associations for words (wordId -> emoji)
 * @param {string} [config.sectionId] - Optional section identifier
 * @returns {Object} Complete reading text object
 */
export function createReadingText({ id, title, subtitle, practiceLanguage, tokens, meaningKeys, glosses, translations, emojis, sectionId }) {
  return {
    id,
    title,
    subtitle,
    practiceLanguage,
    tokens,
    meaningKeys,
    glosses,
    translations,
    emojis,
    sectionId
  };
}

/**
 * Merge custom translations with default translations
 *
 * @param {Object} defaults - Default translations
 * @param {Object} customs - Custom translations to overlay
 * @returns {Object} Merged translations
 */
export function mergeTranslations(defaults, customs) {
  const result = { ...defaults };

  Object.keys(customs).forEach(lang => {
    result[lang] = result[lang] || {};
    Object.keys(customs[lang]).forEach(wordId => {
      result[lang][wordId] = customs[lang][wordId];
    });
  });

  return result;
}
