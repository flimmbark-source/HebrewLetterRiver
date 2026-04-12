/**
 * Curated sentence data for Deep Script Sentence mode.
 *
 * Each sentence bank is keyed by pack IDs it draws from.
 * Sentences are fully authored — no random word substitution.
 *
 * Each sentence entry:
 *   - id:          unique identifier
 *   - translation: English meaning (shown as the prompt — no transliteration)
 *   - words:       ordered array of word blocks the player must assemble
 *     - word:   the Hebrew text for this block
 *     - source: 'pack' (learned vocabulary) or 'connector' (glue word)
 *   - packIds:     which pack(s) this sentence draws from
 *
 * Connector words are the small set of support/glue words for each sentence.
 * They are defined inline per sentence, not in a global pool.
 *
 * For the two-button system, the generator extracts:
 *   - packWordPool:      all pack words across the expedition's sentences
 *   - connectorWordPool: all connector words across the expedition's sentences
 */

// ─── Hebrew connector word reference ───────────────────────
// (kept for the two-button generation system's distractor pool)

export const hebrewConnectors = [
  { word: 'אני', transliteration: 'ani', meaning: 'I' },
  { word: 'אתה', transliteration: 'atah', meaning: 'you (m)' },
  { word: 'את', transliteration: 'at', meaning: 'you (f)' },
  { word: 'הוא', transliteration: 'hu', meaning: 'he' },
  { word: 'היא', transliteration: 'hi', meaning: 'she' },
  { word: 'זה', transliteration: 'zeh', meaning: 'this' },
  { word: 'של', transliteration: 'shel', meaning: 'of' },
  { word: 'ה', transliteration: 'ha-', meaning: 'the' },
  { word: 'טוב', transliteration: 'tov', meaning: 'good' },
  { word: 'יש', transliteration: 'yesh', meaning: 'there is' },
  { word: 'לא', transliteration: 'lo', meaning: 'no/not' },
  { word: 'כן', transliteration: 'ken', meaning: 'yes' },
  { word: 'עם', transliteration: 'im', meaning: 'with' },
  { word: 'רוצה', transliteration: 'rotzeh', meaning: 'want' },
  { word: 'אוהב', transliteration: 'ohev', meaning: 'love' },
  { word: 'הנה', transliteration: 'hineh', meaning: 'here is' },
  { word: 'ו', transliteration: 've-', meaning: 'and' },
  { word: 'גר', transliteration: 'gar', meaning: 'lives' },
  { word: 'ב', transliteration: 'b-', meaning: 'in' },
  { word: 'אוכל', transliteration: 'ochel', meaning: 'eats' },
  { word: 'שותה', transliteration: 'shoteh', meaning: 'drinks' },
  { word: 'מאוד', transliteration: 'meod', meaning: 'very' },
  { word: 'שלי', transliteration: 'sheli', meaning: 'my' },
];

// ─── Curated sentence banks by pack ────────────────────────

/**
 * Sentences for the Greetings pack (greetings_01).
 * Words: שלום (shalom), תודה (todah), בבקשה (bevakasha)
 * Note: בוקר טוב and לילה טוב are multi-word and filtered by convertBBWordsForDS,
 * so we use them as connector phrases where needed.
 */
const greetingsSentences = [
  {
    id: 'gs-1',
    translation: 'Hello, thank you',
    words: [
      { word: 'שלום', source: 'pack' },
      { word: 'תודה', source: 'pack' },
    ],
    packIds: ['greetings_01'],
  },
  {
    id: 'gs-2',
    translation: 'Thank you very much',
    words: [
      { word: 'תודה', source: 'pack' },
      { word: 'רבה', source: 'connector' },
    ],
    packIds: ['greetings_01'],
  },
  {
    id: 'gs-3',
    translation: 'Hello and thank you',
    words: [
      { word: 'שלום', source: 'pack' },
      { word: 'ו', source: 'connector' },
      { word: 'תודה', source: 'pack' },
    ],
    packIds: ['greetings_01'],
  },
  {
    id: 'gs-4',
    translation: 'Please and thank you',
    words: [
      { word: 'בבקשה', source: 'pack' },
      { word: 'ו', source: 'connector' },
      { word: 'תודה', source: 'pack' },
    ],
    packIds: ['greetings_01'],
  },
  {
    id: 'gs-5',
    translation: 'Hello, yes please',
    words: [
      { word: 'שלום', source: 'pack' },
      { word: 'כן', source: 'connector' },
      { word: 'בבקשה', source: 'pack' },
    ],
    packIds: ['greetings_01'],
  },
];

