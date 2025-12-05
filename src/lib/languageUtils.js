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
