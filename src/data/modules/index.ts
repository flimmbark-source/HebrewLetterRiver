import type { LearningModule, VocabItem, GrammarPattern } from '../../types/modules';

/**
 * Module 1: Greetings & Introductions
 * Foundation module teaching basic greetings, introductions, and simple present tense
 */
const module1Vocab: VocabItem[] = [
  { id: 'shalom', hebrew: 'שלום', meaning: 'hello, peace', partOfSpeech: 'greeting' },
  { id: 'todah', hebrew: 'תודה', meaning: 'thank you', partOfSpeech: 'interjection' },
  { id: 'I', hebrew: 'אני', meaning: 'I', partOfSpeech: 'pronoun' },
  { id: 'you', hebrew: 'אתה/את', meaning: 'you (m/f)', partOfSpeech: 'pronoun' },
  { id: 'we', hebrew: 'אנחנו', meaning: 'we', partOfSpeech: 'pronoun' },
  { id: 'happy', hebrew: 'שמח', meaning: 'happy', partOfSpeech: 'adjective' },
  { id: 'new-f', hebrew: 'חדשה', meaning: 'new (f)', partOfSpeech: 'adjective' },
  { id: 'language', hebrew: 'שפה', meaning: 'language', partOfSpeech: 'noun' },
  { id: 'question', hebrew: 'שאלה', meaning: 'question', partOfSpeech: 'noun' },
  { id: 'answer', hebrew: 'תשובה', meaning: 'answer', partOfSpeech: 'noun' },
  { id: 'idea', hebrew: 'רעיון', meaning: 'idea', partOfSpeech: 'noun' },
  { id: 'today', hebrew: 'היום', meaning: 'today', partOfSpeech: 'adverb' },
  { id: 'here', hebrew: 'כאן', meaning: 'here', partOfSpeech: 'adverb' },
  { id: 'together', hebrew: 'יחד', meaning: 'together', partOfSpeech: 'adverb' },
  { id: 'want', hebrew: 'רוצה', meaning: 'want', partOfSpeech: 'verb' },
  { id: 'study', hebrew: 'לומדים', meaning: 'study, learn', partOfSpeech: 'verb' },
  { id: 'ask', hebrew: 'לשאול', meaning: 'to ask', partOfSpeech: 'verb' },
  { id: 'help', hebrew: 'עוזר', meaning: 'helps', partOfSpeech: 'verb' },
  { id: 'start', hebrew: 'להתחיל', meaning: 'to start', partOfSpeech: 'verb' },
];

const module1Grammar: GrammarPattern[] = [
  {
    id: 'simple-present',
    name: 'Simple Present with אני (I)',
    description: 'Use אני (ani) followed by a present tense verb or adjective to describe yourself',
    examples: [
      { hebrew: 'אני שמח', english: 'I am happy', highlightedWord: 'שמח' },
      { hebrew: 'אני רוצה', english: 'I want', highlightedWord: 'רוצה' },
      { hebrew: 'אני חדש', english: 'I am new', highlightedWord: 'חדש' },
    ]
  },
  {
    id: 'simple-present-plural',
    name: 'Simple Present with אנחנו (We)',
    description: 'Use אנחנו (anachnu) followed by plural present tense verbs',
    examples: [
      { hebrew: 'אנחנו לומדים', english: 'We learn', highlightedWord: 'לומדים' },
      { hebrew: 'אנחנו רוצים', english: 'We want', highlightedWord: 'רוצים' },
    ]
  },
  {
    id: 'verb-infinitive',
    name: 'Verb + Infinitive',
    description: 'Use a conjugated verb followed by infinitive form (ל + verb) to express wanting or needing to do something',
    examples: [
      { hebrew: 'אני רוצה לשאול', english: 'I want to ask', highlightedWord: 'לשאול' },
      { hebrew: 'אני רוצה להתחיל', english: 'I want to start', highlightedWord: 'להתחיל' },
    ]
  },
  {
    id: 'questions',
    name: 'Question Words',
    description: 'Common question words in Hebrew',
    examples: [
      { hebrew: 'מאיפה אתה?', english: 'Where are you from?', highlightedWord: 'מאיפה' },
      { hebrew: 'איך היום שלך?', english: 'How is your day?', highlightedWord: 'איך' },
    ]
  },
];

const module1: LearningModule = {
  id: 'module-1',
  title: 'Greetings & Introductions',
  description: 'Learn basic greetings, how to introduce yourself, and simple present tense',
  order: 1,
  vocab: module1Vocab,
  grammar: module1Grammar,
  sentenceIds: [
    'greetings-1',
    'greetings-2',
    'greetings-3',
    'greetings-4',
    'greetings-5',
    'greetings-6',
    'greetings-7',
    'greetings-8',
    'greetings-9',
    'greetings-10',
  ],
};