/**
 * Sentences for Family pack (family_01).
 * Words: אמא (ima), אבא (abba), משפחה (mishpacha), בית (bayit)
 */
const familySentences = [
  {
    id: 'fm-1',
    translation: 'Mom and dad',
    words: [
      { word: 'אמא', source: 'pack' },
      { word: 'ו', source: 'connector' },
      { word: 'אבא', source: 'pack' },
    ],
    packIds: ['family_01'],
  },
  {
    id: 'fm-2',
    translation: 'Mom is at home',
    words: [
      { word: 'אמא', source: 'pack' },
      { word: 'ב', source: 'connector' },
      { word: 'בית', source: 'pack' },
    ],
    packIds: ['family_01'],
  },
  {
    id: 'fm-3',
    translation: 'The family is at home',
    words: [
      { word: 'ה', source: 'connector' },
      { word: 'משפחה', source: 'pack' },
      { word: 'ב', source: 'connector' },
      { word: 'בית', source: 'pack' },
    ],
    packIds: ['family_01'],
  },
  {
    id: 'fm-4',
    translation: 'Dad and mom at home',
    words: [
      { word: 'אבא', source: 'pack' },
      { word: 'ו', source: 'connector' },
      { word: 'אמא', source: 'pack' },
      { word: 'ב', source: 'connector' },
      { word: 'בית', source: 'pack' },
    ],
    packIds: ['family_01'],
  },
  {
    id: 'fm-5',
    translation: 'This is my family',
    words: [
      { word: 'זה', source: 'connector' },
      { word: 'ה', source: 'connector' },
      { word: 'משפחה', source: 'pack' },
      { word: 'שלי', source: 'connector' },
    ],
    packIds: ['family_01'],
  },
];

/**
 * Sentences for Food & Drink pack (food_01).
 * Words: לחם (lechem), מים (mayim), קפה (kafe), תפוח (tapuach)
 */
const foodSentences = [
  {
    id: 'fd-1',
    translation: 'Bread and water',
    words: [
      { word: 'לחם', source: 'pack' },
      { word: 'ו', source: 'connector' },
      { word: 'מים', source: 'pack' },
    ],
    packIds: ['food_01'],
  },
  {
    id: 'fd-2',
    translation: 'I want coffee',
    words: [
      { word: 'אני', source: 'connector' },
      { word: 'רוצה', source: 'connector' },
      { word: 'קפה', source: 'pack' },
    ],
    packIds: ['food_01'],
  },
  {
    id: 'fd-3',
    translation: 'I want bread please',
    words: [
      { word: 'אני', source: 'connector' },
      { word: 'רוצה', source: 'connector' },
      { word: 'לחם', source: 'pack' },
      { word: 'בבקשה', source: 'connector' },
    ],
    packIds: ['food_01'],
  },
  {
    id: 'fd-4',
    translation: 'Water and coffee',
    words: [
      { word: 'מים', source: 'pack' },
      { word: 'ו', source: 'connector' },
      { word: 'קפה', source: 'pack' },
    ],
    packIds: ['food_01'],
  },
  {
    id: 'fd-5',
    translation: 'The apple is good',
    words: [
      { word: 'ה', source: 'connector' },
      { word: 'תפוח', source: 'pack' },
      { word: 'טוב', source: 'connector' },
    ],
    packIds: ['food_01'],
  },
  {
    id: 'fd-6',
    translation: 'I drink water',
    words: [
      { word: 'אני', source: 'connector' },
      { word: 'שותה', source: 'connector' },
      { word: 'מים', source: 'pack' },
    ],
    packIds: ['food_01'],
  },
];

