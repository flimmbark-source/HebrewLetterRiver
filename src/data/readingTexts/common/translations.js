/**
 * Common word translations across all 12 languages.
 * This module provides reusable translation mappings for common words
 * to avoid duplication across language files.
 */

/**
 * Common greetings/hello translations
 */
export const HELLO = {
  en: 'hello',
  es: 'hola',
  fr: 'bonjour',
  ar: 'مرحبا',
  pt: 'ola',
  ru: 'привет',
  ja: 'こんにちは',
  zh: '你好',
  hi: 'नमस्ते',
  bn: 'নমস্কার',
  am: 'ሰላም',
  he: 'שלום'
};

/**
 * Thanks/gratitude translations
 */
export const THANKS = {
  en: 'thanks',
  es: 'gracias',
  fr: 'merci',
  ar: 'شكرا',
  pt: 'obrigado',
  ru: 'спасибо',
  ja: 'ありがとう',
  zh: '谢谢',
  hi: 'धन्यवाद',
  bn: 'ধন্যবাদ',
  am: 'አመሰግናለሁ',
  he: 'תודה'
};

/**
 * Yes translations
 */
export const YES = {
  en: 'yes',
  es: 'si',
  fr: 'oui',
  ar: 'نعم',
  pt: 'sim',
  ru: 'да',
  ja: 'はい',
  zh: '是',
  hi: 'हाँ',
  bn: 'হ্যাঁ',
  am: 'አዎ',
  he: 'כן'
};

/**
 * No translations
 */
export const NO = {
  en: 'no',
  es: 'no',
  fr: 'non',
  ar: 'لا',
  pt: 'nao',
  ru: 'нет',
  ja: 'いいえ',
  zh: '不',
  hi: 'नहीं',
  bn: 'না',
  am: 'አይ',
  he: 'לא'
};

/**
 * Good translations
 */
export const GOOD = {
  en: 'good',
  es: 'bueno',
  fr: 'bon',
  ar: 'جيد',
  pt: 'bom',
  ru: 'хорошо',
  ja: 'いい',
  zh: '好',
  hi: 'अच्छा',
  bn: 'ভালো',
  am: 'ጥሩ',
  he: 'טוב'
};

/**
 * Helper function to build translation object with canonical and variants
 * @param {string} canonical - The canonical transliteration or translation
 * @param {string[]} variants - Array of accepted variants
 * @returns {Object} Translation object
 */
export function buildTranslation(canonical, variants = []) {
  return {
    canonical,
    variants: Array.isArray(variants) ? variants : [canonical, ...variants]
  };
}

/**
 * Build translations for a common word across all languages
 * @param {string} wordId - The word identifier
 * @param {Object} baseTranslations - Base translations from common words (e.g., HELLO, THANKS)
 * @param {Object} customVariants - Optional custom variants per language
 * @returns {Object} Translations object for all app languages
 */
export function buildCommonWordTranslations(wordId, baseTranslations, customVariants = {}) {
  const translations = {};

  Object.keys(baseTranslations).forEach(lang => {
    const canonical = baseTranslations[lang];
    const custom = customVariants[lang] || [];
    const variants = Array.isArray(custom) ? [canonical, ...custom] : [canonical];

    translations[lang] = {
      canonical,
      variants: [...new Set(variants)] // Remove duplicates
    };
  });

  return translations;
}
