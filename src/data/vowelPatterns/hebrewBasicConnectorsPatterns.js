/**
 * Vowel Pattern Library for Hebrew Basic Connectors
 *
 * Each pattern provides:
 * - id: unique pattern identifier (P1-P6)
 * - chipLabel: minimal label shown during practice (uses shape symbols, NO explicit vowels)
 * - title: short descriptive title
 * - description: one-sentence explanation
 * - rules: 2-4 short learning bullets (may include vowel details for teaching)
 */

export const hebrewBasicConnectorsPatterns = [
  {
    id: 'P1',
    chipLabel: '◇ Pattern 1',
    title: 'Short A-Z Sound',
    description: 'A simple two-letter pattern with sharp vowel sounds.',
    rules: [
      'First letter: aleph (silent carrier)',
      'Patach vowel: sharp "a" sound',
      'Final zayin with short "z" sound',
      'Example pronunciation: "az" (so)'
    ]
  },
  {
    id: 'P2',
    chipLabel: '○ Pattern 2',
    title: 'Nu Sound Pattern',
    description: 'Two-letter word with "oo" vowel sound.',
    rules: [
      'Starts with nun (n sound)',
      'Holam/shuruk vowel: "oo" sound',
      'Short and emphatic',
      'Example pronunciation: "nu" (well/come on)'
    ]
  },
  {
    id: 'P3',
    chipLabel: '△ Pattern 3',
    title: 'Three-Letter A-Pattern',
    description: 'Three-letter connector with alternating vowel sounds.',
    rules: [
      'Aleph (silent) + patach (a)',
      'Bet with kamatz vowel (longer "a")',
      'Lamed with segol (e) sound',
      'Example pronunciation: "aval" (but)'
    ]
  },
  {
    id: 'P4',
    chipLabel: '▢ Pattern 4',
    title: 'Four-Letter O-I Pattern',
    description: 'Longer word with rounded and short vowel combination.',
    rules: [
      'Aleph (silent carrier) + holam (o)',
      'Vav with shuruk: "oo" sound',
      'Lamed with hirik (i)',
      'Example pronunciation: "ulai" (maybe)'
    ]
  },
  {
    id: 'P5',
    chipLabel: '✦ Pattern 5',
    title: 'Be-Etzem Pattern',
    description: 'Two-syllable compound with "e" vowels.',
    rules: [
      'First syllable: bet + segol (e) + ayin + tzere (e)',
      'Second syllable: mem with segol (e)',
      'Common compound structure',
      'Example pronunciation: "be-etzem" (actually/essentially)'
    ]
  },
  {
    id: 'P6',
    chipLabel: '⬡ Pattern 6',
    title: 'Kan-Ire Pattern',
    description: 'Three-syllable word with varied vowel sounds.',
    rules: [
      'First syllable: kaf + hirik (i)',
      'Second syllable: nun + shva + resh + patach (a)',
      'Third syllable: aleph + segol (e)',
      'Example pronunciation: "kanir-e" (apparently/probably)'
    ]
  }
];

/**
 * Map word IDs to their vowel pattern IDs
 * Used for Basic Connectors pack
 */
export const basicConnectorsVowelPatterns = {
  'so': 'P1',        // אז (az)
  'well': 'P2',      // נו (nu)
  'but': 'P3',       // אבל (aval)
  'maybe': 'P4',     // אולי (ulai)
  'actually': 'P5',  // בעצם (be-etzem)
  'probably': 'P6'   // כנראה (kanir-e)
};

/**
 * Get pattern by ID
 */
export function getPatternById(patternId) {
  return hebrewBasicConnectorsPatterns.find(p => p.id === patternId);
}

/**
 * Get all patterns used in a specific pack
 * @param {string[]} wordIds - Array of word IDs in the pack
 * @returns {Object[]} Array of pattern objects used in this pack
 */
export function getPatternsForPack(wordIds) {
  const patternIds = new Set();

  wordIds.forEach(wordId => {
    const patternId = basicConnectorsVowelPatterns[wordId];
    if (patternId) {
      patternIds.add(patternId);
    }
  });

  return Array.from(patternIds)
    .map(id => getPatternById(id))
    .filter(Boolean)
    .sort((a, b) => a.id.localeCompare(b.id));
}