/**
 * Sentences for Adjectives pack (adjectives_01).
 * Words: טוב (tov), גדול (gadol), קטן (katan), יפה (yafe)
 */
const adjectivesSentences = [
  {
    id: 'adj-1',
    translation: 'Big and small',
    words: [
      { word: 'גדול', source: 'pack' },
      { word: 'ו', source: 'connector' },
      { word: 'קטן', source: 'pack' },
    ],
    packIds: ['adjectives_01'],
  },
  {
    id: 'adj-2',
    translation: 'This is good',
    words: [
      { word: 'זה', source: 'connector' },
      { word: 'טוב', source: 'pack' },
    ],
    packIds: ['adjectives_01'],
  },
  {
    id: 'adj-3',
    translation: 'This is beautiful',
    words: [
      { word: 'זה', source: 'connector' },
      { word: 'יפה', source: 'pack' },
    ],
    packIds: ['adjectives_01'],
  },
  {
    id: 'adj-4',
    translation: 'Very good and beautiful',
    words: [
      { word: 'מאוד', source: 'connector' },
      { word: 'טוב', source: 'pack' },
      { word: 'ו', source: 'connector' },
      { word: 'יפה', source: 'pack' },
    ],
    packIds: ['adjectives_01'],
  },
  {
    id: 'adj-5',
    translation: 'Big and beautiful',
    words: [
      { word: 'גדול', source: 'pack' },
      { word: 'ו', source: 'connector' },
      { word: 'יפה', source: 'pack' },
    ],
    packIds: ['adjectives_01'],
  },
];

/**
 * Sentences for Pronouns pack (pronouns_01).
 * Words: אני (ani), אתה (atah), את (at)
 */
const pronounsSentences = [
  {
    id: 'pr-1',
    translation: 'I and you',
    words: [
      { word: 'אני', source: 'pack' },
      { word: 'ו', source: 'connector' },
      { word: 'אתה', source: 'pack' },
    ],
    packIds: ['pronouns_01'],
  },
  {
    id: 'pr-2',
    translation: 'You are here',
    words: [
      { word: 'אתה', source: 'pack' },
      { word: 'פה', source: 'connector' },
    ],
    packIds: ['pronouns_01'],
  },
  {
    id: 'pr-3',
    translation: 'I am here',
    words: [
      { word: 'אני', source: 'pack' },
      { word: 'פה', source: 'connector' },
    ],
    packIds: ['pronouns_01'],
  },
  {
    id: 'pr-4',
    translation: 'You (f) and I',
    words: [
      { word: 'את', source: 'pack' },
      { word: 'ו', source: 'connector' },
      { word: 'אני', source: 'pack' },
    ],
    packIds: ['pronouns_01'],
  },
];

/**
 * Sentences for Pronouns 2 pack (pronouns_02).
 * Words: אני (ani), אתה (ata), הוא (hu), היא (hi), אנחנו (anachnu), הם (hem)
 */
const pronouns2Sentences = [
  {
    id: 'pr2-1',
    translation: 'He and she',
    words: [
      { word: 'הוא', source: 'pack' },
      { word: 'ו', source: 'connector' },
      { word: 'היא', source: 'pack' },
    ],
    packIds: ['pronouns_02'],
  },
  {
    id: 'pr2-2',
    translation: 'We are here',
    words: [
      { word: 'אנחנו', source: 'pack' },
      { word: 'פה', source: 'connector' },
    ],
    packIds: ['pronouns_02'],
  },
  {
    id: 'pr2-3',
    translation: 'They are here',
    words: [
      { word: 'הם', source: 'pack' },
      { word: 'פה', source: 'connector' },
    ],
    packIds: ['pronouns_02'],
  },
  {
    id: 'pr2-4',
    translation: 'He is here and she is here',
    words: [
      { word: 'הוא', source: 'pack' },
      { word: 'פה', source: 'connector' },
      { word: 'ו', source: 'connector' },
      { word: 'היא', source: 'pack' },
      { word: 'פה', source: 'connector' },
    ],
    packIds: ['pronouns_02'],
  },
];

