/**
 * Grading engine for Reading Area mode.
 * Compares typed words with expected translations and generates
 * character-by-character feedback for ghost word display.
 */

import {
  normalizeForLanguage,
  isVowel,
  hasOptionalVowels,
  getGraphemeClusters,
  findBestVariant
} from './readingUtils.js';

/**
 * Ghost character classification:
 * - 'ok': correct character
 * - 'bad': wrong character (typed but incorrect)
 * - 'miss': missing character (expected but not typed)
 * - 'extra': extra character (typed but not expected)
 */

/**
 * Map typed characters to expected characters using greedy alignment
 * This handles cases where vowels might be omitted in typing
 *
 * @param {string} typedNorm - Normalized typed string
 * @param {string} expectedNorm - Normalized expected string
 * @param {string} practiceLanguageId - Practice language for optional vowel rules
 * @param {string} appLanguageId - App language for comparison
 * @returns {Object} Mapping information
 */
function mapTypedToExpected(typedNorm, expectedNorm, practiceLanguageId, appLanguageId) {
  const typedChars = getGraphemeClusters(typedNorm);
  const expectedChars = getGraphemeClusters(expectedNorm);

  const map = new Array(typedChars.length).fill(-1);
  const matches = new Array(typedChars.length).fill(false);

  // For languages with optional vowels (like Hebrew/Arabic transliteration),
  // we skip expected vowels if the typed character is a consonant
  const skipOptionalVowels = hasOptionalVowels(practiceLanguageId) && appLanguageId !== practiceLanguageId;

  let j = 0; // Pointer in expected string

  for (let i = 0; i < typedChars.length; i++) {
    const typedChar = typedChars[i];

    if (j >= expectedChars.length) {
      // No more expected characters - this is extra
      map[i] = -1;
      continue;
    }

    // Skip expected vowels if optional vowel mode is enabled and typed char is not a vowel
    if (skipOptionalVowels) {
      while (j < expectedChars.length &&
             isVowel(expectedChars[j], appLanguageId) &&
             !isVowel(typedChar, appLanguageId)) {
        j++;
      }
    }

    if (j >= expectedChars.length) {
      map[i] = -1;
      continue;
    }

    // Map this typed character to the current expected character
    map[i] = j;
    matches[i] = (typedChar === expectedChars[j]);
    j++;
  }

  return {
    typedChars,
    expectedChars,
    map,
    matches,
    skipOptionalVowels
  };
}

/**
 * Build ghost character sequence aligned with typed word
 * This creates a visual feedback where:
 * - Typed characters align with their expected counterparts
 * - Missing vowels/characters appear as grey
 * - Extra characters appear as yellow dashes
 *
 * @param {string} typed - User-typed word
 * @param {string} expected - Expected word (canonical form)
 * @param {string} practiceLanguageId - Practice language ID
 * @param {string} appLanguageId - App language ID
 * @returns {Array<{char: string, cls: string}>} Ghost character sequence
 */
