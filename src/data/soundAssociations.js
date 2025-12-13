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
 * Sound aliases to handle variations in how sounds are passed
 * Maps common variations to their canonical forms in the data
 */
const SOUND_ALIASES = {
  // Vowels with parentheses
  'A': '(A)',
  'a': '(A)',
  '(A)': '(A)',
  '(a)': '(A)',
  'AH': '(Ah)',
  'Ah': '(Ah)',
  'ah': '(Ah)',
  '(Ah)': '(Ah)',
  '(ah)': '(Ah)',

  // Consonants
  'B': 'B',
  'b': 'B',

  'C': 'C',
  'c': 'C',

  'Ch': 'Ch',
  'ch': 'Ch',
  'CH': 'Ch',

  'D': 'D',
  'd': 'D',

  'F': 'F',
  'f': 'F',

  'G': 'G',
  'g': 'G',

  'H': 'H',
  'h': 'H',

  'J': 'J',
  'j': 'J',

  'K': 'K',
  'k': 'K',

  'L': 'L',
  'l': 'L',

  'M': 'M',
  'm': 'M',

  'N': 'N',
  'n': 'N',

  'P': 'P',
  'p': 'P',

  'R': 'R',
  'r': 'R',

  'S': 'S',
  's': 'S',

  'Sh': 'Sh',
  'sh': 'Sh',
  'SH': 'Sh',

  'T': 'T',
  't': 'T',

  'Tz': 'Tz',
  'tz': 'Tz',
  'TZ': 'Tz',

  'V': 'V',
  'v': 'V',

  'V/o/u': 'V/o/u',
  'v/o/u': 'V/o/u',

  'W': 'W',
  'w': 'W',

  'Y': 'Y',
  'y': 'Y',

  'Z': 'Z',
  'z': 'Z',

  // Syllables (vowel combinations)
  'Ba': 'Ba',
  'ba': 'Ba',
  'BA': 'Ba',

  'Be': 'Be',
  'be': 'Be',
  'BE': 'Be',

  'Bi': 'Bi',
  'bi': 'Bi',
  'BI': 'Bi',

  'Bo': 'Bo',
  'bo': 'Bo',
  'BO': 'Bo',

  'Bu': 'Bu',
  'bu': 'Bu',
  'BU': 'Bu',
};

/**
 * Normalize sound key for consistent lookups
 * @param {string} sound - The sound to normalize
 * @returns {string} Normalized sound string
 */
function normalizeSoundKey(sound) {
  return String(sound || '').trim();
}

/**
 * Get the association for a given sound with localized word and alt text
 * @param {string} sound - The phonetic sound (e.g., "B", "Ch", "Ba")
 * @param {string} appLanguageId - The app language ID (e.g., 'en', 'he', 'es') for translations
 * @returns {object|null} The association object with emoji, word, and alt in the requested language, or null if not found
 */
export function getAssociation(sound, appLanguageId = 'en') {
  const raw = normalizeSoundKey(sound);
  if (!raw) return null;

  // Try alias first
  const aliased = SOUND_ALIASES[raw] || SOUND_ALIASES[raw.toUpperCase()] || raw;

  // Try the aliased/normalized sound
  let association = getAssociationForLanguage(aliased, appLanguageId);
  if (association) return association;

  // Special handling for vowels: if caller passes "A" when we store "(A)"
  if (/^[AEIOU]h?$/i.test(raw)) {
    association = getAssociationForLanguage(`(${raw})`, appLanguageId);
    if (association) return association;
  }

  // Try case variations (useful for "sh" -> "Sh")
  const lower = raw.toLowerCase();
  const capitalized = lower.charAt(0).toUpperCase() + lower.slice(1);
  association = getAssociationForLanguage(capitalized, appLanguageId);
  if (association) return association;

  association = getAssociationForLanguage(raw.toUpperCase(), appLanguageId);
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