/**
 * Sentences for Family 2 pack (family_02).
 * Words: חבר (chaver), משפחה (mishpacha), ילד (yeled), הורה (horeh), שכן (shachen), זר (zar)
 */
const family2Sentences = [
  {
    id: 'fm2-1',
    translation: 'The friend is here',
    words: [
      { word: 'ה', source: 'connector' },
      { word: 'חבר', source: 'pack' },
      { word: 'פה', source: 'connector' },
    ],
    packIds: ['family_02'],
  },
  {
    id: 'fm2-2',
    translation: 'The child and the neighbor',
    words: [
      { word: 'ה', source: 'connector' },
      { word: 'ילד', source: 'pack' },
      { word: 'ו', source: 'connector' },
      { word: 'ה', source: 'connector' },
      { word: 'שכן', source: 'pack' },
    ],
    packIds: ['family_02'],
  },
  {
    id: 'fm2-3',
    translation: 'A friend and family',
    words: [
      { word: 'חבר', source: 'pack' },
      { word: 'ו', source: 'connector' },
      { word: 'משפחה', source: 'pack' },
    ],
    packIds: ['family_02'],
  },
  {
    id: 'fm2-4',
    translation: 'This is a stranger',
    words: [
      { word: 'זה', source: 'connector' },
      { word: 'זר', source: 'pack' },
    ],
    packIds: ['family_02'],
  },
];

/**
 * Sentences for Food & Drink 2 pack (food_02).
 * Words: אוכל (ochel), מים (mayim), קפה (kafe)
 */
const food2Sentences = [
  {
    id: 'fd2-1',
    translation: 'I want food',
    words: [
      { word: 'אני', source: 'connector' },
      { word: 'רוצה', source: 'connector' },
      { word: 'אוכל', source: 'pack' },
    ],
    packIds: ['food_02'],
  },
  {
    id: 'fd2-2',
    translation: 'Food and water',
    words: [
      { word: 'אוכל', source: 'pack' },
      { word: 'ו', source: 'connector' },
      { word: 'מים', source: 'pack' },
    ],
    packIds: ['food_02'],
  },
  {
    id: 'fd2-3',
    translation: 'The coffee is good',
    words: [
      { word: 'ה', source: 'connector' },
      { word: 'קפה', source: 'pack' },
      { word: 'טוב', source: 'connector' },
    ],
    packIds: ['food_02'],
  },
  {
    id: 'fd2-4',
    translation: 'I drink coffee',
    words: [
      { word: 'אני', source: 'connector' },
      { word: 'שותה', source: 'connector' },
      { word: 'קפה', source: 'pack' },
    ],
    packIds: ['food_02'],
  },
];

/**
 * Sentences for At Home pack (at_home_01).
 * Words: מטבח (mitbach), חדר (cheder), מיטה (mitah), חלון (chalon)
 */