/**
 * Module 2: At Home
 * Building on Module 1, teaches home-related vocabulary and location phrases
 */
const module2Vocab: VocabItem[] = [
  { id: 'home', hebrew: 'בית', meaning: 'home, house', partOfSpeech: 'noun' },
  { id: 'family', hebrew: 'משפחה', meaning: 'family', partOfSpeech: 'noun' },
  { id: 'friend', hebrew: 'חבר', meaning: 'friend', partOfSpeech: 'noun' },
  { id: 'friends', hebrew: 'חברים', meaning: 'friends', partOfSpeech: 'noun' },
  { id: 'neighbor', hebrew: 'שכן', meaning: 'neighbor', partOfSpeech: 'noun' },
  { id: 'child', hebrew: 'ילד', meaning: 'child', partOfSpeech: 'noun' },
  { id: 'book', hebrew: 'ספר', meaning: 'book', partOfSpeech: 'noun' },
  { id: 'water', hebrew: 'מים', meaning: 'water', partOfSpeech: 'noun' },
  { id: 'coffee', hebrew: 'קפה', meaning: 'coffee', partOfSpeech: 'noun' },
  { id: 'quiet', hebrew: 'שקט', meaning: 'quiet', partOfSpeech: 'adjective' },
  { id: 'small', hebrew: 'קטן', meaning: 'small', partOfSpeech: 'adjective' },
  { id: 'full', hebrew: 'מלא', meaning: 'full', partOfSpeech: 'adjective' },
  { id: 'erev', hebrew: 'ערב', meaning: 'evening', partOfSpeech: 'noun' },
  { id: 'boker', hebrew: 'בוקר', meaning: 'morning', partOfSpeech: 'noun' },
  { id: 'day', hebrew: 'יום', meaning: 'day', partOfSpeech: 'noun' },
  { id: 'time', hebrew: 'זמן', meaning: 'time', partOfSpeech: 'noun' },
  { id: 'like', hebrew: 'אוהבים', meaning: 'like, love', partOfSpeech: 'verb' },
  { id: 'sit', hebrew: 'לשבת', meaning: 'to sit', partOfSpeech: 'verb' },
  { id: 'speak', hebrew: 'לדבר', meaning: 'to speak, talk', partOfSpeech: 'verb' },
  { id: 'need', hebrew: 'צריך', meaning: 'need', partOfSpeech: 'verb' },
  { id: 'read', hebrew: 'קורא', meaning: 'read', partOfSpeech: 'verb' },
  { id: 'live', hebrew: 'גר', meaning: 'live, reside', partOfSpeech: 'verb' },
];

const module2Grammar: GrammarPattern[] = [
  {
    id: 'possession',
    name: 'Possession (שלנו, שלי, שלו)',
    description: 'Use של (shel) + pronoun suffix to show possession',
    examples: [
      { hebrew: 'הבית שלנו', english: 'our home', highlightedWord: 'שלנו' },
      { hebrew: 'החדר שלו', english: 'his room', highlightedWord: 'שלו' },
      { hebrew: 'הרעיון שלי', english: 'my idea', highlightedWord: 'שלי' },
    ]
  },
  {
    id: 'location-prepositions',
    name: 'Location Prepositions',
    description: 'Prepositions like ב (in/at) and ליד (near) show location',
    examples: [
      { hebrew: 'בבית', english: 'at home', highlightedWord: 'בבית' },
      { hebrew: 'בחדר', english: 'in the room', highlightedWord: 'בחדר' },
      { hebrew: 'ליד הבית', english: 'near the home', highlightedWord: 'ליד' },
    ]
  },
  {
    id: 'yesh-li',
    name: 'Possession with יש (There is/have)',
    description: 'Use יש לי/לנו to express "I have" or "we have"',
    examples: [
      { hebrew: 'יש לי רעיון', english: 'I have an idea', highlightedWord: 'יש לי' },
      { hebrew: 'יש לנו מים', english: 'We have water', highlightedWord: 'יש לנו' },
    ]
  },
  {
    id: 'adjective-placement',
    name: 'Adjective Placement',
    description: 'Adjectives usually come after the noun they describe',
    examples: [
      { hebrew: 'בית שקט', english: 'quiet home', highlightedWord: 'שקט' },
      { hebrew: 'רעיון קטן', english: 'small idea', highlightedWord: 'קטן' },
    ]
  },
];

const module2: LearningModule = {
  id: 'module-2',
  title: 'At Home',
  description: 'Learn vocabulary about home, family, and daily life at home',
  order: 2,
  vocab: module2Vocab,
  grammar: module2Grammar,
  sentenceIds: [
    'home-1',
    'home-2',
    'home-3',
    'home-4',
    'home-5',
    'home-6',
    'home-7',
    'home-8',
    'home-9',
    'home-10',
  ],
  prerequisiteModuleId: 'module-1',
};

