/**
 * Sentence templates for Deep Script Sentence mode.
 *
 * Each template defines a sentence structure with explicit slots for:
 *   - pack words (the learned vocabulary — the player's main target)
 *   - connector words (glue/support words that form sentence structure)
 *
 * Templates are language-specific. For v1, only Hebrew is supported.
 *
 * A template's `slots` array defines the word order of the sentence.
 * Each slot is either:
 *   { type: 'pack', tag: '...' }       — filled by a pack word matching the tag
 *   { type: 'connector', wordIndex: N } — filled by connectorWords[N]
 *
 * The `translation` field shows the English meaning with {0}, {1}, etc.
 * placeholders for pack-word meanings.
 *
 * @typedef {Object} SentenceTemplate
 * @property {string}   id
 * @property {string}   languageId
 * @property {number}   difficulty — 1-3
 * @property {string}   translation — English with pack-word placeholders
 * @property {Array<{ type: 'pack' | 'connector', tag?: string, wordIndex?: number }>} slots
 * @property {string[]} connectorWords — the connector/support words for this template
 * @property {string[]} connectorTransliterations — transliterations of connectors (for display)
 * @property {string[]} packTags — tags that pack words should match (ordered by slot appearance)
 */

// ─── Hebrew connector word pool ────────────────────────────

/**
 * Small, controlled set of Hebrew connector/support words.
 * These are common glue words used in simple sentences.
 */
export const hebrewConnectors = [
  { word: 'אני', transliteration: 'ani', meaning: 'I' },
  { word: 'אתה', transliteration: 'atah', meaning: 'you (m)' },
  { word: 'את', transliteration: 'at', meaning: 'you (f)' },
  { word: 'הוא', transliteration: 'hu', meaning: 'he' },
  { word: 'היא', transliteration: 'hi', meaning: 'she' },
  { word: 'זה', transliteration: 'zeh', meaning: 'this' },
  { word: 'של', transliteration: 'shel', meaning: 'of' },
  { word: 'ב', transliteration: 'b-', meaning: 'in/at' },
  { word: 'ל', transliteration: 'l-', meaning: 'to/for' },
  { word: 'ה', transliteration: 'ha-', meaning: 'the' },
  { word: 'טוב', transliteration: 'tov', meaning: 'good' },
  { word: 'יש', transliteration: 'yesh', meaning: 'there is' },
  { word: 'לא', transliteration: 'lo', meaning: 'no/not' },
  { word: 'כן', transliteration: 'ken', meaning: 'yes' },
  { word: 'מה', transliteration: 'mah', meaning: 'what' },
  { word: 'עם', transliteration: 'im', meaning: 'with' },
  { word: 'רוצה', transliteration: 'rotzeh', meaning: 'want' },
  { word: 'אוהב', transliteration: 'ohev', meaning: 'love/like' },
  { word: 'הולך', transliteration: 'holech', meaning: 'go' },
  { word: 'בא', transliteration: 'ba', meaning: 'come' },
  { word: 'שלום', transliteration: 'shalom', meaning: 'hello/peace' },
  { word: 'בבקשה', transliteration: 'bevakasha', meaning: 'please' },
  { word: 'תודה', transliteration: 'todah', meaning: 'thank you' },
  { word: 'גדול', transliteration: 'gadol', meaning: 'big' },
  { word: 'קטן', transliteration: 'katan', meaning: 'small' },
  { word: 'יפה', transliteration: 'yafeh', meaning: 'beautiful' },
  { word: 'חדש', transliteration: 'chadash', meaning: 'new' },
  { word: 'הנה', transliteration: 'hineh', meaning: 'here is' },
];

// ─── Hebrew sentence templates ─────────────────────────────

/**
 * Simple, short sentence templates for v1.
 * Each template can work with various pack words that match the required tags.
 *
 * Pack tags used:
 *   'noun'     — any concrete or abstract noun
 *   'person'   — a person (family member, title, etc.)
 *   'place'    — a place/location
 *   'animal'   — an animal
 *   'food'     — a food item
 *   'object'   — a concrete object
 *   'adjective' — a descriptive word
 *   'body'     — a body part
 *   'nature'   — a nature word
 *
 * The system will match pack words by their tags array.
 */
