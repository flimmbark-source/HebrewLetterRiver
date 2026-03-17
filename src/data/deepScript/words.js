/**
 * Deep Script word content — Hebrew words used as combat enemies.
 *
 * Each word uses consonantal spelling (no niqqud).
 * Letters are stored as individual characters for validation.
 *
 * @typedef {Object} DSWord
 * @property {string}   id              — Stable identifier
 * @property {string}   hebrew          — Target Hebrew word (consonantal)
 * @property {string[]} letters         — Individual Hebrew letters, right-to-left order
 * @property {string}   transliteration — Romanized pronunciation
 * @property {string}   english         — English meaning
 * @property {number}   difficulty      — 1-5 scale
 * @property {string[]} tags            — Category tags
 * @property {string}   [root]          — Optional 3-letter root
 * @property {boolean}  [isMiniboss]    — Miniboss encounter flag
 */

export const deepScriptWords = [
  // --- Difficulty 1: 2-3 letter words ---
  {
    id: 'ds-yad',
    hebrew: 'יד',
    letters: ['י', 'ד'],
    transliteration: 'yad',
    english: 'hand',
    difficulty: 1,
    tags: ['body', 'concrete'],
  },
  {
    id: 'ds-yam',
    hebrew: 'ים',
    letters: ['י', 'ם'],
    transliteration: 'yam',
    english: 'sea',
    difficulty: 1,
    tags: ['nature', 'concrete'],
  },
  {
    id: 'ds-esh',
    hebrew: 'אש',
    letters: ['א', 'ש'],
    transliteration: 'esh',
    english: 'fire',
    difficulty: 1,
    tags: ['nature', 'concrete'],
  },
  {
    id: 'ds-har',
    hebrew: 'הר',
    letters: ['ה', 'ר'],
    transliteration: 'har',
    english: 'mountain',
    difficulty: 1,
    tags: ['nature', 'concrete'],
  },
  {
    id: 'ds-yom',
    hebrew: 'יום',
    letters: ['י', 'ו', 'ם'],
    transliteration: 'yom',
    english: 'day',
    difficulty: 1,
    tags: ['time', 'common'],
  },
  {
    id: 'ds-or',
    hebrew: 'אור',
    letters: ['א', 'ו', 'ר'],
    transliteration: 'or',
    english: 'light',
    difficulty: 1,
    tags: ['nature', 'abstract'],
  },

  // --- Difficulty 2: 3 letter words ---
  {
    id: 'ds-sefer',
    hebrew: 'ספר',
    letters: ['ס', 'פ', 'ר'],
    transliteration: 'sefer',
    english: 'book',
    difficulty: 2,
    tags: ['object', 'concrete'],
    root: 'ספר',
  },
  {
    id: 'ds-bayit',
    hebrew: 'בית',
    letters: ['ב', 'י', 'ת'],
    transliteration: 'bayit',
    english: 'house',
    difficulty: 2,
    tags: ['place', 'concrete'],
  },
  {
    id: 'ds-melech',
    hebrew: 'מלך',
    letters: ['מ', 'ל', 'ך'],
    transliteration: 'melech',
    english: 'king',
    difficulty: 2,
    tags: ['person', 'concrete'],
    root: 'מלך',
  },
  {
    id: 'ds-lechem',
    hebrew: 'לחם',
    letters: ['ל', 'ח', 'ם'],
    transliteration: 'lechem',
    english: 'bread',
    difficulty: 2,
    tags: ['food', 'concrete'],
    root: 'לחם',
  },
  {
    id: 'ds-delet',
    hebrew: 'דלת',
    letters: ['ד', 'ל', 'ת'],
    transliteration: 'delet',
    english: 'door',
    difficulty: 2,
    tags: ['object', 'concrete'],
  },
  {
    id: 'ds-ayin',
    hebrew: 'עין',
    letters: ['ע', 'י', 'ן'],
    transliteration: 'ayin',
    english: 'eye',
    difficulty: 2,
    tags: ['body', 'concrete'],
  },
  {
    id: 'ds-derech',
    hebrew: 'דרך',
    letters: ['ד', 'ר', 'ך'],
    transliteration: 'derech',
    english: 'road',
    difficulty: 2,
    tags: ['place', 'concrete'],
    root: 'דרך',
  },
  {
    id: 'ds-eretz',
    hebrew: 'ארץ',
    letters: ['א', 'ר', 'ץ'],
    transliteration: 'eretz',
    english: 'land',
    difficulty: 2,
    tags: ['nature', 'concrete'],
  },

  // --- Difficulty 3: 3-4 letter words ---
  {
    id: 'ds-shalom',
    hebrew: 'שלום',
    letters: ['ש', 'ל', 'ו', 'ם'],
    transliteration: 'shalom',
    english: 'peace',
    difficulty: 3,
    tags: ['abstract', 'common'],
    root: 'שלם',
  },
  {
    id: 'ds-mayim',
    hebrew: 'מים',
    letters: ['מ', 'י', 'ם'],
    transliteration: 'mayim',
    english: 'water',
    difficulty: 3,
    tags: ['nature', 'concrete'],
  },
  {
    id: 'ds-laila',
    hebrew: 'לילה',
    letters: ['ל', 'י', 'ל', 'ה'],
    transliteration: 'laila',
    english: 'night',
    difficulty: 3,
    tags: ['time', 'common'],
  },
  {
    id: 'ds-ir',
    hebrew: 'עיר',
    letters: ['ע', 'י', 'ר'],
    transliteration: 'ir',
    english: 'city',
    difficulty: 3,
    tags: ['place', 'concrete'],
  },
  {
    id: 'ds-ruach',
    hebrew: 'רוח',
    letters: ['ר', 'ו', 'ח'],
    transliteration: 'ruach',
    english: 'wind / spirit',
    difficulty: 3,
    tags: ['nature', 'abstract'],
  },
  {
    id: 'ds-kochav',
    hebrew: 'כוכב',
    letters: ['כ', 'ו', 'כ', 'ב'],
    transliteration: 'kochav',
    english: 'star',
    difficulty: 3,
    tags: ['nature', 'concrete'],
  },
  {
    id: 'ds-chalom',
    hebrew: 'חלום',
    letters: ['ח', 'ל', 'ו', 'ם'],
    transliteration: 'chalom',
    english: 'dream',
    difficulty: 3,
    tags: ['abstract', 'common'],
    root: 'חלם',
  },

  // --- Difficulty 4: 4+ letter words ---
  {
    id: 'ds-mishpacha',
    hebrew: 'משפחה',
    letters: ['מ', 'ש', 'פ', 'ח', 'ה'],
    transliteration: 'mishpacha',
    english: 'family',
    difficulty: 4,
    tags: ['person', 'abstract'],
  },
  {
    id: 'ds-choshech',
    hebrew: 'חושך',
    letters: ['ח', 'ו', 'ש', 'ך'],
    transliteration: 'choshech',
    english: 'darkness',
    difficulty: 4,
    tags: ['nature', 'abstract'],
  },
  {
    id: 'ds-chochmah',
    hebrew: 'חכמה',
    letters: ['ח', 'כ', 'מ', 'ה'],
    transliteration: 'chochmah',
    english: 'wisdom',
    difficulty: 4,
    tags: ['abstract'],
    root: 'חכם',
  },

  // --- Miniboss ---
  {
    id: 'ds-yerushalayim',
    hebrew: 'ירושלים',
    letters: ['י', 'ר', 'ו', 'ש', 'ל', 'י', 'ם'],
    transliteration: 'yerushalayim',
    english: 'Jerusalem',
    difficulty: 5,
    tags: ['place', 'proper'],
    isMiniboss: true,
  },
];

/**
 * All unique Hebrew letters used across the word set.
 * Useful for generation pools.
 */
export const allDeepScriptLetters = [...new Set(deepScriptWords.flatMap(w => w.letters))];

/**
 * Get words by difficulty range.
 */
export function getWordsByDifficulty(minDiff, maxDiff) {
  return deepScriptWords.filter(w => w.difficulty >= minDiff && w.difficulty <= maxDiff && !w.isMiniboss);
}

/**
 * Get the miniboss word(s).
 */
export function getMinibossWords() {
  return deepScriptWords.filter(w => w.isMiniboss);
}

/**
 * Get a word by ID.
 */
export function getWordById(id) {
  return deepScriptWords.find(w => w.id === id) || null;
}
