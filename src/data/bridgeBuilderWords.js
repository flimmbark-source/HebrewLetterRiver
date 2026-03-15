/**
 * Bridge Builder vocabulary data
 *
 * Static word data for the Bridge Builder game mode.
 * Structured for future glossary integration — each word has a stable id,
 * hebrew text, canonical transliteration, translation, theme, and difficulty.
 */

export const bridgeBuilderWords = [
  // Theme: Greetings (difficulty 1)
  {
    id: 'bb-shalom',
    hebrew: 'שלום',
    transliteration: 'shalom',
    translation: 'hello / peace',
    theme: 'greetings',
    difficulty: 1,
    tags: ['basics'],
  },
  {
    id: 'bb-todah',
    hebrew: 'תודה',
    transliteration: 'todah',
    translation: 'thank you',
    theme: 'greetings',
    difficulty: 1,
    tags: ['basics'],
  },
  {
    id: 'bb-boker-tov',
    hebrew: 'בוקר טוב',
    transliteration: 'boker tov',
    translation: 'good morning',
    theme: 'greetings',
    difficulty: 1,
    tags: ['basics'],
  },
  {
    id: 'bb-layla-tov',
    hebrew: 'לילה טוב',
    transliteration: 'layla tov',
    translation: 'good night',
    theme: 'greetings',
    difficulty: 1,
    tags: ['basics'],
  },
  {
    id: 'bb-bevakasha',
    hebrew: 'בבקשה',
    transliteration: 'bevakasha',
    translation: 'please / you\'re welcome',
    theme: 'greetings',
    difficulty: 1,
    tags: ['basics'],
  },

  // Theme: Pronouns (difficulty 1)
  {
    id: 'bb-ani',
    hebrew: 'אני',
    transliteration: 'ani',
    translation: 'I',
    theme: 'pronouns',
    difficulty: 1,
    tags: ['basics'],
  },
  {
    id: 'bb-atah',
    hebrew: 'אתה',
    transliteration: 'atah',
    translation: 'you (m)',
    theme: 'pronouns',
    difficulty: 1,
    tags: ['basics'],
  },
  {
    id: 'bb-at',
    hebrew: 'את',
    transliteration: 'at',
    translation: 'you (f)',
    theme: 'pronouns',
    difficulty: 1,
    tags: ['basics'],
  },

  // Theme: Family (difficulty 2)
  {
    id: 'bb-ima',
    hebrew: 'אמא',
    transliteration: 'ima',
    translation: 'mom',
    theme: 'family',
    difficulty: 2,
    tags: ['nouns'],
  },
  {
    id: 'bb-abba',
    hebrew: 'אבא',
    transliteration: 'abba',
    translation: 'dad',
    theme: 'family',
    difficulty: 2,
    tags: ['nouns'],
  },
  {
    id: 'bb-mishpacha',
    hebrew: 'משפחה',
    transliteration: 'mishpacha',
    translation: 'family',
    theme: 'family',
    difficulty: 2,
    tags: ['nouns'],
  },
  {
    id: 'bb-bayit',
    hebrew: 'בית',
    transliteration: 'bayit',
    translation: 'house / home',
    theme: 'family',
    difficulty: 2,
    tags: ['nouns'],
  },

  // Theme: Food (difficulty 2)
  {
    id: 'bb-lechem',
    hebrew: 'לחם',
    transliteration: 'lechem',
    translation: 'bread',
    theme: 'food',
    difficulty: 2,
    tags: ['nouns'],
  },
  {
    id: 'bb-mayim',
    hebrew: 'מים',
    transliteration: 'mayim',
    translation: 'water',
    theme: 'food',
    difficulty: 2,
    tags: ['nouns'],
  },
  {
    id: 'bb-cafe',
    hebrew: 'קפה',
    transliteration: 'kafe',
    translation: 'coffee',
    theme: 'food',
    difficulty: 2,
    tags: ['nouns'],
  },
  {
    id: 'bb-tapuach',
    hebrew: 'תפוח',
    transliteration: 'tapuach',
    translation: 'apple',
    theme: 'food',
    difficulty: 2,
    tags: ['nouns'],
  },

  // Theme: Adjectives (difficulty 2)
  {
    id: 'bb-tov',
    hebrew: 'טוב',
    transliteration: 'tov',
    translation: 'good',
    theme: 'adjectives',
    difficulty: 2,
    tags: ['basics'],
  },
  {
    id: 'bb-gadol',
    hebrew: 'גדול',
    transliteration: 'gadol',
    translation: 'big',
    theme: 'adjectives',
    difficulty: 2,
    tags: ['basics'],
  },
  {
    id: 'bb-katan',
    hebrew: 'קטן',
    transliteration: 'katan',
    translation: 'small',
    theme: 'adjectives',
    difficulty: 2,
    tags: ['basics'],
  },
  {
    id: 'bb-yafe',
    hebrew: 'יפה',
    transliteration: 'yafe',
    translation: 'beautiful',
    theme: 'adjectives',
    difficulty: 2,
    tags: ['basics'],
  },
];

/**
 * Get distractor transliterations for a given word.
 * Returns transliterations from the pool excluding the correct one.
 */
export function getTransliterationDistractors(wordId, count = 2) {
  const word = bridgeBuilderWords.find(w => w.id === wordId);
  if (!word) return [];
  const others = bridgeBuilderWords
    .filter(w => w.id !== wordId)
    .map(w => w.transliteration);
  return shuffle(others).slice(0, count);
}

/**
 * Get distractor translations for a given word.
 */
export function getTranslationDistractors(wordId, count = 2) {
  const word = bridgeBuilderWords.find(w => w.id === wordId);
  if (!word) return [];
  const others = bridgeBuilderWords
    .filter(w => w.id !== wordId)
    .map(w => w.translation);
  return shuffle(others).slice(0, count);
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
