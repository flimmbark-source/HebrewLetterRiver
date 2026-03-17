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

  /* ═══════════════════════════════════════════════════════════
     Difficulty 1 — Short (2-3 letters), very common
     ═══════════════════════════════════════════════════════════ */

  { id: 'ds-yad',   hebrew: 'יד',   letters: ['י','ד'],       transliteration: 'yad',   english: 'hand',     difficulty: 1, tags: ['body','concrete'] },
  { id: 'ds-yam',   hebrew: 'ים',   letters: ['י','ם'],       transliteration: 'yam',   english: 'sea',      difficulty: 1, tags: ['nature','concrete'] },
  { id: 'ds-esh',   hebrew: 'אש',   letters: ['א','ש'],       transliteration: 'esh',   english: 'fire',     difficulty: 1, tags: ['nature','concrete'] },
  { id: 'ds-har',   hebrew: 'הר',   letters: ['ה','ר'],       transliteration: 'har',   english: 'mountain', difficulty: 1, tags: ['nature','concrete'] },
  { id: 'ds-yom',   hebrew: 'יום',  letters: ['י','ו','ם'],   transliteration: 'yom',   english: 'day',      difficulty: 1, tags: ['time','common'] },
  { id: 'ds-or',    hebrew: 'אור',  letters: ['א','ו','ר'],   transliteration: 'or',    english: 'light',    difficulty: 1, tags: ['nature','abstract'] },
  { id: 'ds-av',    hebrew: 'אב',   letters: ['א','ב'],       transliteration: 'av',    english: 'father',   difficulty: 1, tags: ['person','family'] },
  { id: 'ds-em',    hebrew: 'אם',   letters: ['א','ם'],       transliteration: 'em',    english: 'mother',   difficulty: 1, tags: ['person','family'] },
  { id: 'ds-ben',   hebrew: 'בן',   letters: ['ב','ן'],       transliteration: 'ben',   english: 'son',      difficulty: 1, tags: ['person','family'] },
  { id: 'ds-bat',   hebrew: 'בת',   letters: ['ב','ת'],       transliteration: 'bat',   english: 'daughter', difficulty: 1, tags: ['person','family'] },
  { id: 'ds-dam',   hebrew: 'דם',   letters: ['ד','ם'],       transliteration: 'dam',   english: 'blood',    difficulty: 1, tags: ['body','concrete'] },
  { id: 'ds-gag',   hebrew: 'גג',   letters: ['ג','ג'],       transliteration: 'gag',   english: 'roof',     difficulty: 1, tags: ['place','concrete'] },
  { id: 'ds-kol',   hebrew: 'קול',  letters: ['ק','ו','ל'],   transliteration: 'kol',   english: 'voice',    difficulty: 1, tags: ['abstract','common'] },
  { id: 'ds-etz',   hebrew: 'עץ',   letters: ['ע','ץ'],       transliteration: 'etz',   english: 'tree',     difficulty: 1, tags: ['nature','concrete'] },
  { id: 'ds-peh',   hebrew: 'פה',   letters: ['פ','ה'],       transliteration: 'peh',   english: 'mouth',    difficulty: 1, tags: ['body','concrete'] },
  { id: 'ds-ach',   hebrew: 'אח',   letters: ['א','ח'],       transliteration: 'ach',   english: 'brother',  difficulty: 1, tags: ['person','family'] },
  { id: 'ds-ish',   hebrew: 'איש',  letters: ['א','י','ש'],   transliteration: 'ish',   english: 'man',      difficulty: 1, tags: ['person','common'] },
  { id: 'ds-af',    hebrew: 'אף',   letters: ['א','ף'],       transliteration: 'af',    english: 'nose',     difficulty: 1, tags: ['body','concrete'] },
  { id: 'ds-tov',   hebrew: 'טוב',  letters: ['ט','ו','ב'],   transliteration: 'tov',   english: 'good',     difficulty: 1, tags: ['adjective','common'] },
  { id: 'ds-ra',    hebrew: 'רע',   letters: ['ר','ע'],       transliteration: 'ra',    english: 'bad / evil', difficulty: 1, tags: ['adjective','common'] },

  /* ═══════════════════════════════════════════════════════════
     Difficulty 2 — Common 3-letter words
     ═══════════════════════════════════════════════════════════ */

  { id: 'ds-sefer',  hebrew: 'ספר',  letters: ['ס','פ','ר'],   transliteration: 'sefer',  english: 'book',    difficulty: 2, tags: ['object','concrete'], root: 'ספר' },
  { id: 'ds-bayit',  hebrew: 'בית',  letters: ['ב','י','ת'],   transliteration: 'bayit',  english: 'house',   difficulty: 2, tags: ['place','concrete'] },
  { id: 'ds-melech', hebrew: 'מלך',  letters: ['מ','ל','ך'],   transliteration: 'melech', english: 'king',    difficulty: 2, tags: ['person','concrete'], root: 'מלך' },
  { id: 'ds-lechem', hebrew: 'לחם',  letters: ['ל','ח','ם'],   transliteration: 'lechem', english: 'bread',   difficulty: 2, tags: ['food','concrete'], root: 'לחם' },
  { id: 'ds-delet',  hebrew: 'דלת',  letters: ['ד','ל','ת'],   transliteration: 'delet',  english: 'door',    difficulty: 2, tags: ['object','concrete'] },
  { id: 'ds-ayin',   hebrew: 'עין',  letters: ['ע','י','ן'],   transliteration: 'ayin',   english: 'eye',     difficulty: 2, tags: ['body','concrete'] },
  { id: 'ds-derech', hebrew: 'דרך',  letters: ['ד','ר','ך'],   transliteration: 'derech', english: 'road',    difficulty: 2, tags: ['place','concrete'], root: 'דרך' },
  { id: 'ds-eretz',  hebrew: 'ארץ',  letters: ['א','ר','ץ'],   transliteration: 'eretz',  english: 'land',    difficulty: 2, tags: ['nature','concrete'] },
  { id: 'ds-mayim',  hebrew: 'מים',  letters: ['מ','י','ם'],   transliteration: 'mayim',  english: 'water',   difficulty: 2, tags: ['nature','concrete'] },
  { id: 'ds-ir',     hebrew: 'עיר',  letters: ['ע','י','ר'],   transliteration: 'ir',     english: 'city',    difficulty: 2, tags: ['place','concrete'] },
  { id: 'ds-ner',    hebrew: 'נר',   letters: ['נ','ר'],       transliteration: 'ner',    english: 'candle',  difficulty: 2, tags: ['object','concrete'] },
  { id: 'ds-regel',  hebrew: 'רגל',  letters: ['ר','ג','ל'],   transliteration: 'regel',  english: 'foot / leg', difficulty: 2, tags: ['body','concrete'] },
  { id: 'ds-lev',    hebrew: 'לב',   letters: ['ל','ב'],       transliteration: 'lev',    english: 'heart',   difficulty: 2, tags: ['body','concrete'] },
  { id: 'ds-dag',    hebrew: 'דג',   letters: ['ד','ג'],       transliteration: 'dag',    english: 'fish',    difficulty: 2, tags: ['animal','concrete'] },
  { id: 'ds-sus',    hebrew: 'סוס',  letters: ['ס','ו','ס'],   transliteration: 'sus',    english: 'horse',   difficulty: 2, tags: ['animal','concrete'] },
  { id: 'ds-kelev',  hebrew: 'כלב',  letters: ['כ','ל','ב'],   transliteration: 'kelev',  english: 'dog',     difficulty: 2, tags: ['animal','concrete'] },
  { id: 'ds-gan',    hebrew: 'גן',   letters: ['ג','ן'],       transliteration: 'gan',    english: 'garden',  difficulty: 2, tags: ['place','concrete'] },
  { id: 'ds-kos',    hebrew: 'כוס',  letters: ['כ','ו','ס'],   transliteration: 'kos',    english: 'cup',     difficulty: 2, tags: ['object','concrete'] },
  { id: 'ds-sir',    hebrew: 'סיר',  letters: ['ס','י','ר'],   transliteration: 'sir',    english: 'pot',     difficulty: 2, tags: ['object','concrete'] },
  { id: 'ds-shor',   hebrew: 'שור',  letters: ['ש','ו','ר'],   transliteration: 'shor',   english: 'ox / bull', difficulty: 2, tags: ['animal','concrete'] },
  { id: 'ds-chag',   hebrew: 'חג',   letters: ['ח','ג'],       transliteration: 'chag',   english: 'holiday', difficulty: 2, tags: ['time','common'] },
  { id: 'ds-gvul',   hebrew: 'גבול', letters: ['ג','ב','ו','ל'], transliteration: 'gvul', english: 'border',  difficulty: 2, tags: ['place','abstract'] },
  { id: 'ds-anan',   hebrew: 'ענן',  letters: ['ע','נ','ן'],   transliteration: 'anan',   english: 'cloud',   difficulty: 2, tags: ['nature','concrete'] },
  { id: 'ds-geshem', hebrew: 'גשם',  letters: ['ג','ש','ם'],   transliteration: 'geshem', english: 'rain',    difficulty: 2, tags: ['nature','concrete'] },

  /* ═══════════════════════════════════════════════════════════
     Difficulty 3 — 3-4 letter words, common vocabulary
     ═══════════════════════════════════════════════════════════ */

  { id: 'ds-shalom',    hebrew: 'שלום',  letters: ['ש','ל','ו','ם'],       transliteration: 'shalom',    english: 'peace',      difficulty: 3, tags: ['abstract','common'], root: 'שלם' },
  { id: 'ds-laila',     hebrew: 'לילה',  letters: ['ל','י','ל','ה'],       transliteration: 'laila',     english: 'night',      difficulty: 3, tags: ['time','common'] },
  { id: 'ds-ruach',     hebrew: 'רוח',   letters: ['ר','ו','ח'],           transliteration: 'ruach',     english: 'wind / spirit', difficulty: 3, tags: ['nature','abstract'] },
  { id: 'ds-kochav',    hebrew: 'כוכב',  letters: ['כ','ו','כ','ב'],       transliteration: 'kochav',    english: 'star',       difficulty: 3, tags: ['nature','concrete'] },
  { id: 'ds-chalom',    hebrew: 'חלום',  letters: ['ח','ל','ו','ם'],       transliteration: 'chalom',    english: 'dream',      difficulty: 3, tags: ['abstract','common'], root: 'חלם' },
  { id: 'ds-gamal',     hebrew: 'גמל',   letters: ['ג','מ','ל'],           transliteration: 'gamal',     english: 'camel',      difficulty: 3, tags: ['animal','concrete'] },
  { id: 'ds-namer',     hebrew: 'נמר',   letters: ['נ','מ','ר'],           transliteration: 'namer',     english: 'leopard',    difficulty: 3, tags: ['animal','concrete'] },
  { id: 'ds-nesher',    hebrew: 'נשר',   letters: ['נ','ש','ר'],           transliteration: 'nesher',    english: 'eagle',      difficulty: 3, tags: ['animal','concrete'] },
  { id: 'ds-shemesh',   hebrew: 'שמש',   letters: ['ש','מ','ש'],           transliteration: 'shemesh',   english: 'sun',        difficulty: 3, tags: ['nature','concrete'], root: 'שמש' },
  { id: 'ds-keren',     hebrew: 'קרן',   letters: ['ק','ר','ן'],           transliteration: 'keren',     english: 'horn / ray', difficulty: 3, tags: ['nature','abstract'] },
  { id: 'ds-midbar',    hebrew: 'מדבר',  letters: ['מ','ד','ב','ר'],       transliteration: 'midbar',    english: 'desert',     difficulty: 3, tags: ['nature','place'], root: 'דבר' },
  { id: 'ds-nahar',     hebrew: 'נהר',   letters: ['נ','ה','ר'],           transliteration: 'nahar',     english: 'river',      difficulty: 3, tags: ['nature','concrete'] },
  { id: 'ds-even',      hebrew: 'אבן',   letters: ['א','ב','ן'],           transliteration: 'even',      english: 'stone',      difficulty: 3, tags: ['nature','concrete'] },
  { id: 'ds-zahav',     hebrew: 'זהב',   letters: ['ז','ה','ב'],           transliteration: 'zahav',     english: 'gold',       difficulty: 3, tags: ['object','concrete'] },
  { id: 'ds-kesef',     hebrew: 'כסף',   letters: ['כ','ס','ף'],           transliteration: 'kesef',     english: 'silver / money', difficulty: 3, tags: ['object','concrete'] },
  { id: 'ds-cherev',    hebrew: 'חרב',   letters: ['ח','ר','ב'],           transliteration: 'cherev',    english: 'sword',      difficulty: 3, tags: ['object','concrete'], root: 'חרב' },
  { id: 'ds-magen',     hebrew: 'מגן',   letters: ['מ','ג','ן'],           transliteration: 'magen',     english: 'shield',     difficulty: 3, tags: ['object','concrete'] },
  { id: 'ds-keter',     hebrew: 'כתר',   letters: ['כ','ת','ר'],           transliteration: 'keter',     english: 'crown',      difficulty: 3, tags: ['object','concrete'] },
  { id: 'ds-shulchan',  hebrew: 'שלחן',  letters: ['ש','ל','ח','ן'],       transliteration: 'shulchan',  english: 'table',      difficulty: 3, tags: ['object','concrete'] },
  { id: 'ds-kiseh',     hebrew: 'כסא',   letters: ['כ','ס','א'],           transliteration: 'kiseh',     english: 'chair / throne', difficulty: 3, tags: ['object','concrete'] },
  { id: 'ds-lechem2',   hebrew: 'מלח',   letters: ['מ','ל','ח'],           transliteration: 'melach',    english: 'salt',       difficulty: 3, tags: ['food','concrete'] },
  { id: 'ds-yayin',     hebrew: 'יין',   letters: ['י','י','ן'],           transliteration: 'yayin',     english: 'wine',       difficulty: 3, tags: ['food','concrete'] },
  { id: 'ds-dvash',     hebrew: 'דבש',   letters: ['ד','ב','ש'],           transliteration: 'dvash',     english: 'honey',      difficulty: 3, tags: ['food','concrete'] },
  { id: 'ds-tapuach',   hebrew: 'תפוח',  letters: ['ת','פ','ו','ח'],       transliteration: 'tapuach',   english: 'apple',      difficulty: 3, tags: ['food','concrete'] },
  { id: 'ds-chalav',    hebrew: 'חלב',   letters: ['ח','ל','ב'],           transliteration: 'chalav',    english: 'milk',       difficulty: 3, tags: ['food','concrete'] },
  { id: 'ds-nefesh',    hebrew: 'נפש',   letters: ['נ','פ','ש'],           transliteration: 'nefesh',    english: 'soul',       difficulty: 3, tags: ['abstract'] },
  { id: 'ds-koach',     hebrew: 'כוח',   letters: ['כ','ו','ח'],           transliteration: 'koach',     english: 'strength',   difficulty: 3, tags: ['abstract'] },
  { id: 'ds-emet',      hebrew: 'אמת',   letters: ['א','מ','ת'],           transliteration: 'emet',      english: 'truth',      difficulty: 3, tags: ['abstract','common'] },
  { id: 'ds-chesed',    hebrew: 'חסד',   letters: ['ח','ס','ד'],           transliteration: 'chesed',    english: 'kindness',   difficulty: 3, tags: ['abstract'] },

  /* ═══════════════════════════════════════════════════════════
     Difficulty 4 — 4-5 letter words, intermediate
     ═══════════════════════════════════════════════════════════ */

  { id: 'ds-mishpacha', hebrew: 'משפחה', letters: ['מ','ש','פ','ח','ה'],   transliteration: 'mishpacha', english: 'family',      difficulty: 4, tags: ['person','abstract'] },
  { id: 'ds-choshech',  hebrew: 'חושך',  letters: ['ח','ו','ש','ך'],       transliteration: 'choshech',  english: 'darkness',    difficulty: 4, tags: ['nature','abstract'] },
  { id: 'ds-chochmah',  hebrew: 'חכמה',  letters: ['ח','כ','מ','ה'],       transliteration: 'chochmah',  english: 'wisdom',      difficulty: 4, tags: ['abstract'], root: 'חכם' },
  { id: 'ds-bereshit',  hebrew: 'בראשית', letters: ['ב','ר','א','ש','י','ת'], transliteration: 'bereshit', english: 'beginning',  difficulty: 4, tags: ['abstract','literary'] },
  { id: 'ds-malchut',   hebrew: 'מלכות', letters: ['מ','ל','כ','ו','ת'],   transliteration: 'malchut',  english: 'kingdom',     difficulty: 4, tags: ['place','abstract'], root: 'מלך' },
  { id: 'ds-talmid',    hebrew: 'תלמיד', letters: ['ת','ל','מ','י','ד'],   transliteration: 'talmid',   english: 'student',     difficulty: 4, tags: ['person','concrete'], root: 'למד' },
  { id: 'ds-moreh',     hebrew: 'מורה',  letters: ['מ','ו','ר','ה'],       transliteration: 'moreh',    english: 'teacher',     difficulty: 4, tags: ['person','concrete'] },
  { id: 'ds-shofet',    hebrew: 'שופט',  letters: ['ש','ו','פ','ט'],       transliteration: 'shofet',   english: 'judge',       difficulty: 4, tags: ['person','concrete'], root: 'שפט' },
  { id: 'ds-kohen',     hebrew: 'כוהן',  letters: ['כ','ו','ה','ן'],       transliteration: 'kohen',    english: 'priest',      difficulty: 4, tags: ['person','concrete'] },
  { id: 'ds-navi',      hebrew: 'נביא',  letters: ['נ','ב','י','א'],       transliteration: 'navi',     english: 'prophet',     difficulty: 4, tags: ['person','concrete'] },
  { id: 'ds-gevurah',   hebrew: 'גבורה', letters: ['ג','ב','ו','ר','ה'],   transliteration: 'gevurah',  english: 'heroism',     difficulty: 4, tags: ['abstract'] },
  { id: 'ds-tzedek',    hebrew: 'צדק',   letters: ['צ','ד','ק'],           transliteration: 'tzedek',   english: 'justice',     difficulty: 4, tags: ['abstract'], root: 'צדק' },
  { id: 'ds-shalom2',   hebrew: 'שלמה',  letters: ['ש','ל','מ','ה'],       transliteration: 'shlomoh',  english: 'Solomon',     difficulty: 4, tags: ['person','proper'], root: 'שלם' },
  { id: 'ds-mikdash',   hebrew: 'מקדש',  letters: ['מ','ק','ד','ש'],       transliteration: 'mikdash',  english: 'temple',      difficulty: 4, tags: ['place','concrete'], root: 'קדש' },
  { id: 'ds-menorah',   hebrew: 'מנורה', letters: ['מ','נ','ו','ר','ה'],   transliteration: 'menorah',  english: 'menorah',     difficulty: 4, tags: ['object','concrete'] },
  { id: 'ds-shirah',    hebrew: 'שירה',  letters: ['ש','י','ר','ה'],       transliteration: 'shirah',   english: 'poetry / song', difficulty: 4, tags: ['abstract','art'], root: 'שיר' },
  { id: 'ds-tefilah',   hebrew: 'תפילה', letters: ['ת','פ','י','ל','ה'],   transliteration: 'tefilah',  english: 'prayer',      difficulty: 4, tags: ['abstract'], root: 'פלל' },
  { id: 'ds-neshamah',  hebrew: 'נשמה',  letters: ['נ','ש','מ','ה'],       transliteration: 'neshamah', english: 'spirit / breath', difficulty: 4, tags: ['abstract'] },
  { id: 'ds-teshuvah',  hebrew: 'תשובה', letters: ['ת','ש','ו','ב','ה'],   transliteration: 'teshuvah', english: 'repentance / answer', difficulty: 4, tags: ['abstract'], root: 'שוב' },
  { id: 'ds-simchah',   hebrew: 'שמחה',  letters: ['ש','מ','ח','ה'],       transliteration: 'simchah',  english: 'joy',         difficulty: 4, tags: ['abstract','common'] },
  { id: 'ds-chalon',    hebrew: 'חלון',  letters: ['ח','ל','ו','ן'],       transliteration: 'chalon',   english: 'window',      difficulty: 4, tags: ['object','concrete'] },
  { id: 'ds-mitbach',   hebrew: 'מטבח',  letters: ['מ','ט','ב','ח'],       transliteration: 'mitbach',  english: 'kitchen',     difficulty: 4, tags: ['place','concrete'] },
  { id: 'ds-omanut',   hebrew: 'אמנות', letters: ['א','מ','נ','ו','ת'],   transliteration: 'omanut',   english: 'art',         difficulty: 4, tags: ['abstract','culture'] },
  { id: 'ds-chofesh',  hebrew: 'חופש',  letters: ['ח','ו','פ','ש'],       transliteration: 'chofesh',  english: 'freedom / vacation', difficulty: 4, tags: ['abstract','common'] },
  { id: 'ds-regel',    hebrew: 'רגל',   letters: ['ר','ג','ל'],           transliteration: 'regel',    english: 'foot / leg',  difficulty: 3, tags: ['body','concrete'] },
  { id: 'ds-sheket',   hebrew: 'שקט',   letters: ['ש','ק','ט'],           transliteration: 'sheket',   english: 'quiet',       difficulty: 3, tags: ['abstract','common'] },
  { id: 'ds-kochav',   hebrew: 'כוכב',  letters: ['כ','ו','כ','ב'],       transliteration: 'kochav',   english: 'star',        difficulty: 3, tags: ['nature','concrete'] },

  /* ═══════════════════════════════════════════════════════════
     Difficulty 5 — Long/complex words, challenge tier
     ═══════════════════════════════════════════════════════════ */

  { id: 'ds-yerushalayim', hebrew: 'ירושלים', letters: ['י','ר','ו','ש','ל','י','ם'], transliteration: 'yerushalayim', english: 'Jerusalem', difficulty: 5, tags: ['place','proper'], isMiniboss: true },
  { id: 'ds-mashiach',     hebrew: 'משיח',    letters: ['מ','ש','י','ח'],             transliteration: 'mashiach',     english: 'messiah / anointed', difficulty: 5, tags: ['person','abstract'], isMiniboss: true },
  { id: 'ds-beresheet2',   hebrew: 'התחלה',   letters: ['ה','ת','ח','ל','ה'],         transliteration: 'hatchalah',    english: 'the beginning', difficulty: 5, tags: ['abstract','literary'], isMiniboss: true },
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
