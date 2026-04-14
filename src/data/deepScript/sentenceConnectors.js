/**
 * Centralized connector-word dataset for Deep Script Sentence mode.
 *
 * A "connector" is a glue/support word used to build sentences around the
 * learned vocabulary (pack words). They carry most of Hebrew's grammatical
 * skeleton — articles, prepositions, conjunctions, common verbs, pronouns.
 *
 * This file is the single source of truth. Both the distractor pool in the
 * sentence generator AND the in-game teaching UI (tap-to-peek, post-victory
 * breakdown) read from the same entries, so transliterations and meanings
 * stay in sync with gameplay.
 *
 * Shape:
 *   - word:            native-script form shown in the tray and slots
 *   - transliteration: romanized pronunciation
 *   - meaning:         short English gloss shown in hints
 *   - role:            grammatical role (for future grouping / curriculum)
 */

/** @typedef {'article'|'preposition'|'conjunction'|'pronoun'|'possessive'|'verb'|'adjective'|'adverb'|'particle'|'demonstrative'} ConnectorRole */

/**
 * @typedef {Object} SentenceConnector
 * @property {string} word
 * @property {string} transliteration
 * @property {string} meaning
 * @property {ConnectorRole} role
 */

/** @type {SentenceConnector[]} */
export const hebrewSentenceConnectors = [
  // Articles & prepositions — the grammatical skeleton
  { word: 'ה',    transliteration: 'ha-',    meaning: 'the',        role: 'article' },
  { word: 'ב',    transliteration: 'be-',    meaning: 'in',         role: 'preposition' },
  { word: 'ל',    transliteration: 'le-',    meaning: 'to',         role: 'preposition' },
  { word: 'מ',    transliteration: 'mi-',    meaning: 'from',       role: 'preposition' },
  { word: 'של',   transliteration: 'shel',   meaning: 'of',         role: 'preposition' },
  { word: 'עם',   transliteration: 'im',     meaning: 'with',       role: 'preposition' },

  // Conjunctions
  { word: 'ו',    transliteration: 've-',    meaning: 'and',        role: 'conjunction' },
  { word: 'או',   transliteration: 'o',      meaning: 'or',         role: 'conjunction' },

  // Pronouns used as sentence glue
  { word: 'אני',  transliteration: 'ani',    meaning: 'I',          role: 'pronoun' },
  { word: 'אתה',  transliteration: 'atah',   meaning: 'you (m)',    role: 'pronoun' },
  { word: 'את',   transliteration: 'at',     meaning: 'you (f)',    role: 'pronoun' },
  { word: 'הוא',  transliteration: 'hu',     meaning: 'he',         role: 'pronoun' },
  { word: 'היא',  transliteration: 'hi',     meaning: 'she',        role: 'pronoun' },

  // Possessives
  { word: 'שלי',  transliteration: 'sheli',  meaning: 'my',         role: 'possessive' },

  // Common verbs used to scaffold sentences
  { word: 'רוצה',  transliteration: 'rotzeh',  meaning: 'want',       role: 'verb' },
  { word: 'אוהב',  transliteration: 'ohev',    meaning: 'love',       role: 'verb' },
  { word: 'גר',    transliteration: 'gar',     meaning: 'lives',      role: 'verb' },
  { word: 'אוכל',  transliteration: 'ochel',   meaning: 'eats',       role: 'verb' },
  { word: 'אוכלת', transliteration: 'ochelet', meaning: 'eats (f)',   role: 'verb' },
  { word: 'שותה',  transliteration: 'shoteh',  meaning: 'drinks',     role: 'verb' },
  { word: 'לעזור', transliteration: 'la`azor', meaning: 'to help',    role: 'verb' },

  // Adjectives / adverbs that function as connectors in short sentences
  { word: 'טוב',   transliteration: 'tov',    meaning: 'good',        role: 'adjective' },
  { word: 'גדול',  transliteration: 'gadol',  meaning: 'big',         role: 'adjective' },
  { word: 'יפה',   transliteration: 'yafe',   meaning: 'beautiful',   role: 'adjective' },
  { word: 'מאוד',  transliteration: 'meod',   meaning: 'very',        role: 'adverb' },
  { word: 'רבה',   transliteration: 'rabah',  meaning: 'much (f)',    role: 'adverb' },

  // Particles & small function words
  { word: 'יש',    transliteration: 'yesh',    meaning: 'there is',  role: 'particle' },
  { word: 'לא',    transliteration: 'lo',      meaning: 'no / not',  role: 'particle' },
  { word: 'כן',    transliteration: 'ken',     meaning: 'yes',       role: 'particle' },
  { word: 'הנה',   transliteration: 'hineh',   meaning: 'here is',   role: 'particle' },
  { word: 'פה',    transliteration: 'poh',     meaning: 'here',      role: 'particle' },
  { word: 'היום',  transliteration: 'hayom',   meaning: 'today',     role: 'particle' },
  { word: 'בבקשה', transliteration: 'bevakasha', meaning: 'please',  role: 'particle' },

  // Demonstratives
  { word: 'זה',    transliteration: 'zeh',     meaning: 'this',      role: 'demonstrative' },

  // Pack-overlap safety: a handful of tokens that appear as connectors inside
  // specific sentences even though they're also pack words elsewhere. Keeping
  // them here lets the teaching UI always resolve a meaning for every slot.
  { word: 'בית',   transliteration: 'bayit',   meaning: 'house',     role: 'particle' },
];

/**
 * Index by native-script word for O(1) lookup from the UI layer.
 * @type {Map<string, SentenceConnector>}
 */
const hebrewConnectorIndex = new Map(
  hebrewSentenceConnectors.map(c => [c.word, c])
);

/**
 * Look up connector metadata for a single word.
 * Returns undefined if the word isn't a known connector.
 *
 * @param {string} word
 * @param {string} [_languageId] — reserved for future multi-language support
 * @returns {SentenceConnector | undefined}
 */
export function getConnectorInfo(word, _languageId = 'hebrew') {
  if (!word) return undefined;
  return hebrewConnectorIndex.get(word);
}

/**
 * Get the full connector list for a language.
 * @param {string} [_languageId]
 * @returns {SentenceConnector[]}
 */
export function getSentenceConnectors(_languageId = 'hebrew') {
  return hebrewSentenceConnectors;
}

/**
 * Dev-time audit: returns any connector word used inline in sentence data
 * that is missing from this registry. The generator calls this at module
 * init so new sentences can't silently drift away from the teaching UI.
 *
 * @param {Array<{words: Array<{word:string, source:string}>}>} sentences
 * @returns {string[]} list of unknown connector words
 */
export function findUnknownConnectors(sentences) {
  const unknown = new Set();
  for (const s of sentences) {
    for (const w of s.words || []) {
      if (w.source === 'connector' && !hebrewConnectorIndex.has(w.word)) {
        unknown.add(w.word);
      }
    }
  }
  return Array.from(unknown);
}
