/**
 * Cafe Talk Validation
 *
 * Ensures all Cafe Talk reading texts are complete and valid.
 * Validates:
 * - All 7 categories exist for each practice language
 * - Token counts match canonical definition
 * - No __TODO__ placeholders remain
 * - meaningKeys exist for all word tokens
 * - Translations exist for required app languages
 */

import { CAFE_TALK_WORDS, getCafeTalkCategoryIds, getCategoryTokenCount, getEnglishLookup } from './cafeTalkCanonical.js';

// Expected practice languages
const PRACTICE_LANGUAGES = [
  'hebrew', 'arabic', 'mandarin', 'hindi', 'english',
  'spanish', 'french', 'portuguese', 'russian',
  'japanese', 'bengali', 'amharic'
];

// Required app languages for translations (at minimum English)
const REQUIRED_TRANSLATION_LANGUAGES = ['en'];

/**
 * Validation error
 */
class ValidationError extends Error {
  constructor(language, category, message) {
    super(`[${language}/${category}] ${message}`);
    this.language = language;
    this.category = category;
  }
}

/**
 * Check if a value contains placeholder text
 */
function hasPlaceholder(value) {
  if (typeof value === 'string') {
    return value.includes('__TODO__');
  }
  if (Array.isArray(value)) {
    return value.some(hasPlaceholder);
  }
  if (typeof value === 'object' && value !== null) {
    return Object.values(value).some(hasPlaceholder);
  }
  return false;
}

/**
 * Validate a single Cafe Talk reading text
 */
function validateCafeTalkText(text, language, categoryId) {
  const expectedTokenCount = getCategoryTokenCount(categoryId);
  const errors = [];
  const englishLookup = getEnglishLookup();

  // Check ID format
  if (text.id !== `cafeTalk.${categoryId}`) {
    errors.push(`Invalid ID: expected "cafeTalk.${categoryId}", got "${text.id}"`);
  }

  // Check practice language
  if (text.practiceLanguage !== language) {
    errors.push(`Invalid practiceLanguage: expected "${language}", got "${text.practiceLanguage}"`);
  }

  // Check title exists
  if (!text.title || typeof text.title !== 'object') {
    errors.push('Missing or invalid title object');
  } else if (hasPlaceholder(text.title)) {
    errors.push('Title contains __TODO__ placeholder');
  }

  // Check subtitle exists
  if (!text.subtitle || typeof text.subtitle !== 'object') {
    errors.push('Missing or invalid subtitle object');
  } else if (hasPlaceholder(text.subtitle)) {
    errors.push('Subtitle contains __TODO__ placeholder');
  }

  // Check tokens
  if (!Array.isArray(text.tokens)) {
    errors.push('Missing or invalid tokens array');
  } else {
    const wordTokens = text.tokens.filter(t => t.type === 'word');

    if (wordTokens.length !== expectedTokenCount) {
      errors.push(`Invalid token count: expected ${expectedTokenCount}, got ${wordTokens.length}`);
    }

    // Check for placeholders in tokens
    wordTokens.forEach((token, idx) => {
      if (hasPlaceholder(token.text)) {
        errors.push(`Token ${idx + 1} contains __TODO__ placeholder`);
      }
      if (hasPlaceholder(token.id)) {
        errors.push(`Token ${idx + 1} has __TODO__ placeholder ID`);
      }

      // CRITICAL: For non-English languages, ensure tokens are NOT English
      if (language !== 'english' && token.id && englishLookup[token.id]) {
        const englishWord = englishLookup[token.id];
        if (token.text === englishWord) {
          errors.push(`Token "${token.id}" uses English placeholder "${englishWord}" instead of ${language} translation`);
        }
      }
    });
  }

  // Check meaningKeys
  if (!text.meaningKeys || typeof text.meaningKeys !== 'object') {
    errors.push('Missing or invalid meaningKeys object');
  } else {
    const wordTokens = text.tokens?.filter(t => t.type === 'word') || [];
    const wordIds = new Set(wordTokens.map(t => t.id));
    const meaningKeyIds = new Set(Object.keys(text.meaningKeys));

    // Check all word IDs have meaningKeys
    wordIds.forEach(wordId => {
      if (!meaningKeyIds.has(wordId)) {
        errors.push(`Missing meaningKey for word ID: ${wordId}`);
      }
    });

    // Check for placeholders in meaningKeys
    if (hasPlaceholder(text.meaningKeys)) {
      errors.push('meaningKeys contain __TODO__ placeholder');
    }
  }

  // Check translations
  if (!text.translations || typeof text.translations !== 'object') {
    errors.push('Missing or invalid translations object');
  } else {
    const wordTokens = text.tokens?.filter(t => t.type === 'word') || [];
    const wordIds = new Set(wordTokens.map(t => t.id));

    // Check required translation languages
    REQUIRED_TRANSLATION_LANGUAGES.forEach(lang => {
      if (!text.translations[lang]) {
        errors.push(`Missing translations for required language: ${lang}`);
        return;
      }

      // Check all word IDs have translations
      wordIds.forEach(wordId => {
        if (!text.translations[lang][wordId]) {
          errors.push(`Missing translation for word ID "${wordId}" in language "${lang}"`);
        } else {
          const translation = text.translations[lang][wordId];

          if (!translation.canonical) {
            errors.push(`Missing canonical translation for word ID "${wordId}" in language "${lang}"`);
          } else if (hasPlaceholder(translation.canonical)) {
            errors.push(`Canonical translation for word ID "${wordId}" in language "${lang}" contains __TODO__`);
          }

          if (!Array.isArray(translation.variants)) {
            errors.push(`Missing or invalid variants for word ID "${wordId}" in language "${lang}"`);
          } else if (hasPlaceholder(translation.variants)) {
            errors.push(`Variants for word ID "${wordId}" in language "${lang}" contain __TODO__`);
          }
        }
      });
    });
  }

  return errors;
}

