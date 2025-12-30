/**
 * Utilities for the Reading Area learn mode.
 * Handles language-aware normalization, direction detection, and grading.
 */

import { loadLanguage } from './languageLoader.js';

/**
 * Vowel sets for different languages
 */
const VOWELS = {
  latin: new Set(['a', 'e', 'i', 'o', 'u', 'y']),
  hebrew: new Set(['a', 'e', 'i', 'o', 'u']),
  arabic: new Set(['a', 'i', 'u']),
  cyrillic: new Set(['а', 'е', 'ё', 'и', 'о', 'у', 'ы', 'э', 'ю', 'я']),
  devanagari: new Set(['अ', 'आ', 'इ', 'ई', 'उ', 'ऊ', 'ए', 'ऐ', 'ओ', 'औ'])
};

/**
 * Normalization rules for different languages
 */
const normalizationRules = {
  // Latin script languages (English, Spanish, French, Portuguese)
  latin: (str) => {
    return str
      .toLowerCase()
      .normalize('NFD') // Decompose accented characters
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^a-z0-9\s]/g, '') // Keep alphanumeric and spaces
      .replace(/\s+/g, ' ') // Normalize multiple spaces to single space
      .replace(/ch/g, 'kh') // Hebrew ch -> kh
      .replace(/tz/g, 'ts') // Hebrew tz -> ts
      .replace(/aa/g, 'a') // Double vowels -> single
      .replace(/ee/g, 'e')
      .replace(/ii/g, 'i')
      .replace(/oo/g, 'o')
      .replace(/uu/g, 'u')
      .trim();
  },

  // Hebrew script
  hebrew: (str) => {
    return str
      .normalize('NFD')
      .replace(/[\u0591-\u05C7]/g, '') // Remove all nikud/cantillation marks
      .replace(/\s+/g, ' ') // Normalize multiple spaces to single space
      .trim();
  },

  // Arabic script
  arabic: (str) => {
    return str
      .normalize('NFD')
      .replace(/[\u064B-\u065F]/g, '') // Remove Arabic diacritics (tashkeel)
      .replace(/[\u0670]/g, '') // Remove superscript alef
      .replace(/[ٱأإآ]/g, 'ا') // Normalize alef variants
      .replace(/[ى]/g, 'ي') // Normalize yaa
      .replace(/[ة]/g, 'ه') // Normalize taa marbouta
      .replace(/\s+/g, ' ') // Normalize multiple spaces to single space
      .trim();
  },

  // Cyrillic (Russian)
  cyrillic: (str) => {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[^а-яё0-9\s]/g, '') // Keep Cyrillic, numbers, and spaces
      .replace(/\s+/g, ' ') // Normalize multiple spaces to single space
      .trim();
  },

  // Devanagari (Hindi)
  devanagari: (str) => {
    return str
      .normalize('NFD')
      .replace(/[\u0900-\u0903\u093A-\u094F\u0951-\u0957\u0962-\u0963]/g, '') // Remove diacritics
      .replace(/\s+/g, ' ') // Normalize multiple spaces to single space
      .trim();
  },

  // CJK (Chinese, Japanese)
  cjk: (str) => {
    return str
      .normalize('NFD')
      .replace(/\s+/g, ' ') // Normalize multiple spaces to single space
      .trim();
  },

  // Bengali
  bengali: (str) => {
    return str
      .normalize('NFD')
      .replace(/[\u0981-\u0983\u09BC\u09BE-\u09C4\u09C7-\u09C8\u09CB-\u09CD\u09D7]/g, '') // Remove diacritics
      .replace(/\s+/g, ' ') // Normalize multiple spaces to single space
      .trim();
  }
};

/**
 * Detect script type from language ID
 */
function getScriptType(languageId) {
  const scriptMap = {
    english: 'latin',
    spanish: 'latin',
    french: 'latin',
    portuguese: 'latin',
    hebrew: 'hebrew',
    arabic: 'arabic',
    russian: 'cyrillic',
    hindi: 'devanagari',
    mandarin: 'cjk',
    japanese: 'cjk',
    bengali: 'bengali',
    amharic: 'ethiopic'
  };
  return scriptMap[languageId] || 'latin';
}

/**
 * Normalize a string for comparison based on language
 * @param {string} str - String to normalize
 * @param {string} languageId - Language ID
 * @returns {string} Normalized string
 */
export function normalizeForLanguage(str, languageId) {
  if (!str) return '';

  const scriptType = getScriptType(languageId);
  const normalizer = normalizationRules[scriptType] || normalizationRules.latin;

  return normalizer(str);
}

/**
 * Check if a character is a vowel in a specific script
 * @param {string} char - Single character
 * @param {string} languageId - Language ID
 * @returns {boolean}
 */