/**
 * Module 3: Food & Eating
 * Teaches food vocabulary and dining-related verbs
 */
const module3Vocab: VocabItem[] = [
  { id: 'food', hebrew: 'אוכל', meaning: 'food', partOfSpeech: 'noun' },
  { id: 'bread', hebrew: 'לחם', meaning: 'bread', partOfSpeech: 'noun' },
  { id: 'restaurant', hebrew: 'מסעדה', meaning: 'restaurant', partOfSpeech: 'noun' },
  { id: 'meal-of', hebrew: 'ארוחת', meaning: 'meal of', partOfSpeech: 'noun' },
  { id: 'warm', hebrew: 'חם', meaning: 'warm, hot', partOfSpeech: 'adjective' },
  { id: 'cold-pl', hebrew: 'קרים', meaning: 'cold (plural)', partOfSpeech: 'adjective' },
  { id: 'tasty', hebrew: 'טעים', meaning: 'tasty', partOfSpeech: 'adjective' },
  { id: 'fresh', hebrew: 'טרי', meaning: 'fresh', partOfSpeech: 'adjective' },
  { id: 'now', hebrew: 'עכשיו', meaning: 'now, right now', partOfSpeech: 'adverb' },
  { id: 'very', hebrew: 'מאוד', meaning: 'very', partOfSpeech: 'adverb' },
  { id: 'more', hebrew: 'עוד', meaning: 'more, another', partOfSpeech: 'adverb' },
  { id: 'please', hebrew: 'בבקשה', meaning: 'please', partOfSpeech: 'interjection' },
  { id: 'eat', hebrew: 'לאכול', meaning: 'to eat', partOfSpeech: 'verb' },
  { id: 'drink', hebrew: 'לשתות', meaning: 'to drink', partOfSpeech: 'verb' },
  { id: 'buy', hebrew: 'קונים', meaning: 'buy', partOfSpeech: 'verb' },
  { id: 'pay', hebrew: 'משלם', meaning: 'pay', partOfSpeech: 'verb' },
  { id: 'cook', hebrew: 'מבשל', meaning: 'cook', partOfSpeech: 'verb' },
  { id: 'order', hebrew: 'מזמינים', meaning: 'order', partOfSpeech: 'verb' },
];

const module3Grammar: GrammarPattern[] = [
  {
    id: 'present-progressive',
    name: 'Present Progressive (ongoing actions)',
    description: 'Hebrew uses the same form for simple present and present progressive',
    examples: [
      { hebrew: 'אני שותה קפה', english: 'I drink coffee / I am drinking coffee', highlightedWord: 'שותה' },
      { hebrew: 'אנחנו קונים לחם', english: 'We buy bread / We are buying bread', highlightedWord: 'קונים' },
    ]
  },
  {
    id: 'intensifiers',
    name: 'Intensifiers (מאוד)',
    description: 'Use מאוד (meod) after adjectives to mean "very"',
    examples: [
      { hebrew: 'טעים מאוד', english: 'very tasty', highlightedWord: 'מאוד' },
      { hebrew: 'חם מאוד', english: 'very hot', highlightedWord: 'מאוד' },
    ]
  },
  {
    id: 'quantifiers',
    name: 'Quantifiers (עוד, הרבה)',
    description: 'Words like עוד (more) and הרבה (a lot) express quantity',
    examples: [
      { hebrew: 'עוד מים', english: 'more water', highlightedWord: 'עוד' },
      { hebrew: 'הרבה אוכל', english: 'a lot of food', highlightedWord: 'הרבה' },
    ]
  },
  {
    id: 'prepositions-with',
    name: 'Preposition עם (with)',
    description: 'Use עם to express "with"',
    examples: [
      { hebrew: 'עם המשפחה', english: 'with the family', highlightedWord: 'עם' },
      { hebrew: 'עם חברים', english: 'with friends', highlightedWord: 'עם' },
    ]
  },
];

const module3: LearningModule = {
  id: 'module-3',
  title: 'Food & Eating',
  description: 'Learn vocabulary for food, dining, and expressing preferences',
  order: 3,
  vocab: module3Vocab,
  grammar: module3Grammar,
  sentenceIds: [
    'food-1',
    'food-2',
    'food-3',
    'food-4',
    'food-5',
    'food-6',
    'food-7',
    'food-8',
    'food-9',
    'food-10',
  ],
  prerequisiteModuleId: 'module-2',
};

/**
 * Module 4: Numbers & Time
 * Teaches time expressions and basic numbers
 */
