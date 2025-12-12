/**
 * Sound Association Mappings
 *
 * This module provides centralized mapping of phonetic sounds to emojis per language.
 * IMPORTANT: Emojis are language-specific! The word must start with the target sound in that language.
 *
 * Example: Sound "B"
 * - English: 🐻 "Bear" ✓
 * - Spanish: 🥾 "Bota" ✓ (not 🐻 "Oso" which starts with O!)
 */

import { soundAssociationsByLanguage, getAssociationForLanguage } from './soundAssociationsByLanguage.js';

// Re-export the main data structure
export const soundAssociations = soundAssociationsByLanguage;

/**
 * Get the association for a given sound with localized word and alt text
 * @param {string} sound - The phonetic sound (e.g., "B", "Ch", "Ba")
 * @param {string} appLanguageId - The app language ID (e.g., 'en', 'he', 'es') for translations
 * @returns {object|null} The association object with emoji, word, and alt in the requested language, or null if not found
 */
export function getAssociation(sound, appLanguageId = 'en') {
  if (!sound) return null;

  // Direct match
  let association = getAssociationForLanguage(sound, appLanguageId);
  if (association) return association;

  // Try without parentheses (e.g., "(A)" -> "A")
  const withoutParens = sound.replace(/[()]/g, '');
  association = getAssociationForLanguage(withoutParens, appLanguageId);
  if (association) return association;

  // Try case variations
  const upperSound = sound.toUpperCase();
  association = getAssociationForLanguage(upperSound, appLanguageId);
  if (association) return association;

  const lowerSound = sound.toLowerCase();
  const capitalizedSound = lowerSound.charAt(0).toUpperCase() + lowerSound.slice(1);
  association = getAssociationForLanguage(capitalizedSound, appLanguageId);
  if (association) return association;

  return null;
}

/**
 * Get all available sounds that have associations
 * @returns {string[]} Array of sound keys
 */
export function getAvailableSounds() {
  return Object.keys(soundAssociationsByLanguage);
}

/**
 * Check if a sound has an association
 * @param {string} sound - The phonetic sound to check
 * @param {string} appLanguageId - Optional language ID to check for specific language
 * @returns {boolean} True if the sound has an association
 */
export function hasAssociation(sound, appLanguageId = 'en') {
  return getAssociation(sound, appLanguageId) !== null;
}

export default {
  soundAssociations,
  getAssociation,
  getAvailableSounds,
  hasAssociation
};
