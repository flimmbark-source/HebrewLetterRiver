import type { LearningModule, GrammarPattern } from '../../types/modules';

/**
 * Module 1: Greetings & Introductions
 * Foundation module teaching basic greetings, introductions, and simple present tense
 */

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
  vocabTextId: 'module-1-vocab',
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
  vocabTextId: 'module-2-vocab',
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
  vocabTextId: 'module-3-vocab',
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
  vocabTextId: 'module-4-vocab',
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