export function isVowel(char, languageId) {
  const scriptType = getScriptType(languageId);
  const vowelSet = VOWELS[scriptType] || VOWELS.latin;
  return vowelSet.has(char.toLowerCase());
}

/**
 * Get text direction for a language
 * @param {string} languageId - Language ID
 * @returns {string} 'rtl' or 'ltr'
 */
export function getTextDirection(languageId) {
  try {
    const languagePack = loadLanguage(languageId);
    return languagePack?.metadata?.textDirection || 'ltr';
  } catch (e) {
    // Fallback detection
    const rtlLanguages = ['hebrew', 'arabic'];
    return rtlLanguages.includes(languageId) ? 'rtl' : 'ltr';
  }
}

/**
 * Check if a language typically omits vowels in written text
 * @param {string} languageId - Language ID
 * @returns {boolean}
 */
export function hasOptionalVowels(languageId) {
  // Languages that commonly omit vowels in regular text
  const optionalVowelLanguages = ['hebrew', 'arabic'];
  return optionalVowelLanguages.includes(languageId);
}

/**
 * Get grapheme clusters (user-perceived characters) from a string
 * This handles combining characters, emoji, etc.
 * @param {string} str - Input string
 * @returns {string[]} Array of grapheme clusters
 */
export function getGraphemeClusters(str) {
  if (!str) return [];

  // Use Intl.Segmenter if available (modern browsers)
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' });
    return Array.from(segmenter.segment(str), s => s.segment);
  }

  // Fallback: simple split (won't handle all edge cases)
  return Array.from(str);
}

/**
 * Calculate edit distance between two strings (Levenshtein distance)
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {number} Edit distance
 */
export function editDistance(a, b) {
  const n = a.length;
  const m = b.length;

  if (n === 0) return m;
  if (m === 0) return n;

  const dp = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));

  for (let i = 0; i <= n; i++) dp[i][0] = i;
  for (let j = 0; j <= m; j++) dp[0][j] = j;

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,      // deletion
        dp[i][j - 1] + 1,      // insertion
        dp[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return dp[n][m];
}

/**
 * Find the best matching variant from a list based on edit distance
 * @param {string} typed - User-typed string
 * @param {string[]} variants - List of acceptable variants
 * @param {string} languageId - Language for normalization
 * @returns {{variant: string, distance: number, normalized: string}}
 */
export function findBestVariant(typed, variants, languageId) {
  const normalizedTyped = normalizeForLanguage(typed, languageId);

  let best = {
    variant: variants[0] || '',
    distance: Infinity,
    normalized: ''
  };

  for (const variant of variants) {
    const normalizedVariant = normalizeForLanguage(variant, languageId);
    const distance = editDistance(normalizedTyped, normalizedVariant);

    if (distance < best.distance) {
      best = {
        variant,
        distance,
        normalized: normalizedVariant
      };
    }
  }

  return best;
}

/**
 * Tokenize text into words and punctuation
 * @param {string} text - Text to tokenize
 * @param {string} languageId - Language ID
 * @returns {Array<{type: 'word'|'punct', text: string}>}
 */
export function tokenizeText(text, languageId) {
  const direction = getTextDirection(languageId);

  // Split by whitespace and punctuation, keeping both
  const tokens = [];
  let currentWord = '';

  for (const char of text) {
    // Common punctuation marks across languages
    if (/[\s.,!?;:،。！？；：]/.test(char)) {
      if (currentWord) {
        tokens.push({ type: 'word', text: currentWord });
        currentWord = '';
      }
      if (char.trim()) {
        tokens.push({ type: 'punct', text: char });
      }
    } else {
      currentWord += char;
    }
  }

  if (currentWord) {
    tokens.push({ type: 'word', text: currentWord });
  }

  return tokens;
}

/**
 * Get font class for a language
 * @param {string} languageId - Language ID
 * @returns {string} CSS class name
 */
export function getFontClass(languageId) {
  try {
    const languagePack = loadLanguage(languageId);
    return languagePack?.metadata?.fontClass || '';
  } catch (e) {
    return '';
  }
}

/**
 * Format a number for display in a specific language
 * @param {number} num - Number to format
 * @param {string} languageId - Language ID
 * @returns {string} Formatted number
 */
export function formatNumber(num, languageId) {
  // Use locale-aware number formatting
  const localeMap = {
    english: 'en',
    spanish: 'es',
    french: 'fr',
    portuguese: 'pt',
    hebrew: 'he',
    arabic: 'ar',
    russian: 'ru',
    hindi: 'hi',
    mandarin: 'zh',
    japanese: 'ja',
    bengali: 'bn',
    amharic: 'am'
  };

  const locale = localeMap[languageId] || 'en';

  try {
    return new Intl.NumberFormat(locale).format(num);
  } catch (e) {
    return String(num);
  }
}