export const hebrewSentenceTemplates = [
  // ─── 2-word templates (very simple) ────────────────────────

  {
    id: 'hst-this-is',
    languageId: 'hebrew',
    difficulty: 1,
    translation: 'This is {0}',
    slots: [
      { type: 'connector', wordIndex: 0 },
      { type: 'pack', tag: 'noun', packSlot: 0 },
    ],
    connectorWords: ['זה'],
    connectorTransliterations: ['zeh'],
    packTags: ['noun'],
  },
  {
    id: 'hst-there-is',
    languageId: 'hebrew',
    difficulty: 1,
    translation: 'There is {0}',
    slots: [
      { type: 'connector', wordIndex: 0 },
      { type: 'pack', tag: 'noun', packSlot: 0 },
    ],
    connectorWords: ['יש'],
    connectorTransliterations: ['yesh'],
    packTags: ['noun'],
  },
  {
    id: 'hst-no-noun',
    languageId: 'hebrew',
    difficulty: 1,
    translation: 'No {0}',
    slots: [
      { type: 'connector', wordIndex: 0 },
      { type: 'pack', tag: 'noun', packSlot: 0 },
    ],
    connectorWords: ['לא'],
    connectorTransliterations: ['lo'],
    packTags: ['noun'],
  },

  // ─── 3-word templates ──────────────────────────────────────

  {
    id: 'hst-i-want',
    languageId: 'hebrew',
    difficulty: 1,
    translation: 'I want {0}',
    slots: [
      { type: 'connector', wordIndex: 0 },
      { type: 'connector', wordIndex: 1 },
      { type: 'pack', tag: 'noun', packSlot: 0 },
    ],
    connectorWords: ['אני', 'רוצה'],
    connectorTransliterations: ['ani', 'rotzeh'],
    packTags: ['noun'],
  },
  {
    id: 'hst-i-love',
    languageId: 'hebrew',
    difficulty: 1,
    translation: 'I love {0}',
    slots: [
      { type: 'connector', wordIndex: 0 },
      { type: 'connector', wordIndex: 1 },
      { type: 'pack', tag: 'noun', packSlot: 0 },
    ],
    connectorWords: ['אני', 'אוהב'],
    connectorTransliterations: ['ani', 'ohev'],
    packTags: ['noun'],
  },
  {
    id: 'hst-this-is-adj',
    languageId: 'hebrew',
    difficulty: 1,
    translation: 'This is {0}',
    slots: [
      { type: 'connector', wordIndex: 0 },
      { type: 'pack', tag: 'adjective', packSlot: 0 },
    ],
    connectorWords: ['זה'],
    connectorTransliterations: ['zeh'],
    packTags: ['adjective'],
  },
  {
    id: 'hst-noun-is-good',
    languageId: 'hebrew',
    difficulty: 1,
    translation: 'The {0} is good',
    slots: [
      { type: 'pack', tag: 'noun', packSlot: 0 },
      { type: 'connector', wordIndex: 0 },
    ],
    connectorWords: ['טוב'],
    connectorTransliterations: ['tov'],
    packTags: ['noun'],
  },
  {
    id: 'hst-noun-is-beautiful',
    languageId: 'hebrew',
    difficulty: 2,
    translation: 'The {0} is beautiful',
    slots: [
      { type: 'pack', tag: 'noun', packSlot: 0 },
      { type: 'connector', wordIndex: 0 },
    ],
    connectorWords: ['יפה'],
    connectorTransliterations: ['yafeh'],
    packTags: ['noun'],
  },
  {
    id: 'hst-noun-is-big',
    languageId: 'hebrew',
    difficulty: 1,
    translation: 'The {0} is big',
    slots: [
      { type: 'pack', tag: 'noun', packSlot: 0 },
      { type: 'connector', wordIndex: 0 },
    ],
    connectorWords: ['גדול'],
    connectorTransliterations: ['gadol'],
    packTags: ['noun'],
  },
  {
    id: 'hst-noun-is-small',
    languageId: 'hebrew',
    difficulty: 1,
    translation: 'The {0} is small',
    slots: [
      { type: 'pack', tag: 'noun', packSlot: 0 },
      { type: 'connector', wordIndex: 0 },
    ],
    connectorWords: ['קטן'],
    connectorTransliterations: ['katan'],
    packTags: ['noun'],
  },
  {
    id: 'hst-noun-is-new',
    languageId: 'hebrew',
    difficulty: 2,
    translation: 'The {0} is new',
    slots: [
      { type: 'pack', tag: 'noun', packSlot: 0 },
      { type: 'connector', wordIndex: 0 },
    ],
    connectorWords: ['חדש'],
    connectorTransliterations: ['chadash'],
    packTags: ['noun'],
  },

  // ─── 3-word templates with two pack words ──────────────────

  {
    id: 'hst-noun-and-noun',
    languageId: 'hebrew',
    difficulty: 2,
    translation: '{0} and {1}',
    slots: [
      { type: 'pack', tag: 'noun', packSlot: 0 },
      { type: 'connector', wordIndex: 0 },
      { type: 'pack', tag: 'noun', packSlot: 1 },
    ],
    connectorWords: ['ו'],
    connectorTransliterations: ['ve-'],
    packTags: ['noun', 'noun'],
  },

  // ─── 4-word templates ──────────────────────────────────────

  {
    id: 'hst-i-want-noun-please',
    languageId: 'hebrew',
    difficulty: 2,
    translation: 'I want {0} please',
    slots: [
      { type: 'connector', wordIndex: 0 },
      { type: 'connector', wordIndex: 1 },
      { type: 'pack', tag: 'noun', packSlot: 0 },
      { type: 'connector', wordIndex: 2 },
    ],
    connectorWords: ['אני', 'רוצה', 'בבקשה'],
    connectorTransliterations: ['ani', 'rotzeh', 'bevakasha'],
    packTags: ['noun'],
  },
  {
    id: 'hst-here-is-noun',
    languageId: 'hebrew',
    difficulty: 2,
    translation: 'Here is the {0}',
    slots: [
      { type: 'connector', wordIndex: 0 },
      { type: 'connector', wordIndex: 1 },
      { type: 'pack', tag: 'noun', packSlot: 0 },
    ],
    connectorWords: ['הנה', 'ה'],
    connectorTransliterations: ['hineh', 'ha-'],
    packTags: ['noun'],
  },
  {
    id: 'hst-he-goes-to-place',
    languageId: 'hebrew',
    difficulty: 2,
    translation: 'He goes to the {0}',
    slots: [
      { type: 'connector', wordIndex: 0 },
      { type: 'connector', wordIndex: 1 },
      { type: 'connector', wordIndex: 2 },
      { type: 'pack', tag: 'noun', packSlot: 0 },
    ],
    connectorWords: ['הוא', 'הולך', 'ל'],
    connectorTransliterations: ['hu', 'holech', 'l-'],
    packTags: ['noun'],
  },
  {
    id: 'hst-what-is-this',
    languageId: 'hebrew',
    difficulty: 2,
    translation: 'What is this {0}?',
    slots: [
      { type: 'connector', wordIndex: 0 },
      { type: 'connector', wordIndex: 1 },
      { type: 'pack', tag: 'noun', packSlot: 0 },
    ],
    connectorWords: ['מה', 'זה'],
    connectorTransliterations: ['mah', 'zeh'],
    packTags: ['noun'],
  },
  {
    id: 'hst-i-love-noun-adj',
    languageId: 'hebrew',
    difficulty: 3,
    translation: 'I love the {0} {1}',
    slots: [
      { type: 'connector', wordIndex: 0 },
      { type: 'connector', wordIndex: 1 },
      { type: 'pack', tag: 'noun', packSlot: 0 },
      { type: 'pack', tag: 'adjective', packSlot: 1 },
    ],
    connectorWords: ['אני', 'אוהב'],
    connectorTransliterations: ['ani', 'ohev'],
    packTags: ['noun', 'adjective'],
  },
];

// ─── Template selection ────────────────────────────────────

/**
 * Get templates compatible with a given set of pack word tags.
 *
 * @param {Set<string>} availableTags — tags present in the pack word pool
 * @param {string} languageId
 * @returns {Array<Object>} — matching templates
 */
export function getCompatibleTemplates(availableTags, languageId = 'hebrew') {
  const templates = languageId === 'hebrew' ? hebrewSentenceTemplates : [];
  return templates.filter(template =>
    template.packTags.every(tag => availableTags.has(tag))
  );
}

/**
 * Get all unique connector words used across all templates for a language.
 *
 * @param {string} languageId
 * @returns {string[]} — unique connector word strings
 */
export function getAllConnectorWords(languageId = 'hebrew') {
  const connectors = languageId === 'hebrew' ? hebrewConnectors : [];
  return connectors.map(c => c.word);
}

/**
 * Look up a connector word's metadata.
 *
 * @param {string} word — the connector word string
 * @param {string} languageId
 * @returns {{ word: string, transliteration: string, meaning: string } | null}
 */
export function getConnectorInfo(word, languageId = 'hebrew') {
  const connectors = languageId === 'hebrew' ? hebrewConnectors : [];
  return connectors.find(c => c.word === word) || null;
}