/**
 * Validate Cafe Talk texts for a specific language
 */
export function validateCafeTalkForLanguage(cafeTalkTexts, language) {
  const expectedCategoryIds = getCafeTalkCategoryIds();
  const errors = [];

  // Check all 7 categories exist
  if (!Array.isArray(cafeTalkTexts)) {
    throw new ValidationError(language, 'all', 'Cafe Talk texts is not an array');
  }

  if (cafeTalkTexts.length !== 7) {
    errors.push(`Expected 7 Cafe Talk texts, got ${cafeTalkTexts.length}`);
  }

  // Check each category
  expectedCategoryIds.forEach(categoryId => {
    const text = cafeTalkTexts.find(t => t.id === `cafeTalk.${categoryId}`);

    if (!text) {
      errors.push(`Missing Cafe Talk category: ${categoryId}`);
      return;
    }

    const textErrors = validateCafeTalkText(text, language, categoryId);
    textErrors.forEach(error => {
      errors.push(`[${categoryId}] ${error}`);
    });
  });

  return errors;
}

/**
 * Validate all Cafe Talk texts across all languages
 */
export function validateAllCafeTalk(cafeTalkByLanguage) {
  const allErrors = {};
  let hasErrors = false;

  PRACTICE_LANGUAGES.forEach(language => {
    const cafeTalkTexts = cafeTalkByLanguage[language];

    if (!cafeTalkTexts) {
      allErrors[language] = [`No Cafe Talk texts found for language: ${language}`];
      hasErrors = true;
      return;
    }

    const errors = validateCafeTalkForLanguage(cafeTalkTexts, language);

    if (errors.length > 0) {
      allErrors[language] = errors;
      hasErrors = true;
    }
  });

  return { hasErrors, errors: allErrors };
}

/**
 * Run validation and throw on error (for use in dev/test)
 */
export function assertCafeTalkValid(cafeTalkByLanguage) {
  const { hasErrors, errors } = validateAllCafeTalk(cafeTalkByLanguage);

  if (hasErrors) {
    const errorMessages = [];

    Object.entries(errors).forEach(([language, langErrors]) => {
      errorMessages.push(`\n${language.toUpperCase()}:`);
      langErrors.forEach(error => {
        errorMessages.push(`  - ${error}`);
      });
    });

    throw new Error(
      `Cafe Talk validation failed:\n${errorMessages.join('\n')}\n\n` +
      `Please complete all __TODO__ placeholders in Cafe Talk reading texts.\n` +
      `See src/data/readingTexts/cafeTalk/<language>.js files.`
    );
  }
}