const atHomeSentences = [
  {
    id: 'ah-1',
    translation: 'I am in the kitchen',
    words: [
      { word: 'אני', source: 'connector' },
      { word: 'ב', source: 'connector' },
      { word: 'מטבח', source: 'pack' },
    ],
    packIds: ['at_home_01'],
  },
  {
    id: 'ah-2',
    translation: 'The room is big',
    words: [
      { word: 'ה', source: 'connector' },
      { word: 'חדר', source: 'pack' },
      { word: 'גדול', source: 'connector' },
    ],
    packIds: ['at_home_01'],
  },
  {
    id: 'ah-3',
    translation: 'The bed is in the room',
    words: [
      { word: 'ה', source: 'connector' },
      { word: 'מיטה', source: 'pack' },
      { word: 'ב', source: 'connector' },
      { word: 'חדר', source: 'pack' },
    ],
    packIds: ['at_home_01'],
  },
  {
    id: 'ah-4',
    translation: 'There is a window',
    words: [
      { word: 'יש', source: 'connector' },
      { word: 'חלון', source: 'pack' },
    ],
    packIds: ['at_home_01'],
  },
  {
    id: 'ah-5',
    translation: 'The kitchen and the room',
    words: [
      { word: 'ה', source: 'connector' },
      { word: 'מטבח', source: 'pack' },
      { word: 'ו', source: 'connector' },
      { word: 'ה', source: 'connector' },
      { word: 'חדר', source: 'pack' },
    ],
    packIds: ['at_home_01'],
  },
];

/**
 * Sentences for Weather pack (weather_01).
 * Words: שמש (shemesh), גשם (geshem), חם (cham), קר (kar)
 */
const weatherSentences = [
  {
    id: 'wt-1',
    translation: 'It is hot today',
    words: [
      { word: 'חם', source: 'pack' },
      { word: 'היום', source: 'connector' },
    ],
    packIds: ['weather_01'],
  },
  {
    id: 'wt-2',
    translation: 'There is sun',
    words: [
      { word: 'יש', source: 'connector' },
      { word: 'שמש', source: 'pack' },
    ],
    packIds: ['weather_01'],
  },
  {
    id: 'wt-3',
    translation: 'There is rain and it is cold',
    words: [
      { word: 'יש', source: 'connector' },
      { word: 'גשם', source: 'pack' },
      { word: 'ו', source: 'connector' },
      { word: 'קר', source: 'pack' },
    ],
    packIds: ['weather_01'],
  },
  {
    id: 'wt-4',
    translation: 'Hot and cold',
    words: [
      { word: 'חם', source: 'pack' },
      { word: 'ו', source: 'connector' },
      { word: 'קר', source: 'pack' },
    ],
    packIds: ['weather_01'],
  },
  {
    id: 'wt-5',
    translation: 'Sun and rain',
    words: [
      { word: 'שמש', source: 'pack' },
      { word: 'ו', source: 'connector' },
      { word: 'גשם', source: 'pack' },
    ],
    packIds: ['weather_01'],
  },
];

/**
 * Sentences for Feelings pack (feelings_01).
 * Words: שמח (sameach), עצוב (atzuv), עייף (ayef), כועס (koes)
 */
const feelingsSentences = [
  {
    id: 'fl-1',
    translation: 'I am happy',
    words: [
      { word: 'אני', source: 'connector' },
      { word: 'שמח', source: 'pack' },
    ],
    packIds: ['feelings_01'],
  },
  {
    id: 'fl-2',
    translation: 'He is sad',
    words: [
      { word: 'הוא', source: 'connector' },
      { word: 'עצוב', source: 'pack' },
    ],
    packIds: ['feelings_01'],
  },
  {
    id: 'fl-3',
    translation: 'I am tired and sad',
    words: [
      { word: 'אני', source: 'connector' },
      { word: 'עייף', source: 'pack' },
      { word: 'ו', source: 'connector' },
      { word: 'עצוב', source: 'pack' },
    ],
    packIds: ['feelings_01'],
  },
  {
    id: 'fl-4',
    translation: 'She is angry',
    words: [
      { word: 'היא', source: 'connector' },
      { word: 'כועסת', source: 'pack' },
    ],
    packIds: ['feelings_01'],
  },
  {
    id: 'fl-5',
    translation: 'Not sad, happy',
    words: [
      { word: 'לא', source: 'connector' },
      { word: 'עצוב', source: 'pack' },
      { word: 'שמח', source: 'pack' },
    ],
    packIds: ['feelings_01'],
  },
];

/**
 * Sentences for Questions pack (questions_01).
 * Words: מה (mah), מי (mi), איפה (eifo), מתי (matai)
 */
