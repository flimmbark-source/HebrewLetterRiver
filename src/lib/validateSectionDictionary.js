/**
 * Validation for Section Dictionary
 * Ensures all words have meaningKeys and i18n translations
 */

import { getReadingTextsForLanguage } from '../data/readingTexts/index.js';

/**
 * Get all unique word IDs from a section
 */
function getSectionWordIds(sectionId, practiceLanguageId) {
  const readingTexts = getReadingTextsForLanguage(practiceLanguageId);
  const sectionTexts = readingTexts.filter(text => text.sectionId === sectionId);

  const wordIds = new Set();
  sectionTexts.forEach(text => {
    if (!text.tokens) return;
    text.tokens.forEach(token => {
      if (token.type === 'word' && token.id) {
        wordIds.add(token.id);
      }
    });
  });

  return Array.from(wordIds);
}

/**
 * Validate that all words in a section have meaningKeys defined
 */
export function validateSectionMeaningKeys(sectionId, practiceLanguageId) {
  const readingTexts = getReadingTextsForLanguage(practiceLanguageId);
  const sectionTexts = readingTexts.filter(text => text.sectionId === sectionId);
  const wordIds = getSectionWordIds(sectionId, practiceLanguageId);

  const errors = [];

  wordIds.forEach(wordId => {
    // Check if any text in this section has a meaningKey for this word
    const hasMeaningKey = sectionTexts.some(text =>
      text.meaningKeys && text.meaningKeys[wordId]
    );

    if (!hasMeaningKey) {
      errors.push(`Missing meaningKey for word ID "${wordId}" in section "${sectionId}"`);
    }
  });

  return errors;
}

/**
 * Validate that all words have translations for a given app language
 */
export function validateSectionTranslations(sectionId, practiceLanguageId, appLanguageId) {
  const readingTexts = getReadingTextsForLanguage(practiceLanguageId);
  const sectionTexts = readingTexts.filter(text => text.sectionId === sectionId);
  const wordIds = getSectionWordIds(sectionId, practiceLanguageId);

  const errors = [];

  wordIds.forEach(wordId => {
    // Check if any text in this section has a translation for this word
    const hasTranslation = sectionTexts.some(text =>
      text.translations?.[appLanguageId]?.[wordId]?.canonical
    );

    if (!hasTranslation) {
      errors.push(
        `Missing translation for word ID "${wordId}" in app language "${appLanguageId}" ` +
        `for section "${sectionId}"`
      );
    }
  });

  return errors;
}

/**
 * Validate that all meaningKeys have corresponding i18n translations
 *
 * @param {Object} translations - i18n translations object (e.g., from en.json)
 * @param {string} sectionId - Section to validate
 * @param {string} practiceLanguageId - Practice language
 * @returns {string[]} Array of error messages
 */
export function validateI18nMeanings(translations, sectionId, practiceLanguageId) {
  const readingTexts = getReadingTextsForLanguage(practiceLanguageId);
  const sectionTexts = readingTexts.filter(text => text.sectionId === sectionId);

  const errors = [];
  const checkedKeys = new Set();

  sectionTexts.forEach(text => {
    if (!text.meaningKeys) return;

    Object.entries(text.meaningKeys).forEach(([wordId, i18nKey]) => {
      if (checkedKeys.has(i18nKey)) return;
      checkedKeys.add(i18nKey);

      // Parse the i18n key path (e.g., "reading.meaning.so" -> ["reading", "meaning", "so"])
      const keyPath = i18nKey.split('.');

      // Navigate through the translations object
      let current = translations;
      let found = true;

      for (const part of keyPath) {
        if (current && typeof current === 'object' && part in current) {
          current = current[part];
        } else {
          found = false;
          break;
        }
      }

      if (!found || typeof current !== 'string') {
        errors.push(
          `Missing i18n translation for key "${i18nKey}" (word ID: "${wordId}") ` +
          `in section "${sectionId}"`
        );
      }
    });
  });

  return errors;
}

/**
 * Validate all aspects of section dictionary for a given configuration
 * Throws in development if validation fails
 */
export function assertSectionDictionaryValid(
  sectionId,
  practiceLanguageId,
  appLanguageId,
  i18nTranslations
) {
  const allErrors = [
    ...validateSectionMeaningKeys(sectionId, practiceLanguageId),
    ...validateSectionTranslations(sectionId, practiceLanguageId, appLanguageId),
    ...validateI18nMeanings(i18nTranslations, sectionId, practiceLanguageId)
  ];

  if (allErrors.length > 0) {
    const errorMessage = [
      `Section Dictionary validation failed for section "${sectionId}":`,
      ...allErrors.map(err => `  - ${err}`)
    ].join('\n');

    throw new Error(errorMessage);
  }
}

/**
 * Validate all sections for all language combinations (use in tests)
 */
export function validateAllSections(practiceLanguages, appLanguages, i18nByLanguage) {
  const sections = ['starter', 'cafeTalk'];
  const allErrors = [];

  sections.forEach(sectionId => {
    practiceLanguages.forEach(practiceLang => {
      // Check meaningKeys (only depends on practice language)
      const meaningKeyErrors = validateSectionMeaningKeys(sectionId, practiceLang);
      allErrors.push(...meaningKeyErrors.map(err => `[${practiceLang}] ${err}`));

      appLanguages.forEach(appLang => {
        // Check translations
        const translationErrors = validateSectionTranslations(sectionId, practiceLang, appLang);
        allErrors.push(...translationErrors.map(err => `[${practiceLang}→${appLang}] ${err}`));

        // Check i18n meanings
        if (i18nByLanguage[appLang]) {
          const i18nErrors = validateI18nMeanings(i18nByLanguage[appLang], sectionId, practiceLang);
          allErrors.push(...i18nErrors.map(err => `[${appLang} i18n] ${err}`));
        }
      });
    });
  });

  return allErrors;
}