const module4Vocab: VocabItem[] = [
  { id: 'tomorrow', hebrew: 'מחר', meaning: 'tomorrow', partOfSpeech: 'adverb' },
  { id: 'yesterday', hebrew: 'אתמול', meaning: 'yesterday', partOfSpeech: 'adverb' },
  { id: 'early', hebrew: 'מוקדם', meaning: 'early', partOfSpeech: 'adverb' },
  { id: 'late', hebrew: 'מאוחר', meaning: 'late', partOfSpeech: 'adverb' },
  { id: 'always', hebrew: 'תמיד', meaning: 'always', partOfSpeech: 'adverb' },
  { id: 'sometimes', hebrew: 'לפעמים', meaning: 'sometimes', partOfSpeech: 'adverb' },
  { id: 'tov', hebrew: 'טוב', meaning: 'good', partOfSpeech: 'adjective' },
  { id: 'city', hebrew: 'עיר', meaning: 'city', partOfSpeech: 'noun' },
  { id: 'meeting', hebrew: 'פגישה', meaning: 'meeting', partOfSpeech: 'noun' },
  { id: 'hour', hebrew: 'שעה', meaning: 'hour, o\'clock', partOfSpeech: 'noun' },
  { id: 'minutes', hebrew: 'דקות', meaning: 'minutes', partOfSpeech: 'noun' },
  { id: 'come', hebrew: 'באים', meaning: 'come', partOfSpeech: 'verb' },
  { id: 'arrive', hebrew: 'מגיעים', meaning: 'arrive', partOfSpeech: 'verb' },
  { id: 'wait', hebrew: 'מחכה', meaning: 'wait', partOfSpeech: 'verb' },
  { id: 'go', hebrew: 'הולך', meaning: 'go', partOfSpeech: 'verb' },
  { id: 'finish', hebrew: 'מסיימים', meaning: 'finish', partOfSpeech: 'verb' },
  { id: 'rest', hebrew: 'לנוח', meaning: 'to rest', partOfSpeech: 'verb' },
];

const module4Grammar: GrammarPattern[] = [
  {
    id: 'time-expressions',
    name: 'Time Expressions',
    description: 'Common words and phrases for expressing time',
    examples: [
      { hebrew: 'היום', english: 'today', highlightedWord: 'היום' },
      { hebrew: 'מחר', english: 'tomorrow', highlightedWord: 'מחר' },
      { hebrew: 'אתמול', english: 'yesterday', highlightedWord: 'אתמול' },
      { hebrew: 'בבוקר', english: 'in the morning', highlightedWord: 'בבוקר' },
    ]
  },
  {
    id: 'frequency-adverbs',
    name: 'Frequency Adverbs',
    description: 'Words that express how often something happens',
    examples: [
      { hebrew: 'תמיד', english: 'always', highlightedWord: 'תמיד' },
      { hebrew: 'לפעמים', english: 'sometimes', highlightedWord: 'לפעמים' },
    ]
  },
  {
    id: 'purpose-phrases',
    name: 'Purpose Phrases (כדי ל)',
    description: 'Use כדי + infinitive to express purpose (in order to)',
    examples: [
      { hebrew: 'הולך לבית כדי לנוח', english: 'going home in order to rest', highlightedWord: 'כדי לנוח' },
    ]
  },
  {
    id: 'motion-verbs',
    name: 'Motion Verbs',
    description: 'Verbs expressing movement and arrival',
    examples: [
      { hebrew: 'באים לעיר', english: 'coming to the city', highlightedWord: 'באים' },
      { hebrew: 'מגיעים מוקדם', english: 'arriving early', highlightedWord: 'מגיעים' },
      { hebrew: 'הולך לבית', english: 'going home', highlightedWord: 'הולך' },
    ]
  },
];

const module4: LearningModule = {
  id: 'module-4',
  title: 'Numbers & Time',
  description: 'Learn to talk about time, schedules, and when things happen',
  order: 4,
  vocab: module4Vocab,
  grammar: module4Grammar,
  sentenceIds: [
    'time-1',
    'time-2',
    'time-3',
    'time-4',
    'time-5',
    'time-6',
    'time-7',
    'time-8',
    'time-9',
    'time-10',
  ],
  prerequisiteModuleId: 'module-3',
};

/**
 * All learning modules in order
 */
export const learningModules: LearningModule[] = [
  module1,
  module2,
  module3,
  module4,
];

/**
 * Get a module by ID
 */
export function getModuleById(id: string): LearningModule | undefined {
  return learningModules.find(m => m.id === id);
}

/**
 * Get modules in learning path order
 */
export function getModulesInOrder(): LearningModule[] {
  return [...learningModules].sort((a, b) => a.order - b.order);
}