const questionsSentences = [
  {
    id: 'qs-1',
    translation: 'What is this?',
    words: [
      { word: 'מה', source: 'pack' },
      { word: 'זה', source: 'connector' },
    ],
    packIds: ['questions_01'],
  },
  {
    id: 'qs-2',
    translation: 'Who is here?',
    words: [
      { word: 'מי', source: 'pack' },
      { word: 'פה', source: 'connector' },
    ],
    packIds: ['questions_01'],
  },
  {
    id: 'qs-3',
    translation: 'Where is the house?',
    words: [
      { word: 'איפה', source: 'pack' },
      { word: 'ה', source: 'connector' },
      { word: 'בית', source: 'connector' },
    ],
    packIds: ['questions_01'],
  },
  {
    id: 'qs-4',
    translation: 'When?',
    words: [
      { word: 'מתי', source: 'pack' },
    ],
    packIds: ['questions_01'],
  },
  {
    id: 'qs-5',
    translation: 'What and where?',
    words: [
      { word: 'מה', source: 'pack' },
      { word: 'ו', source: 'connector' },
      { word: 'איפה', source: 'pack' },
    ],
    packIds: ['questions_01'],
  },
];

/**
 * Sentences for Conversation Basics pack (conversation_01).
 * Words: כן (ken), לא (lo), אולי (ulai), בטח (betach)
 */
const conversationSentences = [
  {
    id: 'cv-1',
    translation: 'Yes or no',
    words: [
      { word: 'כן', source: 'pack' },
      { word: 'או', source: 'connector' },
      { word: 'לא', source: 'pack' },
    ],
    packIds: ['conversation_01'],
  },
  {
    id: 'cv-2',
    translation: 'Maybe yes',
    words: [
      { word: 'אולי', source: 'pack' },
      { word: 'כן', source: 'pack' },
    ],
    packIds: ['conversation_01'],
  },
  {
    id: 'cv-3',
    translation: 'Of course yes',
    words: [
      { word: 'בטח', source: 'pack' },
      { word: 'כן', source: 'pack' },
    ],
    packIds: ['conversation_01'],
  },
  {
    id: 'cv-4',
    translation: 'Maybe not',
    words: [
      { word: 'אולי', source: 'pack' },
      { word: 'לא', source: 'pack' },
    ],
    packIds: ['conversation_01'],
  },
];

/**
 * Sentences for Helping & Asking pack (helping_asking_01).
 * Words: עזרה (ezrah), צריך (tsarich), רוצה (rotzeh), יכול (yachol)
 */
const helpingAskingSentences = [
  {
    id: 'ha-1',
    translation: 'I need help',
    words: [
      { word: 'אני', source: 'connector' },
      { word: 'צריך', source: 'pack' },
      { word: 'עזרה', source: 'pack' },
    ],
    packIds: ['helping_asking_01'],
  },
  {
    id: 'ha-2',
    translation: 'I want and I can',
    words: [
      { word: 'אני', source: 'connector' },
      { word: 'רוצה', source: 'pack' },
      { word: 'ו', source: 'connector' },
      { word: 'אני', source: 'connector' },
      { word: 'יכול', source: 'pack' },
    ],
    packIds: ['helping_asking_01'],
  },
  {
    id: 'ha-3',
    translation: 'I can help',
    words: [
      { word: 'אני', source: 'connector' },
      { word: 'יכול', source: 'pack' },
      { word: 'לעזור', source: 'connector' },
    ],
    packIds: ['helping_asking_01'],
  },
  {
    id: 'ha-4',
    translation: 'I need and I want',
    words: [
      { word: 'אני', source: 'connector' },
      { word: 'צריך', source: 'pack' },
      { word: 'ו', source: 'connector' },
      { word: 'רוצה', source: 'pack' },
    ],
    packIds: ['helping_asking_01'],
  },
];

// ─── Cross-pack sentences (use words from multiple packs) ──

