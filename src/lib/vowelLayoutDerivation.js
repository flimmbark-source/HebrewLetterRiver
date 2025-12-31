/**
 * Vowel Layout Derivation System
 *
 * Automatically derives vowel layout information from canonical transliterations.
 * Extracts vowel sequences, generates layout IDs, and creates icon specifications.
 */

/**
 * Vowel token definitions
 */
export const VOWEL_TOKENS = {
  A: 'A',
  E: 'E',
  I: 'I',
  O: 'O',
  U: 'U',
  Y: 'Y'
};

/**
 * Vowel color mapping for icon visualization
 * Using high-contrast, colorblind-friendly palette
 */
export const VOWEL_COLORS = {
  A: '#CC3311', // Red
  E: '#EE7733', // Orange
  I: '#0077BB', // Blue
  O: '#009988', // Teal/Green
  U: '#F0E442', // Yellow
  Y: '#EE3377'  // Magenta/Purple
};

/**
 * Extract vowel tokens from a transliteration string
 * @param {string} transliteration - Canonical transliteration (e.g., "aval", "ulay")
 * @returns {string[]} Array of vowel tokens (e.g., ['A', 'A'], ['U', 'A', 'Y'])
 */
export function extractVowelTokens(transliteration) {
  if (!transliteration) return [];

  // Normalize: lowercase, remove spaces/hyphens/apostrophes
  const normalized = transliteration
    .toLowerCase()
    .replace(/[\s\-']/g, '');

  const vowelTokens = [];
  let i = 0;

  while (i < normalized.length) {
    // Check for diphthongs first (two-character patterns)
    const twoChar = normalized.substring(i, i + 2);

    if (twoChar === 'ay') {
      vowelTokens.push(VOWEL_TOKENS.A, VOWEL_TOKENS.Y);
      i += 2;
    } else if (twoChar === 'ey') {
      vowelTokens.push(VOWEL_TOKENS.E, VOWEL_TOKENS.Y);
      i += 2;
    } else if (twoChar === 'oy') {
      vowelTokens.push(VOWEL_TOKENS.O, VOWEL_TOKENS.Y);
      i += 2;
    } else {
      // Check for single vowels
      const char = normalized[i];

      if (char === 'a') {
        vowelTokens.push(VOWEL_TOKENS.A);
      } else if (char === 'e') {
        vowelTokens.push(VOWEL_TOKENS.E);
      } else if (char === 'i') {
        vowelTokens.push(VOWEL_TOKENS.I);
      } else if (char === 'o') {
        vowelTokens.push(VOWEL_TOKENS.O);
      } else if (char === 'u') {
        vowelTokens.push(VOWEL_TOKENS.U);
      }
      // Y is only recognized as part of diphthongs, not standalone

      i += 1;
    }
  }

  return vowelTokens;
}

/**
 * Generate a vowel layout ID from vowel tokens
 * @param {string[]} vowelTokens - Array of vowel tokens
 * @returns {string} Layout ID (e.g., "VL_2_A-A", "VL_3_U-A-Y")
 */
export function generateLayoutId(vowelTokens) {
  if (!vowelTokens || vowelTokens.length === 0) {
    return null;
  }

  const beatCount = vowelTokens.length;
  const layoutKey = vowelTokens.join('-');

  return `VL_${beatCount}_${layoutKey}`;
}

/**
 * Derive complete layout info from transliteration
 * @param {string} transliteration - Canonical transliteration
 * @returns {Object|null} Layout info with id, vowelTokens, beatCount, iconSpec
 */
export function deriveLayoutFromTransliteration(transliteration) {
  const vowelTokens = extractVowelTokens(transliteration);

  if (vowelTokens.length === 0) {
    return null;
  }

  const layoutId = generateLayoutId(vowelTokens);
  const beatCount = vowelTokens.length;
  const iconSpec = generateIconSpec(vowelTokens, beatCount);

  return {
    id: layoutId,
    vowelTokens,
    beatCount,
    iconSpec
  };
}

/**
 * Generate icon specification from vowel tokens
 * @param {string[]} vowelTokens - Array of vowel tokens
 * @param {number} beatCount - Number of beats
 * @returns {Object} Icon spec with shape, colors, segments
 */
export function generateIconSpec(vowelTokens, beatCount) {
  // Determine shape based on beat count
  let shape;
  let showBadge = false;

  if (beatCount === 1) {
    shape = 'circle';
  } else if (beatCount === 2) {
    shape = 'diamond';
  } else if (beatCount === 3) {
    shape = 'triangle';
  } else if (beatCount === 4) {
    shape = 'square';
  } else if (beatCount === 5 || beatCount === 6) {
    shape = 'hexagon'; // 6 sides for 5-6 beats
  } else if (beatCount === 7) {
    shape = 'heptagon'; // 7 sides for 7 beats
  } else if (beatCount === 8) {
    shape = 'octagon'; // 8 sides for 8 beats
  } else {
    // More than 8 beats: use octagon with badge
    shape = 'octagon';
    showBadge = true;
  }

  // Map vowel tokens to colors (limit to max shape segments)
  const maxSegments =
    shape === 'hexagon' ? 6 :
    shape === 'heptagon' ? 7 :
    shape === 'octagon' ? 8 :
    4;
  const colors = vowelTokens.slice(0, maxSegments).map(token => VOWEL_COLORS[token]);

  return {
    shape,
    colors,
    segments: Math.min(beatCount, maxSegments),
    showBadge,
    fullBeatCount: beatCount
  };
}

/**
 * Generate human-readable vowel sequence description
 * @param {string[]} vowelTokens - Array of vowel tokens
 * @returns {string} Description (e.g., "A → A", "U → A → Y")
 */
export function getVowelSequenceDescription(vowelTokens) {
  return vowelTokens.join(' → ');
}

/**
 * Generate teaching text for a vowel layout
 * @param {string[]} vowelTokens - Array of vowel tokens
 * @param {number} beatCount - Number of beats
 * @returns {Object} Teaching content with title, explanation, rules
 */
export function generateTeachingContent(vowelTokens, beatCount) {
  const sequenceDesc = getVowelSequenceDescription(vowelTokens);

  // Generate title
  const title = `${sequenceDesc} Pattern`;

  // Generate explanation
  const explanation = `${beatCount} vowel ${beatCount === 1 ? 'sound' : 'sounds'}: ${sequenceDesc}`;

  // Generate simple rules
  const rules = [];

  vowelTokens.forEach((token, idx) => {
    const position = idx + 1;
    const soundMap = {
      A: '"a" (ah)',
      E: '"e" (eh)',
      I: '"i" (ee)',
      O: '"o" (oh)',
      U: '"u" (oo)',
      Y: '"y" (eye)'
    };
    rules.push(`${position}. ${soundMap[token] || token}`);
  });

  return {
    title,
    explanation,
    rules
  };
}

/**
 * Batch derive layouts for multiple words
 * @param {Array} words - Array of {id, transliteration} objects
 * @returns {Object} Map of wordId -> layoutId
 */
export function deriveLayoutsForWords(words) {
  const layoutMap = {};

  words.forEach(word => {
    if (word.transliteration) {
      const layout = deriveLayoutFromTransliteration(word.transliteration);
      if (layout) {
        layoutMap[word.id] = layout.id;
      }
    }
  });

  return layoutMap;
}

/**
 * Group words by vowel layout
 * @param {Array} words - Array of {id, transliteration, ...} objects
 * @returns {Object} Map of layoutId -> array of words
 */
export function groupWordsByLayout(words) {
  const groups = {};

  words.forEach(word => {
    if (word.transliteration) {
      const layout = deriveLayoutFromTransliteration(word.transliteration);
      if (layout) {
        if (!groups[layout.id]) {
          groups[layout.id] = {
            layoutInfo: layout,
            words: []
          };
        }
        groups[layout.id].words.push(word);
      }
    }
  });

  return groups;
}
