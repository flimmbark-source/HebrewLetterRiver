/**
 * Hebrew Vowel Layout Library
 *
 * Defines vowel-only patterns for Hebrew words to help learners supply correct vowels
 * when transliterating. Each layout is identified by a chip glyph (◇, ○, △, etc.)
 * that appears during practice. The teaching modal explains what vowel pattern
 * the chip represents.
 *
 * Layout naming convention: V{count}_{vowel1}_{vowel2}_...
 * Example: V2_A_A = two vowels, both "a" sounds
 *
 * IMPORTANT: These definitions are vowel-only and do not mention consonant patterns.
 */

export const hebrewVowelLayouts = {
  // Single vowel layouts
  V1_A: {
    id: 'V1_A',
    chipLabel: '◇',
    title: '◇ Chip',
    explanation: 'One-beat word with a single "a" vowel sound.',
    rules: [
      'The word has only one vowel: "a"',
      'Keep it short and simple',
      'Common in basic connector words'
    ]
  },

  V1_U: {
    id: 'V1_U',
    chipLabel: '○',
    title: '○ Chip',
    explanation: 'One-beat word with a single "u" vowel sound.',
    rules: [
      'The word has only one vowel: "u"',
      'Short and punchy',
      'Often used for interjections'
    ]
  },

  V1_I: {
    id: 'V1_I',
    chipLabel: '▢',
    title: '▢ Chip',
    explanation: 'One-beat word with a single "i" vowel sound.',
    rules: [
      'The word has only one vowel: "i"',
      'Compact pronunciation',
      'Common in short question words'
    ]
  },

  V1_O: {
    id: 'V1_O',
    chipLabel: '⬡',
    title: '⬡ Chip',
    explanation: 'One-beat word with a single "o" vowel sound.',
    rules: [
      'The word has only one vowel: "o"',
      'Simple one-syllable pattern'
    ]
  },

  // Two vowel layouts
  V2_A_A: {
    id: 'V2_A_A',
    chipLabel: '△',
    title: '△ Chip',
    explanation: 'Two-beat word with two "a" vowel sounds.',
    rules: [
      'The word has two vowels: "a" then "a"',
      'Both beats use the same "a" sound',
      'Common pattern in Hebrew words',
      'Example rhythm: a-VAL, ka-NAR'
    ]
  },

  V2_U_AY: {
    id: 'V2_U_AY',
    chipLabel: '✦',
    title: '✦ Chip',
    explanation: 'Two-beat word with "u" then "ay" vowel sounds.',
    rules: [
      'The word has two vowels: "u" then "ay"',
      'First syllable: "u" sound',
      'Second syllable: "ay" sound (like "eye")',
      'Common in possibility/uncertainty words'
    ]
  },

  V2_E_E: {
    id: 'V2_E_E',
    chipLabel: '☆',
    title: '☆ Chip',
    explanation: 'Two-beat word with two "e" vowel sounds.',
    rules: [
      'The word has two vowels: "e" then "e"',
      'Both beats use the same "e" sound',
      'Often includes hyphens in transliteration',
      'Example: be-ETZEM (actually)'
    ]
  },

  V2_A_I: {
    id: 'V2_A_I',
    chipLabel: '◈',
    title: '◈ Chip',
    explanation: 'Two-beat word with "a" then "i" vowel sounds.',
    rules: [
      'The word has two vowels: "a" then "i"',
      'First syllable: "a" sound',
      'Second syllable: "i" sound',
      'Common in time and place words'
    ]
  },

  V2_A_O: {
    id: 'V2_A_O',
    chipLabel: '◐',
    title: '◐ Chip',
    explanation: 'Two-beat word with "a" then "o" vowel sounds.',
    rules: [
      'The word has two vowels: "a" then "o"',
      'First syllable: "a" sound',
      'Second syllable: "o" sound'
    ]
  },

  // Three vowel layouts
  V3_A_A_A: {
    id: 'V3_A_A_A',
    chipLabel: '▲',
    title: '▲ Chip',
    explanation: 'Three-beat word with three "a" vowel sounds.',
    rules: [
      'The word has three vowels: "a", "a", and "a"',
      'All three beats use the same "a" sound',
      'Longer words with consistent rhythm',
      'Example: ka-na-RAH (probably)'
    ]
  },

  V3_A_A_I: {
    id: 'V3_A_A_I',
    chipLabel: '⬢',
    title: '⬢ Chip',
    explanation: 'Three-beat word with "a", "a", then "i" vowel sounds.',
    rules: [
      'The word has three vowels: "a", "a", then "i"',
      'First two syllables: "a" sounds',
      'Final syllable: "i" sound'
    ]
  },

  V3_E_A_I: {
    id: 'V3_E_A_I',
    chipLabel: '◆',
    title: '◆ Chip',
    explanation: 'Three-beat word with "e", "a", then "i" vowel sounds.',
    rules: [
      'The word has three vowels: "e", "a", then "i"',
      'First syllable: "e" sound',
      'Second syllable: "a" sound',
      'Final syllable: "i" sound'
    ]
  },

  // Four vowel layouts
  V4_E_I_A_I: {
    id: 'V4_E_I_A_I',
    chipLabel: '◘',
    title: '◘ Chip',
    explanation: 'Four-beat word with "e", "i", "a", then "i" vowel sounds.',
    rules: [
      'The word has four vowels: "e", "i", "a", "i"',
      'First syllable: "e" sound',
      'Second syllable: "i" sound',
      'Third syllable: "a" sound',
      'Final syllable: "i" sound'
    ]
  }
};

/**
 * Get a vowel layout definition by ID
 * Returns null if layout doesn't exist (defensive)
 */
export function getVowelLayout(layoutId) {
  return hebrewVowelLayouts[layoutId] || null;
}

/**
 * Get all vowel layout IDs
 */
export function getAllVowelLayoutIds() {
  return Object.keys(hebrewVowelLayouts);
}

/**
 * Check if a vowel layout exists
 */
export function hasVowelLayout(layoutId) {
  return layoutId && layoutId in hebrewVowelLayouts;
}