const crossPackSentences = [
  {
    id: 'xp-1',
    translation: 'Hello mom',
    words: [
      { word: 'שלום', source: 'pack' },
      { word: 'אמא', source: 'pack' },
    ],
    packIds: ['greetings_01', 'family_01'],
  },
  {
    id: 'xp-2',
    translation: 'Dad wants coffee',
    words: [
      { word: 'אבא', source: 'pack' },
      { word: 'רוצה', source: 'connector' },
      { word: 'קפה', source: 'pack' },
    ],
    packIds: ['family_01', 'food_01'],
  },
  {
    id: 'xp-3',
    translation: 'The family eats bread',
    words: [
      { word: 'ה', source: 'connector' },
      { word: 'משפחה', source: 'pack' },
      { word: 'אוכלת', source: 'connector' },
      { word: 'לחם', source: 'pack' },
    ],
    packIds: ['family_01', 'food_01'],
  },
  {
    id: 'xp-4',
    translation: 'The house is big and beautiful',
    words: [
      { word: 'ה', source: 'connector' },
      { word: 'בית', source: 'pack' },
      { word: 'גדול', source: 'pack' },
      { word: 'ו', source: 'connector' },
      { word: 'יפה', source: 'pack' },
    ],
    packIds: ['family_01', 'adjectives_01'],
  },
  {
    id: 'xp-5',
    translation: 'Hello, thank you, good',
    words: [
      { word: 'שלום', source: 'pack' },
      { word: 'תודה', source: 'pack' },
      { word: 'טוב', source: 'pack' },
    ],
    packIds: ['greetings_01', 'adjectives_01'],
  },
  {
    id: 'xp-6',
    translation: 'The apple is small and good',
    words: [
      { word: 'ה', source: 'connector' },
      { word: 'תפוח', source: 'pack' },
      { word: 'קטן', source: 'pack' },
      { word: 'ו', source: 'connector' },
      { word: 'טוב', source: 'pack' },
    ],
    packIds: ['food_01', 'adjectives_01'],
  },
  {
    id: 'xp-7',
    translation: 'Mom is happy at home',
    words: [
      { word: 'אמא', source: 'pack' },
      { word: 'שמח', source: 'pack' },
      { word: 'ב', source: 'connector' },
      { word: 'בית', source: 'pack' },
    ],
    packIds: ['family_01', 'feelings_01'],
  },
  {
    id: 'xp-8',
    translation: 'Who wants water?',
    words: [
      { word: 'מי', source: 'pack' },
      { word: 'רוצה', source: 'connector' },
      { word: 'מים', source: 'pack' },
    ],
    packIds: ['questions_01', 'food_01'],
  },
];

// ─── Master registry ───────────────────────────────────────

/**
 * All authored sentence banks, flattened into one array.
 */
export const allCuratedSentences = [
  ...greetingsSentences,
  ...familySentences,
  ...foodSentences,
  ...adjectivesSentences,
  ...pronounsSentences,
  ...pronouns2Sentences,
  ...family2Sentences,
  ...food2Sentences,
  ...atHomeSentences,
  ...weatherSentences,
  ...feelingsSentences,
  ...questionsSentences,
  ...conversationSentences,
  ...helpingAskingSentences,
  ...crossPackSentences,
];

// ─── Lookup helpers ────────────────────────────────────────

/**
 * Get all sentences that can be built from the given set of eligible pack IDs.
 * A sentence is eligible if ALL of its packIds are in the eligible set.
 *
 * @param {Set<string>} eligiblePackIds
 * @returns {Array<Object>}
 */
export function getSentencesForPacks(eligiblePackIds) {
  return allCuratedSentences.filter(sentence =>
    sentence.packIds.every(pid => eligiblePackIds.has(pid))
  );
}

/**
 * Get sentences for a single specific pack.
 *
 * @param {string} packId
 * @returns {Array<Object>}
 */
export function getSentencesForSinglePack(packId) {
  return allCuratedSentences.filter(sentence =>
    sentence.packIds.length === 1 && sentence.packIds[0] === packId
  );
}