export function buildGhostSequence(typed, expected, practiceLanguageId, appLanguageId) {
  const typedNorm = normalizeForLanguage(typed, appLanguageId);
  const expectedNorm = normalizeForLanguage(expected, appLanguageId);

  const {
    typedChars,
    expectedChars,
    map,
    matches,
    skipOptionalVowels
  } = mapTypedToExpected(typedNorm, expectedNorm, practiceLanguageId, appLanguageId);

  // Track which expected characters have been matched
  const matchedExpected = new Set();
  for (let i = 0; i < typedChars.length; i++) {
    if (map[i] >= 0) {
      matchedExpected.add(map[i]);
    }
  }

  const ghostChars = [];
  let typedIndex = 0;
  let expectedIndex = 0;

  while (expectedIndex < expectedChars.length || typedIndex < typedChars.length) {
    // Case 1: Insert missing expected characters (typically vowels)
    if (expectedIndex < expectedChars.length && !matchedExpected.has(expectedIndex)) {
      ghostChars.push({
        char: expectedChars[expectedIndex],
        cls: 'miss',
        phase: 'miss' // Revealed in "missing" phase
      });
      expectedIndex++;
      continue;
    }

    // Case 2: Expected character has a corresponding typed character
    if (typedIndex < typedChars.length && map[typedIndex] >= 0) {
      const expectedChar = expectedChars[map[typedIndex]];

      // Skip any unmatched expected chars before this one
      while (expectedIndex < map[typedIndex]) {
        if (!matchedExpected.has(expectedIndex)) {
          ghostChars.push({
            char: expectedChars[expectedIndex],
            cls: 'miss',
            phase: 'miss'
          });
        }
        expectedIndex++;
      }

      // Add the matched/mismatched character
      ghostChars.push({
        char: expectedChar,
        cls: matches[typedIndex] ? 'ok' : 'bad',
        phase: 'typed' // Revealed in "typed" phase
      });

      typedIndex++;
      expectedIndex++;
      continue;
    }

    // Case 3: Extra typed character (no corresponding expected char)
    if (typedIndex < typedChars.length && map[typedIndex] === -1) {
      ghostChars.push({
        // Show the correct translated letter so the ghost displays the target
        // word rather than the raw extra input.
        char: '',
        cls: 'extra',
        phase: 'typed'
      });
      typedIndex++;
      continue;
    }

    // Fallback: advance both pointers
    if (typedIndex < typedChars.length) typedIndex++;
    if (expectedIndex < expectedChars.length) expectedIndex++;
  }

  return ghostChars;
}

/**
 * Grade a typed word against a word definition
 * Returns the best matching variant and whether it's correct
 *
 * @param {string} typed - User-typed word
 * @param {Object} wordDef - Word definition with canonical and variants
 * @param {string} practiceLanguageId - Practice language ID
 * @param {string} appLanguageId - App language ID
 * @returns {Object} Grading result
 */
export function gradeWord(typed, wordDef, practiceLanguageId, appLanguageId) {
  if (!wordDef || !wordDef.canonical) {
    return {
      isCorrect: false,
      expected: '',
      normalized: '',
      variants: [],
      isAvailable: false
    };
  }

  const allVariants = [wordDef.canonical, ...(wordDef.variants || [])];
  const typedNorm = normalizeForLanguage(typed, appLanguageId);

  // Find the best matching variant
  const bestMatch = findBestVariant(typed, allVariants, appLanguageId);

  // Consider it correct if exact match after normalization
  const isCorrect = allVariants.some(variant =>
    normalizeForLanguage(variant, appLanguageId) === typedNorm
  );

  return {
    isCorrect,
    expected: bestMatch.variant,
    normalized: bestMatch.normalized,
    variants: allVariants,
    distance: bestMatch.distance,
    isAvailable: true
  };
}

/**
 * Build the complete grading result with ghost sequence
 *
 * @param {string} typed - User-typed word
 * @param {Object} wordDef - Word definition
 * @param {string} practiceLanguageId - Practice language ID
 * @param {string} appLanguageId - App language ID
 * @returns {Object} Complete grading result with ghost sequence
 */
export function gradeWithGhostSequence(typed, wordDef, practiceLanguageId, appLanguageId) {
  const grading = gradeWord(typed, wordDef, practiceLanguageId, appLanguageId);

  if (!grading.isAvailable) {
    return {
      ...grading,
      ghostSequence: [],
      typedChars: getGraphemeClusters(normalizeForLanguage(typed, appLanguageId))
    };
  }

  const ghostSequence = buildGhostSequence(
    typed,
    grading.expected,
    practiceLanguageId,
    appLanguageId
  );

  const typedChars = getGraphemeClusters(normalizeForLanguage(typed, appLanguageId));

  return {
    ...grading,
    ghostSequence,
    typedChars
  };
}

/**
 * Calculate the width needed for a word box (in characters)
 * Takes the maximum of typed length and ghost sequence length
 *
 * @param {number} typedLength - Length of typed word
 * @param {number} ghostLength - Length of ghost sequence
 * @returns {number} Width in characters
 */
export function calculateWordBoxWidth(typedLength, ghostLength) {
  return Math.max(typedLength, ghostLength, 2) + 2; // Add padding
}
