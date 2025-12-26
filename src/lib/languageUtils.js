/**
 * Map full language IDs to two-letter ISO codes
 * Used for accessing translations and localized content
 */
export const TRANSLATION_KEY_MAP = {
  english: 'en',
  hebrew: 'he',
  spanish: 'es',
  french: 'fr',
  arabic: 'ar',
  portuguese: 'pt',
  russian: 'ru',
  hindi: 'hi',
  japanese: 'ja',
  mandarin: 'zh',
  bengali: 'bn',
  amharic: 'am'
};

/**
 * Convert a full language ID to its two-letter code
 * @param {string} languageId - Full language ID (e.g., 'english', 'spanish')
 * @returns {string} Two-letter language code (e.g., 'en', 'es')
 */
export function getLanguageCode(languageId) {
  return TRANSLATION_KEY_MAP[languageId] || languageId;
}

/**
 * Get localized title from a reading text object
 * @param {Object} readingText - Reading text object with title property
 * @param {string} appLanguageId - Full app language ID
 * @returns {string} Localized title, falling back to English or ID
 */
export function getLocalizedTitle(readingText, appLanguageId) {
  const langCode = getLanguageCode(appLanguageId);
  return readingText.title?.[langCode] || readingText.title?.en || readingText.id;
}

/**
 * Get localized subtitle from a reading text object
 * @param {Object} readingText - Reading text object with subtitle property
 * @param {string} appLanguageId - Full app language ID
 * @returns {string} Localized subtitle, falling back to English or empty string
 */
export function getLocalizedSubtitle(readingText, appLanguageId) {
  const langCode = getLanguageCode(appLanguageId);
  return readingText.subtitle?.[langCode] || readingText.subtitle?.en || '';
}

/**
 * Formats a language name to display native name with translated name in parentheses
 * @param {string} nativeName - The native name of the language (e.g., "עברית")
 * @param {string} translatedName - The translated name in the current app language (e.g., "Hebrew")
 * @returns {string} Formatted name like "עברית (Hebrew)"
 */
export function formatLanguageName(nativeName, translatedName) {
  // If the native name and translated name are the same, just show once
  if (nativeName === translatedName) {
    return nativeName;
  }
  return `${nativeName} (${translatedName})`;
}

/**
 * Gets the formatted language name for a language option
 * @param {Object} option - Language option with id and name
 * @param {Function} t - Translation function from useLocalization
 * @returns {string} Formatted language name
 */
export function getFormattedLanguageName(option, t) {
  const nativeName = option.name;
  const translatedName = t(`languageNames.${option.id}`);
  return formatLanguageName(nativeName, translatedName);
}
